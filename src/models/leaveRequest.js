import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveRequestSchema = new Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: false,
  },
  status: { type: String, default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date }
});

// Use a unique model identifier
const modelName = "LeaveRequest";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const LeaveRequestSchema = mongoose.model(modelName, leaveRequestSchema);

export default LeaveRequestSchema;
