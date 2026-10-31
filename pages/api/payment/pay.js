import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Payment from "../../../src/models/paymentSchema";
import ServiceOffered from "../../../src/models/serviceOffered";
import { payment_status } from "../../../src/constant";
import {
  createCashfreeOrder,
  payCashfreeOrder,
  getCashfreeOrderStatus,
} from "../../../src/lib/cashfree";
import {
  confirmAppointmentAfterPayment,
  releaseSlotForAppointment,
} from "../../../src/lib/paymentService";
import { rateLimit } from "../../../src/lib/rateLimiter";
import { cacheGet, cacheSet } from "../../../src/lib/cache";
import { logErrorToGoogleSheet } from "../helper";

/**
 * Cashfree Order Pay API (v2023-08-01) - POST /pg/orders/pay
 *
 * Executes payment for a previously-created Cashfree order using a
 * concrete payment method (UPI / card / netbanking). The order is always
 * created/validated server-side first and the amount is always derived
 * from the database - never trusted from the frontend.
 *
 * Success is never trusted from the frontend either: the returned
 * order_status is cross-checked, and payment verification happens
 * server-side via /api/payment/status and the webhook.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { appointmentId, consultationType, paymentMethod } = req.body || {};

  if (!appointmentId || !consultationType) {
    return res.status(400).json({
      success: false,
      message: "appointmentId and consultationType are required",
    });
  }

  if (!paymentMethod || typeof paymentMethod !== "object") {
    return res.status(400).json({
      success: false,
      message: "paymentMethod is required (upi | card | netbanking)",
    });
  }

  try {
    // Rate limit payment execution per appointment to prevent abuse
    const payLimit = await rateLimit({
      key: `rl:pay:${appointmentId}`,
      limit: 10,
      windowSeconds: 600,
    });
    if (!payLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: "Too many payment attempts. Please try again later.",
        retryAfter: payLimit.retryAfter,
      });
    }

    await dbConnect();

    // 1. Load the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // 2. Always derive the amount from the database - never trust the client
    //    amount. The appointment holds the fee the patient was shown (and that the
    //    invoice quotes), so it wins; the serviceOffered fee is only the fallback
    //    for records created without a price. The consultation type is taken from
    //    the appointment too, so the client cannot switch the charged service.
    const effectiveType = String(
      appointment.consultationType || consultationType || "",
    ).trim();

    const appointmentAmount = Number(appointment.consultationprice);
    const hasAppointmentAmount =
      Number.isFinite(appointmentAmount) && appointmentAmount > 0;

    let amount = hasAppointmentAmount ? appointmentAmount : null;

    if (!hasAppointmentAmount) {
      const cacheKey = `service:fee:${effectiveType.toLowerCase()}`;
      let service = await cacheGet(cacheKey);
      if (!service) {
        service = await ServiceOffered.findOne({
          name: { $regex: new RegExp(`^${effectiveType}$`, "i") },
          isActive: true,
        });
        if (service) {
          await cacheSet(cacheKey, service, 300); // 5-min TTL
        }
      }

      if (!service || !service.fee) {
        return res.status(400).json({
          success: false,
          message: "Consultation fee not configured for this consultation type",
        });
      }

      amount = Number(service.fee);
    }

    // 3. Idempotency: check for existing active payment
    let payment = await Payment.findOne({
      appointmentId: appointment._id,
      status: { $in: [payment_status.PAYMENT_PENDING, payment_status.INITIATED] },
    });

    if (payment) {
      // If already PAID at Cashfree, confirm and return
      try {
        const orderStatus = await getCashfreeOrderStatus(payment.orderId);
        if (orderStatus && orderStatus.order_status === "PAID") {
          await confirmAppointmentAfterPayment({ paymentId: payment._id });
          return res.status(200).json({
            success: true,
            alreadyPaid: true,
            orderId: payment.orderId,
            status: payment_status.PAID,
            payment_status: "PAID",
            order_status: "PAID",
          });
        }
      } catch (orderErr) {
        console.error("Cashfree order status check failed (continuing):", orderErr.message);
      }
    } else {
      // 4. No active payment - create a fresh Cashfree order first.
      const orderId = `HP_${appointment._id}_${Date.now().toString(36)}`;

      const customerDetails = {
        customerId: `CUST_${appointment.patientMobNo || "NA"}`,
        customerName: appointment.name || "Patient",
        customerEmail: appointment.email || "patient@healthpath.co.in",
        customerPhone: String(appointment.patientMobNo || "9999999999"),
      };

      const cashfreeOrder = await createCashfreeOrder({
        orderId,
        amount,
        customerDetails,
      });

      if (!cashfreeOrder || !cashfreeOrder.payment_session_id) {
        throw new Error("Cashfree did not return a payment session");
      }

      payment = await Payment.create({
        appointmentId: appointment._id,
        appointmentTime: appointment.appointmentTime || null,
        bookingMode: appointment.bookingMode || null,
        provider: "cashfree",
        orderId,
        paymentSessionId: cashfreeOrder.payment_session_id,
        amount,
        currency: "INR",
        status: payment_status.PAYMENT_PENDING,
      });

      // Link payment to appointment
      await Appointment.findByIdAndUpdate(appointment._id, {
        paymentId: payment._id,
        status: "PENDING",
      });
    }

    // 5. Already paid? Do not charge again
    const paidPayment = await Payment.findOne({
      appointmentId: appointment._id,
      status: payment_status.PAID,
    });

    if (paidPayment) {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        orderId: paidPayment.orderId,
        status: payment_status.PAID,
        payment_status: "PAID",
        order_status: "PAID",
      });
    }

    // 6. Call the Cashfree Order Pay API (v2023-08-01)
    const customerDetails = {
      customerId: `CUST_${appointment.patientMobNo || "NA"}`,
      customerName: appointment.name || "Patient",
      customerEmail: appointment.email || "patient@healthpath.co.in",
      customerPhone: String(appointment.patientMobNo || "9999999999"),
    };

    const payResponse = await payCashfreeOrder({
      orderId: payment.orderId,
      orderAmount: Number(payment.amount),
      orderCurrency: payment.currency || "INR",
      customerDetails,
      paymentMethod,
    });

    console.log("Cashfree Order Pay response:", {
      orderId: payment.orderId,
      order_status: payResponse?.order_status,
      payment_status: payResponse?.payment_status,
      cf_order_id: payResponse?.cf_order_id,
    });

    // 7. Handle terminal statuses server-side
    if (payResponse?.payment_status === "SUCCESS" || payResponse?.order_status === "PAID") {
      await confirmAppointmentAfterPayment({ paymentId: payment._id });
    } else if (
      payResponse?.payment_status === "FAILED" ||
      payResponse?.payment_status === "CANCELLED" ||
      payResponse?.order_status === "FAILED" ||
      payResponse?.order_status === "CANCELLED"
    ) {
      const failed =
        payResponse?.payment_status === "FAILED" ||
        payResponse?.order_status === "FAILED";
      payment.status = failed ? payment_status.FAILED : payment_status.CANCELLED;
      payment.paymentId = payResponse?.payment_id || null;
      payment.method = payResponse?.payment_method || null;
      await payment.save();
      await releaseSlotForAppointment({ appointmentId: payment.appointmentId });
    }

    return res.status(200).json({
      success: true,
      orderId: payment.orderId,
      amount: Number(payment.amount),
      order_status: payResponse?.order_status || null,
      payment_status: payResponse?.payment_status || null,
      payment_id: payResponse?.payment_id || null,
      payment_method: payResponse?.payment_method || null,
      cf_order_id: payResponse?.cf_order_id || null,
      appointmentTime: payment.appointmentTime || null,
      bookingMode: payment.bookingMode || null,
    });
  } catch (error) {
    console.error("payment/pay error:", error.message);
    await logErrorToGoogleSheet({
      apiName: "payment/pay",
      errorMessage: error.message || "Unable to execute payment",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId, consultationType, paymentMethod },
    });
    return res.status(500).json({
      success: false,
      message: "Unable to execute payment. Please try again.",
    });
  }
}