import mongoose from "mongoose";
const { Schema } = mongoose;

const newLabSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  location_offered: {
    type: Array,
    required: true,
  },
  mobile_number: {
    type: Number,
    required: true,
  },
  tests_offered: {
    type: Array,
    required: true,
  },
  isActive: { type: Boolean, default: true },
});

// Use a unique model identifier
const modelName = "newLab";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const NewLabSchema = mongoose.model(modelName, newLabSchema);

export default NewLabSchema;
