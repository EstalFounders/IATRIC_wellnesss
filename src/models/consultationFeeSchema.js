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

export default mongoose.models.Consultation ||
  mongoose.model(modelName, ConsultationFeeSchema);
