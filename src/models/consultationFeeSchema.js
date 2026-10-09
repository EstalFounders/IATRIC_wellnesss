import mongoose from "mongoose";

// The consultation *types* the panel manages (five are seeded: audio, video,
// clinic, home_visit, other - see src/utils/consultationFee.js).
//
// `key` is the stable identity every other subsystem matches on (doctor docs,
// bookings, payments, icons); `name` is pure display copy, so "Other" can be
// renamed at any time without breaking a single fee lookup. `fee` is the type
// *default*: a doctor with no override of their own charges this amount, and
// when it is empty as well the consultation resolves to ₹0 (free, still
// bookable) - the resolution order lives in src/utils/consultationFee.js.
const ConsultationFeeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Rupees. `null` = no type default configured. Stored as a Number; the legacy
  // documents held a String ("198") and are normalised by
  // scripts/seedConsultationTypes.js.
  fee: {
    type: Number,
    default: null,
    min: 0,
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  // The four fixed types can be renamed but not deleted, so a booking type can
  // never disappear out from under appointments that already reference it.
  // "other" and every custom_* row are freely editable/deletable.
  isSystem: { type: Boolean, default: false },
});
const modelName = "ConsultationFees";

if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const ConsultationFee = mongoose.model(modelName, ConsultationFeeSchema)

export default ConsultationFee;
