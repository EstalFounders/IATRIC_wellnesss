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
  // Tab-1 (homepage speciality tabs) presentation copy. `image` is the public
  // Firebase download URL (folder `${IMAGES_ROOT}/serviceImg`); `subheading` is
  // the English line under the tab title (kept as `subheading`, not `subHeading`,
  // because the panel, API payload and Tabs-1 already use this key).
  image: {
    type: String,
  },
  subheading: {
    type: String,
  },
  subheadingHi: {
    type: String,
  },
  descriptionHi: {
    type: String,
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