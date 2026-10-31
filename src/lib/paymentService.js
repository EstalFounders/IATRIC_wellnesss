import { dbConnect } from "./db";
import Appointment from "../models/appointmentSchema";
import Payment from "../models/paymentSchema";
import Slot from "../models/slots";
import Doctor from "../models/doctorModel";
import Notification from "../models/NotificationSchema";
import {
  appointment_status,
  contact_no,
  payment_status,
  IS_NOW,
  IN_TWENTY_MINUTES_NOW,
} from "../constant";
import {
  getConfirmMessageBody,
  getReminderMessageBodyPatient,
  getReminderMessageBodyDoctor,
} from "../../pages/api/utils/whatsappMessageBodies";
import { sendWhatsAppConfirmation } from "../../pages/api/lib/communication";
import {
  WHATSAPP_CONFIRMATION_TEMPLATE,
  WHATSAPP_REMINDER_TEMPLATE_PATIENT,
  WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
} from "../../pages/api/utils/constants";
import { formatPhoneNumber } from "../../pages/api/utils/commonmethod";
import { sendAdminNotification } from "../../pages/api/lib/sendNotification";
import { logErrorToGoogleSheet } from "../../pages/api/helper";
import { doctorDisplayName } from "../utils/doctorName";

/**
 * Confirms an appointment ONLY after verified successful payment.
 * Sends the same WhatsApp confirmation flow used by the existing
 * booking logic (reuses existing helpers - no duplicate implementation).
 */
