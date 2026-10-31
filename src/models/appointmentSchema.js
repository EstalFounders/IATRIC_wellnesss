// models/appointmentModel.js
import mongoose from "mongoose";
import { appointment_status } from "../constant";

const appointmentSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  slotId: {
    type: String,
    required: true,
  },
  symptoms: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  patientMobNo: {
    type: Number,
    required: true,
  },
  consultationType: {
    type: String,
    required: true,
  },
  consultationprice: {
    type: Number,
    required: true,
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  // Literal booking mode from the frontend:
  // "Now" | "in_twenty_minutes_now" | "ChooseTime"
  // This is the bridge value copied onto Payment at payment-creation time
  // so paymentService can detect "Now"-type appointments reliably.
  bookingMode: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    default: appointment_status.pending,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    default: null,
  },
  patientMeetingUrl: {
    type: String,
  },
  doctorMeetingUrl: {
    type: String,
  },
  prescriptionUrl: {
    type: String,
  },
  // Public Firebase Storage download URL of the consultation recording
  // (audio+video mixed by the meeting room). Written by pages/api/recording.js
  // once the doctor's browser finishes uploading the blob; empty until then.
  recordingURL: {
    type: String,
    default: "",
  },
  invoiceId: {
    type: String,
    default: "",
  },
  serviceType: {
    type: String,
  },
  // Set when the reserved slot has been handed back (failed/cancelled payment or
  // a cancellation). A late PAID webhook/status poll must re-acquire the slot
  // before the appointment can be confirmed - see
  // paymentService.confirmAppointmentAfterPayment.
  slotReleasedAt: {
    type: Date,
    default: null,
  },
  // Stamped once the confirmation WhatsApps went out, so repeated payment-status
  // polls do not resend them (a poll on an already-PAID payment re-runs the
  // confirmation flow to heal partial states).
  confirmationSentAt: {
    type: Date,
    default: null,
  },
  // Stamped once the 20-minute reminder WhatsApps went out (the reminder job runs
  // repeatedly inside the 20-minute window).
  reminderSentAt: {
    type: Date,
    default: null,
  },
});

// Use a unique model identifier
const modelName = "Appointment";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;