import mongoose from "mongoose";
import { discount_type } from "../constant";
const { Schema } = mongoose;

const newOfferSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: Array,
    required: true,
  },
  discount_type: {
    type: String, // Change to String to match enum values
    required: true,
    enum: [discount_type.Percentage, discount_type.Fixed, discount_type.Free],
  },
  discount_value: {
    type: Array,
    required: true,
    validate: {
      validator: function (value) {
        // If discount_type is "free", discount_value must be [0]
        if (this.discount_type === discount_type.Free && JSON.stringify(value) !== JSON.stringify([0])) {
          return false;
        }
        return true;
      },
      message: "Discount value must be [0] when discount type is 'free'",
    },
  },
  redemption_limit: {
    type: Number,
    required: true,
  },
  target_audience: {
    type: Array,
    required: true,
  },
  service_type: {
    type: Array,
    required: true,
  },
  isActive: { type: Boolean, default: true },
});

// Unique model identifier
const modelName = "NewOffer";

// Delete existing model if it exists
if (mongoose.models[modelName]) {
  delete mongoose.models[modelName];
}

// Compile the model
const NewOffer = mongoose.model(modelName, newOfferSchema);

export default NewOffer;
