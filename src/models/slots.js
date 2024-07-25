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

// Use a unique model identifier
const modelName = 'Slot';

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Slot = mongoose.model(modelName, slotSchema);

export default Slot;
