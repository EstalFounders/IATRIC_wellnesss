import mongoose from "mongoose";
import { payment_status } from "../constant";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    provider: {
      type: String,
      default: "cashfree",
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentSessionId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: [
        payment_status.INITIATED,
        payment_status.PAYMENT_PENDING,
        payment_status.PAID,
        payment_status.FAILED,
        payment_status.CANCELLED,
        payment_status.REFUND_PENDING,
        payment_status.REFUNDED,
      ],
      default: payment_status.INITIATED,
    },
    paymentId: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      default: null,
    },
    refundId: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    refundNote: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Use a unique model identifier
const modelName = "Payment";

// Check if the model already exists
if (mongoose.models[modelName]) {
  mongoose.deleteModel(modelName);
}

// Compile the model if it doesn't exist
const Payment = mongoose.model(modelName, paymentSchema);

export default Payment;