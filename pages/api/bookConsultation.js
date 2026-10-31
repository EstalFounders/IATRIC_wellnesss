import { dbConnect } from "../../src/lib/db";
import Appointment from "../../src/models/appointmentSchema";
// Also registers the model on this connection, which is what `populate("paymentId")`
// needs, and lets PUT write the linked payment's status.
import Payment from "../../src/models/paymentSchema";
import {
  logErrorToGoogleSheet,
  handlePostConsultation,
} from "./helper";
import { rateLimit } from "../../src/lib/rateLimiter";
import { appointment_status, payment_status } from "../../src/constant";
import { releaseSlotForAppointment } from "../../src/lib/paymentService";
import Slot from "../../src/models/slots";

// The values PUT accepts. `TOTAL` is a UI-only sentinel (never stored), so it is
// not a legal appointment status.
const SETTABLE_APPOINTMENT_STATUSES = [
  appointment_status.open,
  appointment_status.pending,
  appointment_status.confirmed,
  appointment_status.rescheduled,
  appointment_status.cancelled,
  appointment_status.completed,
];

const SETTABLE_PAYMENT_STATUSES = [
  payment_status.INITIATED,
  payment_status.PAYMENT_PENDING,
  payment_status.PAID,
  payment_status.FAILED,
  payment_status.CANCELLED,
  payment_status.REFUND_PENDING,
  payment_status.REFUNDED,
];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { doctorId } = req.query; // Get the doctorId from the query parameters

    try {
      await dbConnect();
      // The panel needs the payment state and the "consultation closed" signal,
      // but it has no route to the Payment collection, so both travel with the
      // appointment: `paymentId` is populated (additive - the existing readers
      // in common/ViewAppointment.js already read paymentId.status/.amount) and
      // the derived flags below are computed, never stored.
      const query = doctorId
        ? Appointment.find({ doctorId: doctorId })
        : Appointment.find({});

      const appointments = await query
        .populate("paymentId", "status amount paidAt method orderId")
        .lean();

      const enriched = appointments.map((appointment) => {
        // "Consultation closed" = the prescription has been shared with the
        // patient; `prescriptionUrl` is the only closure signal the appointment
        // schema records (see src/models/appointmentSchema.js).
        const hasPrescription = Boolean(appointment.prescriptionUrl);
        return {
          ...appointment,
          paymentStatus: appointment.paymentId?.status || null,
          hasPrescription,
          isClosed: hasPrescription,
        };
      });

      res.status(200).json({ appointments: enriched });
    } catch (error) {
      console.error(error.status);
      // Log error to Google Sheets
      await logErrorToGoogleSheet({
        apiName: "bookConsultation - GET",
        errorMessage: error.message || "Unable to fetch appointments",
        errorCode: error.status,
        stackTrace: error.stack,
        requestPayload: { doctorId: req.query?.doctorId },
      });
      res.status(500).json({ error: "Unable to fetch appointments" });
    }
  }

  if (req.method === "PUT") {
    // The panel can change either status, or both at once, so each field is
    // optional - but a request that changes nothing is rejected.
    const { appointmentId, selectedStatus, selectedPaymentStatus } =
      req.body || {};

    if (!appointmentId || (!selectedStatus && !selectedPaymentStatus)) {
      return res
        .status(400)
        .json({ message: "Missing id, status or payment status" });
    }
    console.log(
      appointmentId,
      "appointment id",
      selectedStatus,
      "selected status",
      selectedPaymentStatus,
      "selected payment status",
    );

    if (selectedStatus && !SETTABLE_APPOINTMENT_STATUSES.includes(selectedStatus)) {
      return res.status(400).json({ message: "Unknown consultation status" });
    }
    if (
      selectedPaymentStatus &&
      !SETTABLE_PAYMENT_STATUSES.includes(selectedPaymentStatus)
    ) {
      return res.status(400).json({ message: "Unknown payment status" });
    }

    try {
      await dbConnect();

      // The payment is resolved (and rejected) *before* anything is written, so
      // a request that asks for a payment change on an appointment with no
      // Payment document changes nothing at all instead of half-applying the
      // consultation status.
      let payment = null;
      if (selectedPaymentStatus) {
        const appointment = await Appointment.findById(appointmentId).select(
          "paymentId",
        );
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        payment = appointment.paymentId
          ? await Payment.findById(appointment.paymentId)
          : await Payment.findOne({ appointmentId });
        if (!payment) {
          return res
            .status(400)
            .json({ message: "No payment record for this appointment" });
        }
      }

      const updated = {};

      // Read before writing: releasing the slot needs the previous status (a
      // second CANCELLED must not hand the same slot back twice) and the slot id.
      const appointmentBefore = await Appointment.findById(appointmentId).select(
        "status slotId doctorId slotReleasedAt",
      );
      if (!appointmentBefore) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (selectedStatus) {
        await Appointment.findByIdAndUpdate(
          { _id: appointmentId },
          { status: selectedStatus },
          { new: true }, // Return the updated document
        );
        updated.status = selectedStatus;

        // A cancelled consultation no longer needs the doctor's time: hand the
        // slot back so it can be booked again instead of staying blocked forever.
        if (
          selectedStatus === appointment_status.cancelled &&
          appointmentBefore.status !== appointment_status.cancelled
        ) {
          await releaseSlotForAppointment({ appointmentId });
          updated.slotReleased = true;
        }

        // A slot that was handed back (cancelled, failed payment, abandoned
        // booking) must be locked again before the panel re-confirms the
        // appointment, otherwise the same time could be sold twice.
        if (
          selectedStatus === appointment_status.confirmed &&
          appointmentBefore.slotReleasedAt
        ) {
          const relocked = await Slot.findOneAndUpdate(
            {
              _id: appointmentBefore.slotId,
              doctorId: appointmentBefore.doctorId,
              isBooked: false,
            },
            { isBooked: true },
            { new: true },
          );

          if (relocked) {
            await Appointment.updateOne(
              { _id: appointmentId },
              { slotReleasedAt: null },
            );
            updated.slotReleased = false;
          } else {
            // Someone else holds that time now - the panel has to rebook it.
            updated.slotConflict = true;
          }
        }
      }

      if (payment) {
        payment.status = selectedPaymentStatus;
        // Stamp the settlement time the first time a payment turns PAID, so the
        // audit column is not left empty by a manual override.
        if (selectedPaymentStatus === payment_status.PAID && !payment.paidAt) {
          payment.paidAt = new Date();
        }
        await payment.save();
        updated.paymentStatus = payment.status;
      }

      res.status(200).json({ message: "Status updated successfully", ...updated });
    } catch (error) {
      // Log error to Google Sheets
      await logErrorToGoogleSheet({
        apiName: "bookConsultation - PUT",
        errorMessage: error.message || "An error occurred",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: {
          appointmentId,
          selectedStatus,
          selectedPaymentStatus,
        },
      });
      res.status(500).json({ message: "An error occurred", error });
    }
  }

  if (req.method === "POST") {
    // Rate limit booking creation per IP + per mobile to prevent spam/slot lockouts
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const mobileUsed = req.body?.patientMobNo || "unknown";

    const bookingLimit = await rateLimit({
      key: `rl:book:ip:${ip}`,
      limit: 10,
      windowSeconds: 600,
    });
    if (!bookingLimit.allowed) {
      return res.status(429).json({
        message: "Too many booking attempts. Please try again later.",
        retryAfter: bookingLimit.retryAfter,
      });
    }

    const mobileLimit = await rateLimit({
      key: `rl:book:mobile:${mobileUsed}`,
      limit: 10,
      windowSeconds: 600,
    });
    if (!mobileLimit.allowed) {
      return res.status(429).json({
        message: "Too many booking attempts from this number. Please try again later.",
        retryAfter: mobileLimit.retryAfter,
      });
    }

    await handlePostConsultation(req.body, res);
  }
}