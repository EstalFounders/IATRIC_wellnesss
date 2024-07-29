// models/appointmentModel.js
import mongoose from "mongoose";

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
    enum: ["Call", "Video", "Home visit", "Clinic"],
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "open",
    enum: ["open", "completed", "cancelled"],
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

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
