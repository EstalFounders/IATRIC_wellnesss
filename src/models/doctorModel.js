import mongoose from "mongoose";

const { Schema } = mongoose;

const doctorSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    // Optional on the super-admin "Add Doctor" form. NOTE: `unique` was removed
    // on purpose — a unique index on gender made it impossible to register a
    // second doctor of the same gender.
    required: false,
  },
  mobileNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  expertise: {
    type: String,
    required: [true, "Area of expertise is required"],
  },
  degree: {
    type: String,
    required: [true, "Degree is required"],
  },
  language: {
    type: String,
    required: [true, "Language is required"],
    trim: true,
  },
  workDays: {
    type: String,
    required: [true, "Working days is required"],
  },
  overview: {
    type: String,
    required: true,
  },
  workExperience: {
    type: String,
    required: true,
  },
  consultationType: {
    type: Array,
    required: true,
  },
  serviceOffered: {
    type: Array,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  educationTraining: {
    // Repeatable ("MBBS - Johns Hopkins University"). Optional on the
    // super-admin "Add Doctor" form; stored as an array of trimmed strings so
    // one doctor can carry several degrees/trainings.
    type: [String],
    default: [],
    required: false,
  },
  password: {
    type: String,
    // Optional on the super-admin "Add Doctor" form. A doctor created without a
    // password simply cannot log in until one is set.
    required: false,
  },
  profilePictureUrl: {
    type: String,
    required: false,
  },
  diplomasCertificatesUrls: {
    type: Array,
    required: false,
  },
  doctorStampUrl: {
    type: String,
    required: false,
  },
  doctorSignatureUrl: {
    type: String,
    required: false,
  },
  doctorType: {
    type: String,
    required: [true, "Doctor type is required"],
  },
  price: {
    type: Number,
    // Optional on the super-admin "Add Doctor" form.
    required: false,
  },
  slotStartTime: {
    type: Date,
  },
  slotEndTime: {
    type: Date,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  isActive: { type: Boolean, default: true },
  unavailableDates: { type: [String], default: [] },
  doctorShare: { type: Number, default: 0 }
});

// Check if the model already exists to prevent overwriting
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;
