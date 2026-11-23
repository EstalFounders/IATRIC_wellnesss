/**
 * Appointment lifecycle helpers shared by the server code paths that finish a
 * consultation.
 *
 * A consultation counts as finished only when the prescription was generated
 * *and* handed to the patient (WhatsApp delivery succeeded), so the status flip
 * is a separate, explicit step the caller performs after the send - never as a
 * side effect of saving the PDF. `status: COMPLETED` is what makes the booking
 * billable afterwards (`src/lib/invoice/billing.js` only bills COMPLETED
 * consultations), so flipping it too early would raise invoices for calls that
 * never happened.
 */
import mongoose from "mongoose";
import Appointment from "../models/appointmentSchema";
import { appointment_status } from "../constant";
import { logErrorToGoogleSheet } from "../../pages/api/helper";

const validId = (value) => Boolean(value) && mongoose.Types.ObjectId.isValid(value);

/**
 * Mark an appointment COMPLETED, optionally storing the prescription PDF URL in
 * the same write.
 *
 * Never throws: a booking-status problem must not fail the prescription request
 * the doctor already sent. The caller gets `{ appointment, skipped, error }` and
 * can report the outcome.
 *
 *   skipped: "invalid_id"         - manual prescriptions carry a fabricated id
 *                                   (`prescriptionComp.js`), nothing to update.
 *   skipped: "not_found"          - the booking no longer exists.
 *   skipped: "cancelled"          - a cancelled consultation is never completed.
 */
export async function markAppointmentCompleted(appointmentId, options = {}) {
  const { prescriptionUrl = "", source = "" } = options || {};

  if (!validId(appointmentId)) return { appointment: null, skipped: "invalid_id" };

  try {
    const update = { status: appointment_status.completed };
    if (prescriptionUrl) update.prescriptionUrl = prescriptionUrl;

    // The cancelled check lives in the filter (not in a read-then-write) so a
    // concurrent cancellation cannot be overwritten by a late prescription send.
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, status: { $ne: appointment_status.cancelled } },
      { $set: update },
      { new: true },
    ).lean();

    if (appointment) return { appointment, skipped: "", error: null };

    // Nothing was updated: distinguish "gone" from "cancelled" for the logs.
    const existing = await Appointment.findById(appointmentId).select("status").lean();
    return {
      appointment: null,
      skipped: existing ? "cancelled" : "not_found",
      error: null,
    };
  } catch (error) {
    console.error("Failed to mark appointment completed:", error);
    await logErrorToGoogleSheet({
      apiName: "appointmentStatus - markAppointmentCompleted",
      errorMessage: error.message || "Failed to mark appointment completed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId, prescriptionUrl, source },
    });
    return { appointment: null, skipped: "", error };
  }
}
