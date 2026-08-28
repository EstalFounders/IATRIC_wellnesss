import { dbConnect } from "../../../src/lib/db";
import Appointment from "../../../src/models/appointmentSchema";
import Payment from "../../../src/models/paymentSchema";
import ServiceOffered from "../../../src/models/serviceOffered";
import { payment_status } from "../../../src/constant";
import {
  createCashfreeOrder,
  getCashfreeOrderStatus,
  getCashfreeCheckoutUrl,
} from "../../../src/lib/cashfree";
import { logErrorToGoogleSheet } from "../helper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { appointmentId, consultationType } = req.body || {};

  if (!appointmentId || !consultationType) {
    return res.status(400).json({
      success: false,
      message: "appointmentId and consultationType are required",
    });
  }

  try {
    await dbConnect();

    // 1. Load the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // 2. Always derive the amount from the database - never trust client amount
    const service = await ServiceOffered.findOne({
      name: { $regex: new RegExp(`^${consultationType}$`, "i") },
      isActive: true,
    });

    if (!service || !service.fee) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee not configured for this consultation type",
      });
    }

    const amount = Number(service.fee);

    // 3. Idempotency: check for existing active payment
    let payment = await Payment.findOne({
      appointmentId: appointment._id,
      status: { $in: [payment_status.PAYMENT_PENDING, payment_status.INITIATED] },
    });

    if (payment) {
      // Reuse existing pending payment - verify it's still valid at Cashfree
      try {
        const orderStatus = await getCashfreeOrderStatus(payment.orderId);
        if (orderStatus && orderStatus.order_status === "PAID") {
          // Payment already completed but our DB wasn't updated; update it
          payment.status = payment_status.PAID;
          payment.paymentId = orderStatus.payment_id || null;
          await payment.save();
          await Appointment.findByIdAndUpdate(appointment._id, {
            status: appointment_status_confirmed(),
            paymentId: payment._id,
          });
          return res.status(200).json({
            success: true,
            alreadyPaid: true,
            paymentSessionId: null,
            orderId: payment.orderId,
            status: payment_status.PAID,
          });
        }
      } catch (orderErr) {
        console.error("Cashfree order status check failed (continuing):", orderErr.message);
      }

      // The stored payment session is single-use and likely expired/consumed.
      // Re-create the Cashfree order with the SAME orderId to get a FRESH
      // payment_session_id (Cashfree's create-order API is idempotent on order_id).
      const freshCashfreeOrder = await createCashfreeOrder({
        orderId: payment.orderId,
        amount: Number(payment.amount),
        customerDetails: {
          customerId: `CUST_${appointment.patientMobNo || "NA"}`,
          customerName: appointment.name || "Patient",
          customerEmail: appointment.email || "patient@healthpath.co.in",
          customerPhone: String(appointment.patientMobNo || "9999999999"),
        },
      });

      if (!freshCashfreeOrder || !freshCashfreeOrder.payment_session_id) {
        throw new Error("Cashfree did not return a payment session");
      }

      payment.paymentSessionId = freshCashfreeOrder.payment_session_id;
      await payment.save();

      return res.status(200).json({
        success: true,
        paymentSessionId: freshCashfreeOrder.payment_session_id,
        checkoutUrl: getCashfreeCheckoutUrl(
          freshCashfreeOrder.payment_session_id
        ),
        orderId: payment.orderId,
        amount: Number(payment.amount),
        alreadyExists: true,
      });
    }

    // 4. Already paid? Do not create a new order
    const paidPayment = await Payment.findOne({
      appointmentId: appointment._id,
      status: payment_status.PAID,
    });

    if (paidPayment) {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        paymentSessionId: null,
        orderId: paidPayment.orderId,
        status: payment_status.PAID,
      });
    }

    // 5. Create a fresh Cashfree order
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

    // 6. Create / update our Payment record
    payment = await Payment.create({
      appointmentId: appointment._id,
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

    console.log("Payment order created", {
      appointmentId: String(appointment._id),
      orderId,
      amount,
    });

    return res.status(200).json({
      success: true,
      paymentSessionId: cashfreeOrder.payment_session_id,
      checkoutUrl: getCashfreeCheckoutUrl(cashfreeOrder.payment_session_id),
      orderId,
      amount,
    });
  } catch (error) {
    console.error("create-order error:", error.message);
    await logErrorToGoogleSheet({
      apiName: "payment/create-order",
      errorMessage: error.message || "Unable to initialize payment",
      errorCode: "500",
      stackTrace: error.stack,
      requestPayload: { appointmentId, consultationType },
    });
    return res.status(500).json({
      success: false,
      message: "Unable to initialize payment. Please try again.",
    });
  }
}

function appointment_status_confirmed() {
  // Local helper to keep the file self-contained
  return "CONFIRMED";
}