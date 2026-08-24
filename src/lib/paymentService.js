import { dbConnect } from "./db";
import Appointment from "../models/appointmentSchema";
import Payment from "../models/paymentSchema";
import Slot from "../models/slots";
import Doctor from "../models/doctorModel";
import Notification from "../models/NotificationSchema";
import { appointment_status, contact_no, payment_status } from "../constant";
import { getConfirmMessageBody } from "../../pages/api/utils/whatsappMessageBodies";
import { sendWhatsAppConfirmation } from "../../pages/api/lib/communication";
import { WHATSAPP_CONFIRMATION_TEMPLATE } from "../../pages/api/utils/constants";
import { formatPhoneNumber } from "../../pages/api/utils/commonmethod";
import { sendAdminNotification } from "../../pages/api/lib/sendNotification";
import { logErrorToGoogleSheet } from "../../pages/api/helper";

/**
 * Confirms an appointment ONLY after verified successful payment.
 * Sends the same WhatsApp confirmation flow used by the existing
 * booking logic (reuses existing helpers - no duplicate implementation).
 */
export async function confirmAppointmentAfterPayment({ paymentId }) {
  await dbConnect();

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  if (payment.status === payment_status.PAID) {
    return payment; // idempotent - already handled
  }

  const appointment = await Appointment.findById(payment.appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  payment.status = payment_status.PAID;
  payment.paidAt = new Date();
  await payment.save();

  appointment.status = appointment_status.confirmed;
  appointment.paymentId = payment._id;
  await appointment.save();

  const doctor = await Doctor.findById(appointment.doctorId);
  const docName = doctor?.name || "";
  const doctorMobileNo = doctor?.mobileNumber?.toString() || "";
  const patientMobileNo = appointment.patientMobNo?.toString() || "";

  console.log("Payment verified. Confirming appointment:", {
    appointmentId: String(appointment._id),
    paymentOrderId: payment.orderId,
    amount: payment.amount,
  });

  const confirmMessageBody = getConfirmMessageBody(
    appointment.appointmentTime,
    docName,
    appointment.name,
    appointment.consultationType,
    contact_no,
  );

  const patientWhatsAppNumber = formatPhoneNumber(patientMobileNo);
  const doctorWhatsAppNumber = formatPhoneNumber(doctorMobileNo);

  console.log("WhatsApp confirmation attempt after payment:", {
    appointmentId: String(appointment._id),
    patientNumber: patientWhatsAppNumber,
    doctorNumber: doctorWhatsAppNumber,
    patientMobileRaw: patientMobileNo,
    doctorMobileRaw: doctorMobileNo,
    template: WHATSAPP_CONFIRMATION_TEMPLATE,
    templateId: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
    confirmMessageBody,
  });

  // WhatsApp confirmation is best-effort: a failure here must never break
  // the already-verified payment/appointment confirmation response.
  try {
    await sendWhatsAppConfirmation(
      patientWhatsAppNumber,
      confirmMessageBody,
      WHATSAPP_CONFIRMATION_TEMPLATE,
    );
  } catch (waErr) {
    console.error("Patient WhatsApp confirmation failed (non-fatal):", waErr.message);
    await logErrorToGoogleSheet({
      apiName: "paymentService/confirmAppointmentAfterPayment",
      errorMessage: `Patient WhatsApp confirmation failed: ${waErr.message} ${
        waErr?.response?.data ? JSON.stringify(waErr.response.data) : ""
      }`,
      errorCode: "500",
      stackTrace: waErr.stack,
      requestPayload: {
        appointmentId: String(appointment._id),
        patientNumber: patientWhatsAppNumber,
        templateId: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
        phoneNumberId: process.env.FASTSMS_WA_PHONE_NUMBER_ID,
        confirmMessageBody,
      },
    });
  }

  try {
    await sendWhatsAppConfirmation(
      doctorWhatsAppNumber,
      confirmMessageBody,
      WHATSAPP_CONFIRMATION_TEMPLATE,
    );
  } catch (waErr) {
    console.error("Doctor WhatsApp confirmation failed (non-fatal):", waErr.message);
    await logErrorToGoogleSheet({
      apiName: "paymentService/confirmAppointmentAfterPayment",
      errorMessage: `Doctor WhatsApp confirmation failed: ${waErr.message} ${
        waErr?.response?.data ? JSON.stringify(waErr.response.data) : ""
      }`,
      errorCode: "500",
      stackTrace: waErr.stack,
      requestPayload: {
        appointmentId: String(appointment._id),
        doctorNumber: doctorWhatsAppNumber,
        templateId: process.env.FASTSMS_WA_TEMPLATE_BOOKING_ID,
        phoneNumberId: process.env.FASTSMS_WA_PHONE_NUMBER_ID,
        confirmMessageBody,
      },
    });
  }

  await Notification.create({
    title: "consultation-request",
    body: `Patient ${appointment.name} confirmed a ${appointment.consultationType} consultation.`,
    read: false,
  });

  try {
    await sendAdminNotification({
      title: "Consultation Confirmed",
      body: `Patient ${appointment.name} has confirmed a ${appointment.consultationType} consultation`,
    });
  } catch (notifErr) {
    console.error("FCM push notification failed:", notifErr.message);
  }

  return payment;
}

/**
 * Releases the slot when a payment fails or is cancelled so the
 * doctor/time is not permanently blocked.
 */
export async function releaseSlotForAppointment({ appointmentId }) {
  await dbConnect();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || !appointment.slotId) return;

  await Slot.findOneAndUpdate(
    { _id: appointment.slotId, doctorId: appointment.doctorId, isBooked: true },
    { isBooked: false },
    { new: true },
  );

  console.log("Slot released for appointment:", String(appointmentId));
}