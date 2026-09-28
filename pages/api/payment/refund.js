import { dbConnect } from "../../../src/lib/db";
import Payment from "../../../src/models/paymentSchema";
import Appointment from "../../../src/models/appointmentSchema";
import { payment_status } from "../../../src/constant";
import { createCashfreeRefund } from "../../../src/lib/cashfree";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { appointmentId, refundAmount, refundNote } = req.body || {};

  if (!appointmentId) {
    return res.status(400).json({ success: false, message: "appointmentId is required" });
  }

  try {
    await dbConnect();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const payment = await Payment.findOne({
      appointmentId: appointment._id,
      status: payment_status.PAID,
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "No paid payment found for this appointment",
      });
    }

    // Idempotency - do not create duplicate refunds
    if (
      payment.status === payment_status.REFUND_PENDING ||
      payment.status === payment_status.REFUNDED
    ) {
      return res.status(200).json({
        success: true,
        message: "Refund already initiated",
        status: payment.status,
      });
    }

    const amount = refundAmount || payment.amount;
    const note = refundNote || "Appointment cancelled - refund";

    // Create the Cashfree refund request
    const cfRefund = await createCashfreeRefund({
      orderId: payment.orderId,
      refundAmount: amount,
      refundNote: note,
    });

    if (!cfRefund || !cfRefund.refund_id) {
      throw new Error("Cashfree did not return a refund id");
    }

    payment.status = payment_status.REFUND_PENDING;
    payment.refundId = cfRefund.refund_id;
    payment.refundAmount = amount;
    payment.refundNote = note;
    await payment.save();

    console.log("Refund initiated", {
      appointmentId: String(appointment._id),
      orderId: payment.orderId,
      refundId: cfRefund.refund_id,
      amount,
    });

    return res.status(200).json({
      success: true,
      refundId: cfRefund.refund_id,
      status: payment_status.REFUND_PENDING,
    });
  } catch (error) {
    console.error("payment/refund error:", error.message);
    await logErrorToGoogleSheet({
      apiName: "payment/refund",
      errorMessage: error.message || "Refund failed",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId, refundAmount, refundNote },
    });
    return res.status(500).json({
      success: false,
      message: "Unable to process refund. Please try again.",
    });
  }
}