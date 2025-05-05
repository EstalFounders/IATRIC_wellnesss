import mongoose from "mongoose";

const DeductionSchema = new mongoose.Schema({
  doctorShare: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  paymentProcessingFee: { type: Number, required: true },
});

// Use a unique model identifier
const modelName = 'Deductions';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Deductions = mongoose.model(modelName, DeductionSchema);

export default Deductions;

