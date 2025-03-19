import mongoose from "mongoose";
import { labTest_payment_status, labTest_status } from "../constant";

const { Schema } = mongoose;

const bookingLabTestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["onlinePay", "payLater"],
    },
    cartItemsIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "labTestDetails", // Assume 'LabTest' is the name of the model for test packages
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [labTest_payment_status.PAID, labTest_payment_status.UNPAID],
      // required: true,
    },
    bookingStatus: {
      type: String,
      default: labTest_status.pending,
      enum: [labTest_status.pending, labTest_status.completed,labTest_status.cancelled],
    },
  },
  {
    timestamps: true, // To automatically manage createdAt and updatedAt fields
  }
);

// Middleware to set paymentStatus based on paymentMethod before saving
bookingLabTestSchema.pre("save", function (next) {
  this.paymentStatus = this.paymentMethod === "onlinePay" ? "paid" : "unpaid";
  next();
});

const modelName = 'booklabtest'

if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

const BookLabTest = mongoose.model(modelName, bookingLabTestSchema);

export default BookLabTest;
