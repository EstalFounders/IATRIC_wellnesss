import mongoose from "mongoose";
const { Schema } = mongoose;

const serviceOfferedSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  fee: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  hsn_percentage: {
    type: Number,
    required: true,
  },
  hsn_code: {
    type: String,
    required: true,
  },
  share: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  platformfee: {
    type: Number,
    required: true,
  },
  processingfee: {
    type: Number,
    required: true,
  },
  freight: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  categoryType: {
    type: String,
    enum: ["MAJOR", "SUB"],
    default: "MAJOR",
  },
});

// Use a unique model identifier
const modelName = "servicesoffered";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const ServiceOffered = mongoose.model(modelName, serviceOfferedSchema);

export default ServiceOffered;