export async function confirmAppointmentAfterPayment({ paymentId }) {
  await dbConnect();

  // ── Guards before any WhatsApp send ──────────────────────────────
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  const appointment = await Appointment.findById(payment.appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  // ── Slot re-acquisition (late PAID webhook / status poll) ──────────
  // `releaseSlotForAppointment` hands the slot back on a failed/cancelled
  // attempt, so by the time a PAID event arrives the slot may already belong to
  // someone else. Confirming without re-locking would put two patients on the
  // same time (or resurrect a cancelled appointment), so the slot is re-acquired
  // first and the payment is flagged for a refund when it is gone.
  if (appointment.slotReleasedAt) {
    if (appointment.status === appointment_status.cancelled) {
      console.warn(
        "Payment verified for a cancelled appointment - not confirming:",
        String(appointment._id),
      );
      await flagPaymentForRefund(payment, "appointment cancelled after release");
      return payment;
    }

    const relocked = await Slot.findOneAndUpdate(
      {
        _id: appointment.slotId,
        doctorId: appointment.doctorId,
        isBooked: false,
      },
      { isBooked: true },
      { new: true },
    );

    if (!relocked) {
      console.error(
        "Payment verified but the slot is gone - flagging for refund:",
        String(appointment._id),
      );
      await flagPaymentForRefund(payment, "slot taken before confirmation");
      return payment;
    }

    // The slot is ours again: clear the marker so the confirmation below proceeds.
    appointment.slotReleasedAt = null;
  }

  const doctor = await Doctor.findById(appointment.doctorId);
  const docName = doctor?.name || "";
  // Every WhatsApp body below names the doctor to the patient (and to the
  // doctor), so it goes through the shared formatter. That formatter prints the
  // stored name verbatim - the title is part of the name - and only collapses
  // stray whitespace. `docName` itself stays exactly as stored because it is the
  // value written back/compared elsewhere.
  const docDisplayName = doctorDisplayName(docName);
  const doctorMobileNo = doctor?.mobileNumber?.toString() || "";
  const patientMobileNo = appointment.patientMobNo?.toString() || "";

  const patientWhatsAppNumber = formatPhoneNumber(patientMobileNo);
  const doctorWhatsAppNumber = formatPhoneNumber(doctorMobileNo);

  if (!patientWhatsAppNumber && !doctorWhatsAppNumber) {
    console.warn("Skipping WhatsApp: no valid patient/doctor numbers found", {
      appointmentId: String(appointment._id),
    });
  }

  // ── Persist verified state (always runs; DB writes are idempotent) ──
  payment.status = payment_status.PAID;
  payment.paidAt = new Date();
  // Backfill the bridged fields for older records so the "Now" check below works.
  if (!payment.appointmentTime && appointment.appointmentTime) {
    payment.appointmentTime = appointment.appointmentTime;
  }
  if (!payment.bookingMode && appointment.bookingMode) {
    payment.bookingMode = appointment.bookingMode;
  }
  await payment.save();

  appointment.status = appointment_status.confirmed;
  appointment.paymentId = payment._id;
  await appointment.save();

  console.log("Payment verified. Confirming appointment:", {
    appointmentId: String(appointment._id),
    paymentOrderId: payment.orderId,
    amount: payment.amount,
  });

  // A status poll on an already-confirmed, already-messaged appointment must not
  // resend the confirmations. `confirmationSentAt` is stamped only after every
  // send succeeded, so a partial failure is still healed by the next poll.
  if (appointment.confirmationSentAt) {
    console.log(
      "Confirmation messages already sent for appointment:",
      String(appointment._id),
    );
    return payment;
  }

  // Set by any failed send below: keeps `confirmationSentAt` unset so the next
  // status poll retries the messages that did not go out.
  let messagingFailed = false;

  const confirmMessageBody = getConfirmMessageBody(
    appointment.appointmentTime,
    docDisplayName,
    appointment.name,
    appointment.consultationType,
    contact_no,
  );

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
  if (patientWhatsAppNumber) {
    try {
      await sendWhatsAppConfirmation(
        patientWhatsAppNumber,
        confirmMessageBody,
        WHATSAPP_CONFIRMATION_TEMPLATE,
      );
    } catch (waErr) {
      messagingFailed = true;
      console.error(
        "Patient WhatsApp confirmation failed (non-fatal):",
        waErr.message,
      );
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
  } else {
    console.warn("Skipping patient WhatsApp confirmation (no number)", {
      appointmentId: String(appointment._id),
    });
  }

  if (doctorWhatsAppNumber) {
    try {
      await sendWhatsAppConfirmation(
        doctorWhatsAppNumber,
        confirmMessageBody,
        WHATSAPP_CONFIRMATION_TEMPLATE,
      );
    } catch (waErr) {
      messagingFailed = true;
      console.error(
        "Doctor WhatsApp confirmation failed (non-fatal):",
        waErr.message,
      );
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
  } else {
    console.warn("Skipping doctor WhatsApp confirmation (no number)", {
      appointmentId: String(appointment._id),
    });
  }

  // ---- "Now" appointments: also send the meeting-URL reminder (patient + doctor) ----
  // If the appointment is starting imminently, the user needs their meeting link
  // right away. The reminder cron only targets status OPEN, so paid/confirmed
  // "Now" bookings would never get their link otherwise.
  //
  // Priority 1: use the literal bookingMode bridged from the frontend at booking
  //             time → Payment (create-order/pay).
  // Priority 2: fall back to the 40-min time window for records created before
  //             the bookingMode bridge existed.
  // isNowAppointment:
  //   1. literal bookingMode "Now" / "in_twenty_minutes_now" (bridged from frontend)
  //   2. ALWAYS check appointment.appointmentTime — if the slot starts within
  //      the 40-min window, send the meeting-URL reminder right away.
  const NOW_WINDOW_MINUTES = 40;
  const appointmentStartsWithinWindow =
    appointment.appointmentTime &&
    new Date(appointment.appointmentTime).getTime() - Date.now() <=
      NOW_WINDOW_MINUTES * 60 * 1000;

  let isNowAppointment = false;
  if (payment.bookingMode === IS_NOW) {
    isNowAppointment = true;
  } else if (payment.bookingMode === IN_TWENTY_MINUTES_NOW) {
    isNowAppointment = true;
  } else if (appointmentStartsWithinWindow) {
    isNowAppointment = true;
  }

  console.log("Is Now appointment (within 40 min):", isNowAppointment, {
    bookingMode: payment.bookingMode,
    appointmentTime: appointment.appointmentTime,
    appointmentStartsWithinWindow,
  });
  if (isNowAppointment) {
    console.log("Now appointment: sending meeting URL reminder after payment", {
      appointmentId: String(appointment._id),
      patientMeetingUrl: appointment.patientMeetingUrl,
      doctorMeetingUrl: appointment.doctorMeetingUrl,
    });

    const reminderPatientBody = getReminderMessageBodyPatient(
      docDisplayName,
      appointment.name,
      confirmMessageBody.appointment_date,
      confirmMessageBody.appointment_time,
      appointment.patientMeetingUrl,
    );

    const reminderDoctorBody = getReminderMessageBodyDoctor(
      docDisplayName,
      appointment.name,
      confirmMessageBody.appointment_date,
      confirmMessageBody.appointment_time,
      appointment.doctorMeetingUrl,
    );

    try {
      await sendWhatsAppConfirmation(
        patientWhatsAppNumber,
        reminderPatientBody,
        WHATSAPP_REMINDER_TEMPLATE_PATIENT,
      );
    } catch (waErr) {
      messagingFailed = true;
      console.error(
        "Patient Now-appointment reminder failed (non-fatal):",
        waErr.message,
      );
      await logErrorToGoogleSheet({
        apiName: "paymentService/confirmAppointmentAfterPayment",
        errorMessage: `Patient Now-appointment reminder failed: ${waErr.message} ${
          waErr?.response?.data ? JSON.stringify(waErr.response.data) : ""
        }`,
        errorCode: "500",
        stackTrace: waErr.stack,
        requestPayload: {
          appointmentId: String(appointment._id),
          patientNumber: patientWhatsAppNumber,
          templateId: process.env.FASTSMS_WA_TEMPLATE_REMINDER_PATIENT_ID,
          phoneNumberId: process.env.FASTSMS_WA_PHONE_NUMBER_ID,
          reminderPatientBody,
        },
      });
    }

    try {
      await sendWhatsAppConfirmation(
        doctorWhatsAppNumber,
        reminderDoctorBody,
        WHATSAPP_REMINDER_TEMPLATE_DOCTOR,
      );
    } catch (waErr) {
      messagingFailed = true;
      console.error(
        "Doctor Now-appointment reminder failed (non-fatal):",
        waErr.message,
      );
      await logErrorToGoogleSheet({
        apiName: "paymentService/confirmAppointmentAfterPayment",
        errorMessage: `Doctor Now-appointment reminder failed: ${waErr.message} ${
          waErr?.response?.data ? JSON.stringify(waErr.response.data) : ""
        }`,
        errorCode: "500",
        stackTrace: waErr.stack,
        requestPayload: {
          appointmentId: String(appointment._id),
          doctorNumber: doctorWhatsAppNumber,
          templateId: process.env.FASTSMS_WA_TEMPLATE_REMINDER_DOCTOR_ID,
          phoneNumberId: process.env.FASTSMS_WA_PHONE_NUMBER_ID,
          reminderDoctorBody,
        },
      });
    }
  }

  // The meeting-link messages above use the same reminder templates as the
  // 20-minute reminder job, so they are stamped: the job then skips this
  // appointment instead of sending the same reminder twice.
  if (isNowAppointment && !messagingFailed) {
    appointment.reminderSentAt = appointment.reminderSentAt || new Date();
    await appointment.save();
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

  // Stamped only when every send above succeeded, so a later status poll neither
  // duplicates the messages nor skips the ones that failed.
  if (!messagingFailed) {
    appointment.confirmationSentAt = new Date();
    await appointment.save();
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

  const released = await Slot.findOneAndUpdate(
    { _id: appointment.slotId, doctorId: appointment.doctorId, isBooked: true },
    { isBooked: false },
    { new: true },
  );

  // Marks the slot as given back, so a PAID event that arrives late re-acquires it
  // (or is flagged for a refund) instead of confirming over someone else's slot.
  appointment.slotReleasedAt = new Date();
  await appointment.save();

  console.log("Slot released for appointment:", String(appointmentId), {
    slotWasBooked: Boolean(released),
  });
}

/**
 * Marks a verified payment for manual refund when the appointment it belongs to
 * can no longer be honoured (its slot was handed back and taken by someone else,
 * or the appointment was cancelled). The appointment is never confirmed here -
 * the decision belongs to the ops team - but a trail is left in the panel
 * notifications and in the error sheet.
 *
 * @param {object} payment - The Payment document (already loaded).
 * @param {string} reason - Short human readable reason, used in the logs.
 */
async function flagPaymentForRefund(payment, reason) {
  payment.status = payment_status.REFUND_PENDING;
  await payment.save();

  try {
    await Notification.create({
      title: "refund-pending",
      body: `Payment ${payment.orderId} needs a refund: ${reason}.`,
      read: false,
    });
  } catch (notifErr) {
    console.error("Refund notification failed:", notifErr.message);
  }

  await logErrorToGoogleSheet({
    apiName: "paymentService/confirmAppointmentAfterPayment",
    errorMessage: `Payment verified but the appointment cannot be confirmed: ${reason}`,
    errorCode: "409",
    requestPayload: {
      orderId: payment.orderId,
      appointmentId: payment.appointmentId ? String(payment.appointmentId) : "",
      amount: payment.amount,
    },
  });
}
