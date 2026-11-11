import { dbConnect } from "../../../src/lib/db";
import Payment from "../../../src/models/paymentSchema";
import Appointment from "../../../src/models/appointmentSchema";
import Doctor from "../../../src/models/doctorModel";
import { payment_status } from "../../../src/constant";
import { getCashfreeOrderStatus } from "../../../src/lib/cashfree";
import {
  confirmAppointmentAfterPayment,
  releaseSlotForAppointment,
} from "../../../src/lib/paymentService";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "orderId is required" });
  }

  // Declared outside the try so the catch below can distinguish "verification
  // failed" from "verification succeeded but the confirmation bookkeeping did not
  // finish" - the money is captured in the second case, so it must not be reported
  // as a failure.
  let payment = null;

  try {
    await dbConnect();

    payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const appointmentId = payment.appointmentId
      ? String(payment.appointmentId)
      : null;

    if (payment.status === payment_status.PAID) {
      // Payment is already PAID — ensure the appointment confirmation
      // (status -> CONFIRMED + WhatsApp) is fully completed/healed.
      // This is a no-op if the whole job is already done (idempotent),
      // but re-runs the confirmation flow if it was only partially completed
      // (e.g. a crash mid-way or a manually-marked-PAID payment for testing).
      await confirmAppointmentAfterPayment({ paymentId: payment._id });

      return res.status(200).json({
        success: true,
        status: payment_status.PAID,
        orderId,
        appointmentId,
        amount: payment.amount,
        // Offer details: the discounted amount only exists once the payment is
        // reconciled (see applyOfferToAppointment in paymentService).
        ...(await getOfferFields(appointmentId)),
        // The booking summary is shown on the success screen, so it is answered
        // here to save the page a second round trip.
        booking: await getBookingFields(appointmentId),
      });
    }

    const cashfreeOrder = await getCashfreeOrderStatus(orderId);
    const cfStatus = cashfreeOrder?.order_status;

    console.log("Cashfree order status check:", { orderId, cfStatus });

    if (cfStatus === "PAID") {
      console.log("payment/status: Cashfree order PAID - confirming appointment", {
        orderId,
        appointmentId,
        paymentId: String(payment._id),
      });
      await confirmAppointmentAfterPayment({ paymentId: payment._id });
      return res.status(200).json({
        success: true,
        status: payment_status.PAID,
        orderId,
        appointmentId,
        amount: payment.amount,
        ...(await getOfferFields(appointmentId)),
        booking: await getBookingFields(appointmentId),
      });
    }

    if (cfStatus === "FAILED" || cfStatus === "CANCELLED") {
      payment.status =
        cfStatus === "FAILED" ? payment_status.FAILED : payment_status.CANCELLED;
      await payment.save();
      await releaseSlotForAppointment({ appointmentId: payment.appointmentId });
      return res.status(200).json({
        success: false,
        status: payment.status,
        orderId,
        appointmentId,
        message: "Payment was not completed",
      });
    }

    return res.status(200).json({
      success: false,
      status: payment_status.PAYMENT_PENDING,
      orderId,
      appointmentId,
      message: "Payment is being verified. Please wait...",
    });
  } catch (error) {
    // Mongoose ValidationError paths are not part of `message`, and a generic
    // "validation failed" hides which field blocked the confirmation.
    const validationPaths = Object.keys(error?.errors || {});
    console.error("payment/status error:", error.message, {
      orderId,
      validationPaths,
    });
    await logErrorToGoogleSheet({
      apiName: "payment/status",
      errorMessage: validationPaths.length
        ? `${error.message} (fields: ${validationPaths.join(", ")})`
        : error.message || "Unable to verify payment",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { orderId, validationPaths },
    });

    // Cashfree already captured the money (the Payment row is PAID): only the
    // appointment bookkeeping failed. Answering 500 here would tell the patient
    // "Unable to verify payment" for a payment that went through, so report the
    // verified state and flag the pending confirmation - the next status poll (and
    // the webhook) retries it.
    if (payment?.status === payment_status.PAID) {
      console.warn(
        "payment/status: payment is PAID but confirmation is incomplete - reporting success with confirmationPending",
        { orderId, appointmentId: String(payment.appointmentId || "") },
      );
      return res.status(200).json({
        success: true,
        status: payment_status.PAID,
        orderId,
        appointmentId: payment.appointmentId
          ? String(payment.appointmentId)
          : null,
        amount: payment.amount,
        confirmationPending: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please try again.",
    });
  }
}

/**
 * Offer figures for the thank-you page. The appointment is the source of truth
 * (the payment row only knows the list amount), so it is read here after
 * confirmation. Returns an empty object if the appointment is missing, keeping
 * the response backwards compatible.
 */
async function getOfferFields(appointmentId) {
  if (!appointmentId) return {};

  const appointment = await Appointment.findById(appointmentId)
    .select("consultationprice amountAfterOffer discountAmount offerCode")
    .lean();

  if (!appointment) return {};

  return {
    consultationprice: appointment.consultationprice ?? null,
    amountAfterOffer: appointment.amountAfterOffer ?? null,
    discountAmount: appointment.discountAmount ?? 0,
    offerCode: appointment.offerCode ?? null,
  };
}

/**
 * The appointment summary displayed on /payment/thankyou, i.e. only after the
 * money is captured. The appointment is the source of truth for what was booked
 * (name, mobile, speciality, consultation type and time) - the payment row does
 * not carry them. Returns null when the appointment is missing, keeping the
 * response backwards compatible.
 */
async function getBookingFields(appointmentId) {
  if (!appointmentId) return null;

  const appointment = await Appointment.findById(appointmentId)
    .select(
      "name patientMobNo serviceType consultationType appointmentTime bookingMode doctorId",
    )
    .lean();

  if (!appointment) return null;

  // `doctorId` is a reference - the summary shows the doctor's name, which the
  // booking form has from the doctors list before the appointment exists.
  let doctorName = "";
  if (appointment.doctorId) {
    const doctor = await Doctor.findById(appointment.doctorId)
      .select("name")
      .lean();
    doctorName = doctor?.name || "";
  }

  return {
    patientName: appointment.name || "",
    // Stored as a Number in the schema; the page renders it as a string.
    mobileNumber: appointment.patientMobNo
      ? String(appointment.patientMobNo)
      : "",
    // Undefined for appointments created before the field was persisted - the
    // page renders a dash instead of inventing a speciality.
    speciality: appointment.serviceType || "",
    doctorName,
    consultationType: appointment.consultationType || "",
    appointmentTime: appointment.appointmentTime || null,
    bookingMode: appointment.bookingMode || null,
  };
}
