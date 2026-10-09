import mongoose from "mongoose";

// One cell of the super-admin "fees by doctor" matrix: the amount a *specific*
// doctor charges for a *specific* consultation type.
//
// `typeKey` points at ConsultationFees.key (never a display name), so renaming a
// type in the panel carries every fee with it.
//
// A missing row means "inherit": the type's default fee applies and, when that
// is empty too, the consultation resolves to ₹0 (free, still bookable). Deleting
// a row is therefore how a cell is reset back to the inherited default.
//
// The fees live in their own collection rather than on the Doctor document on
// purpose: the doctor is written by the multipart flows
// (pages/api/addDoctor.js POST/PUT build `updateData` from the whole form
// spread) and by the doctor's own profile panel, so an embedded array risks
// being clobbered by an unrelated save.
const DoctorConsultationFeeSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    typeKey: {
      type: String,
      required: true,
      trim: true,
    },
    // Rupees. Always an explicit amount here - a row only exists when the admin
    // overrode the type default, so there is no null state to store.
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// One cell per doctor + type; the bulk PUT upserts against this index.
DoctorConsultationFeeSchema.index({ doctorId: 1, typeKey: 1 }, { unique: true });

const modelName = "DoctorConsultationFee";

if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

const DoctorConsultationFee = mongoose.model(
  modelName,
  DoctorConsultationFeeSchema
);

export default DoctorConsultationFee;
