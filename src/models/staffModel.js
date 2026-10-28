import mongoose from "mongoose";

const { Schema } = mongoose;

// Staff member profile (added from the admin panel). Only `name` and `jobTitle`
// are required; the rest is optional free text. `profilePictureUrl` holds the
// Firebase Storage URL of the uploaded profile picture.
const staffSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    bio: { type: String, required: false, trim: true },
    experience: { type: String, required: false, trim: true },
    education: { type: String, required: false, trim: true },
    profilePictureUrl: { type: String, required: false, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Reuse the compiled model on hot reload (same pattern as doctorModel).
const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
