import { name } from "@stream-io/video-react-sdk";
import mongoose from "mongoose";
const { Schema } = mongoose;

const serviceOfferedSchema = new Schema({
  name: {
    type: String,
    required: true,
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
  isActive: {
    type: Boolean,
    required: true,
    default: true,
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
