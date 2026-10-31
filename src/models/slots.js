import mongoose from 'mongoose';
const { Schema } = mongoose;

const slotSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

// One row per (doctor, start time). The booking lock relies on the slot being a
// single document (`findOneAndUpdate({ _id, doctorId, isBooked: false })`), so a
// duplicate row for the same instant would let two patients book "the same"
// time. The slot generator upserts against this key.
slotSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });

// Use a unique model identifier
const modelName = 'Slot';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Slot = mongoose.model(modelName, slotSchema);

export default Slot;
