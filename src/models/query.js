import mongoose from "mongoose";
const { Schema } = mongoose;

const querySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    mobile_number: {
      type: Number,
      required: true,
    },
    visited_before: {
      type: String,
      default: false,
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
const modelName = "Query";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Query = mongoose.model(modelName, querySchema);

export default Query;
