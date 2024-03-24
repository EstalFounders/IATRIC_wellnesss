import mongoose from "mongoose";
const { Schema } = mongoose;



const doctorSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    // trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true
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

  workExperience: {
    type: String,
    required: true,
  },
  consultationType: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },

  educationTraining: {
    type: String,
    required: [true, "eduction&training is required"],
  },
  password: {
    type: String,
    required: true
  },
  profilePictureUrl: {
    type: String,
    required: [true, "Doctor picture is required"],
  },
  diplomasCertificatesUrls: {
    type: Array,
    required: [true, "Doctor certificate is required"],
  },
  doctorStampUrl: {
    type: String,
    required: [true, "Doctor stamp is required"],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
});

const Doctor =
  mongoose.models.doctorSchema || mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
