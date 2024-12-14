import mongoose from "mongoose";

const DeductionSchema = new mongoose.Schema({
  doctorShare: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  paymentProcessingFee: { type: Number, required: true },
});

export default mongoose.models.Deduction || mongoose.model("Deductions", DeductionSchema);
