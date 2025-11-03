import mongoose from "mongoose";

const { Schema } = mongoose;

const DocDetailsChangeReqSchema = new Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  updatedFields: { type: Object, required: true }, // The fields the doctor wants to update
  status: { type: String, default: "pending" }, // "pending", "approved", "rejected"
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date }
});

const modelName = "DocDetailsChangeRequest";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}
// Check if the model already exists to prevent overwriting
const DoctorDetailsChangeReq = mongoose.model(
  modelName,
  DocDetailsChangeReqSchema
);

export default DoctorDetailsChangeReq;
