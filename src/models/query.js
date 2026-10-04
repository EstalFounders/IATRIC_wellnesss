import mongoose from "mongoose";
const { Schema } = mongoose;

const querySchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    // Deliberately optional: the contacts page collects a single
    // "phone or email" value and POST /api/userQuery splits it into either
    // `email` or `mobile_number`, so neither of them can be required any more
    // (older callers such as Demo5About2 still send `mobile_number` alone).
    mobile_number: {
      type: Number,
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
