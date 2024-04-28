import mongoose from "mongoose";
const { Schema } = mongoose;

const slotSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',  // Assuming you have a Doctor model you want to link to
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

const Slot =
  mongoose.models.slotSchema || mongoose.model("Slot", slotSchema);

module.exports = Slot;
