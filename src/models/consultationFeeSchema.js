import mongoose from "mongoose";

const ConsultationFeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fee: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});
const modelName = "ConsultationFees";

if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const ConsultationFee = mongoose.model(modelName, ConsultationFeeSchema)

export default ConsultationFee;
