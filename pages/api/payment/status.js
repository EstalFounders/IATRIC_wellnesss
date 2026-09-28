import { dbConnect } from "../../../src/lib/db";
import Payment from "../../../src/models/paymentSchema";
import { payment_status } from "../../../src/constant";
import { getCashfreeOrderStatus } from "../../../src/lib/cashfree";
import {
  confirmAppointmentAfterPayment,
  releaseSlotForAppointment,
} from "../../../src/lib/paymentService";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "orderId is required" });
  }

  try {
    await dbConnect();

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const appointmentId = payment.appointmentId
      ? String(payment.appointmentId)
      : null;

    if (payment.status === payment_status.PAID) {
      // Payment is already PAID — ensure the appointment confirmation
      // (status -> CONFIRMED + WhatsApp) is fully completed/healed.
      // This is a no-op if the whole job is already done (idempotent),
      // but re-runs the confirmation flow if it was only partially completed
      // (e.g. a crash mid-way or a manually-marked-PAID payment for testing).
      await confirmAppointmentAfterPayment({ paymentId: payment._id });

      return res.status(200).json({
        success: true,
        status: payment_status.PAID,
        orderId,
        appointmentId,
        amount: payment.amount,
      });
    }

    const cashfreeOrder = await getCashfreeOrderStatus(orderId);
    const cfStatus = cashfreeOrder?.order_status;

    console.log("Cashfree order status check:", { orderId, cfStatus });

    if (cfStatus === "PAID") {
      console.log("payment/status: Cashfree order PAID - confirming appointment", {
        orderId,
        appointmentId,
        paymentId: String(payment._id),
      });
      await confirmAppointmentAfterPayment({ paymentId: payment._id });
      return res.status(200).json({
        success: true,
        status: payment_status.PAID,
        orderId,
        appointmentId,
        amount: payment.amount,
      });
    }

    if (cfStatus === "FAILED" || cfStatus === "CANCELLED") {
      payment.status =
        cfStatus === "FAILED" ? payment_status.FAILED : payment_status.CANCELLED;
      await payment.save();
      await releaseSlotForAppointment({ appointmentId: payment.appointmentId });
      return res.status(200).json({
        success: false,
        status: payment.status,
        orderId,
        appointmentId,
        message: "Payment was not completed",
      });
    }

    return res.status(200).json({
      success: false,
      status: payment_status.PAYMENT_PENDING,
      orderId,
      appointmentId,
      message: "Payment is being verified. Please wait...",
    });
  } catch (error) {
    console.error("payment/status error:", error.message);
    await logErrorToGoogleSheet({
      apiName: "payment/status",
      errorMessage: error.message || "Unable to verify payment",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { orderId },
    });
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please try again.",
    });
  }
}