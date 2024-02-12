import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    // trim: true
  },

  expertise: {
    type: String,
    required: [true, "Area of expertise is required"],
    // trim: true
  },

  degree: {
    type: String,
    required: [true, "Degree is required"],
    // trim: true
  },
  language: {
    type: String,
    required: [true, "language is required"],
    unique: true,
    trim: true,
  },

  workDays: {
    type: String,
    required: [true, "working days is required"],
  },
  overview: {
    type: String,
    required: true,
  },

  educationTraining: {
    type: String,
    required: [true, "eduction&training is required"],
  },
  profilePictureUrl: {
    type: String,
    required: [true, "Doctor picture is required"],
  },
  diplomasCertificatesUrls: {
    type: Array,
    required: [true, "Doctor certificate is required"],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
});

const Doctor =
  mongoose.models.doctorSchema || mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
