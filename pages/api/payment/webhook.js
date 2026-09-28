import { dbConnect } from "../../../src/lib/db";
import Payment from "../../../src/models/paymentSchema";
import { payment_status } from "../../../src/constant";
import {
  verifyCashfreeWebhookSignature,
  getCashfreeOrderStatus,
} from "../../../src/lib/cashfree";
import {
  confirmAppointmentAfterPayment,
  releaseSlotForAppointment,
} from "../../../src/lib/paymentService";
import { logErrorToGoogleSheet } from "../helper";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const rawBody = await readRawBody(req);
    const signature =
      req.headers["x-webhook-signature"] || req.headers["x-cashfree-signature"];

    const signatureValid = verifyCashfreeWebhookSignature({
      rawBody,
      signature,
    });
    if (!signatureValid) {
      // Diagnostic: surface WHY verification failed so the operator can fix it.
      if (!process.env.CASHFREE_WEBHOOK_SECRET) {
        console.error(
          "Cashfree webhook REJECTED: CASHFREE_WEBHOOK_SECRET is not configured. " +
            "Verify the webhook URL is set in Cashfree dashboard AND CASHFREE_WEBHOOK_SECRET matches it."
        );
      } else {
        console.error(
          "Cashfree webhook signature verification failed. Received headers:",
          {
            xWebhookSignature: req.headers["x-webhook-signature"] || "(missing)",
            xCashfreeSignature: req.headers["x-cashfree-signature"] || "(missing)",
          }
        );
      }
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const payload = JSON.parse(rawBody);
    console.log("Cashfree webhook received", {
      type: payload?.type || payload?.event || "unknown",
      orderId: payload?.data?.order?.order_id || payload?.order_id,
    });

    const orderId = payload?.data?.order?.order_id || payload?.order_id;
    const eventStatus =
      payload?.data?.payment?.payment_status ||
      payload?.data?.order?.order_status;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing order_id" });
    }

    await dbConnect();

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      console.error("Cashfree webhook: payment not found for order", orderId);
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Idempotency: if already PAID, do not process again
    if (payment.status === payment_status.PAID) {
      return res.status(200).json({ success: true, message: "Already processed" });
    }

    if (eventStatus === "SUCCESS" || eventStatus === "PAID") {
      // Server-side verification before confirming
      const cfOrder = await getCashfreeOrderStatus(orderId);
      if (cfOrder?.order_status === "PAID") {
        await confirmAppointmentAfterPayment({ paymentId: payment._id });
      } else {
        console.error("Cashfree webhook: status mismatch, order not PAID", {
          orderId,
          cfStatus: cfOrder?.order_status,
        });
        return res.status(200).json({ success: false, message: "Status mismatch" });
      }
    } else if (eventStatus === "FAILED" || eventStatus === "CANCELLED") {
      payment.status =
        eventStatus === "FAILED"
          ? payment_status.FAILED
          : payment_status.CANCELLED;
      await payment.save();
      await releaseSlotForAppointment({ appointmentId: payment.appointmentId });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("payment/webhook error:", error.message);
    await logErrorToGoogleSheet({
      apiName: "payment/webhook",
      errorMessage: error.message || "Webhook processing failed",
      errorCode: "500",
      stackTrace: error.stack,
    });
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
}
