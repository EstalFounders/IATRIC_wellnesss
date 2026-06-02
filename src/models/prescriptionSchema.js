import mongoose from "mongoose";

const prescriptionMedicineSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
  quantity: { type: Number },
}, { _id: false });

const prescribedTestsSchema = new mongoose.Schema({
  testName: { type: Array, required: true },
  instructions: { type: String },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: false },

  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  doctorName: { type: String, required: true },
  doctorEmail: { type: String },
  doctorPhone: { type: String },
  doctorRegistrationNo: { type: String },
  doctorSpeciality: { type: String },
  doctorStampUrl: { type: String },
  doctorSignatureUrl: { type: String },

  patientId: { type: mongoose.Schema.Types.ObjectId, required: false },
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  patientGender: { type: String },
  patientPhone: { type: String },
  patientEmail: { type: String },
  patientAddress: { type: String },

  chiefComplaints: [{ type: String }],
  diagnosis: { type: String },
  medicalHistory: [{ type: String }],
  allergies: [{ type: String }],

  medicines: [prescriptionMedicineSchema],
  tests: [prescribedTestsSchema],

  advice: { type: String },
  followUpDate: { type: Date },
  notes: { type: String },

  prescriptionPdfUrl: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

export default Prescription;