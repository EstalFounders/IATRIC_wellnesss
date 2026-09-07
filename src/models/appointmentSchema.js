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
  invoiceId: {
    type: String,
    default: "",
  },
  serviceType: {
    type: String,
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