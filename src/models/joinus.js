import mongoose from "mongoose";
const { Schema } = mongoose;

const joinUsSchema = new Schema(
  {
    name: {
      type: String,
    },
    mobile_number: {
      type: Number,
      required: true,
    },
    applying_for: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Use a unique model identifier
const modelName = "JoinUs";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const JoinUsModel = mongoose.model(modelName, joinUsSchema);

export default JoinUsModel;
