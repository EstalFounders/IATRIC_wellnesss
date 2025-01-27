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
    required: true,
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
  status: {
    type: String,
    required: true,
    default: appointment_status.open,
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
});

// Use a unique model identifier
const modelName = 'Appointment';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
