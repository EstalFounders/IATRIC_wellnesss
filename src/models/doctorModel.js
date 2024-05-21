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
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  educationTraining: {
    type: String,
    required: [true, "Education and training are required"],
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
  doctorSignatureUrl: {
    type: String,
    required: [true, "Doctor signature is required"],
  },
  slots: [{ type: Schema.Types.ObjectId, ref: 'Slot' }],
  joiningDate: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent overwriting
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;
