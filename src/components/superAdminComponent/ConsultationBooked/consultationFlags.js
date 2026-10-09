// consultationFlags.js - the derived per-appointment state of the super-admin
// "Consultation booked" page, in one place so the Consultations table, the
// filter tiles and the per-doctor dialog can never disagree.
//
// Nothing here is stored. GET /api/bookConsultation adds `paymentStatus`,
// `hasPrescription` and `isClosed` to every appointment (the panel has no route
// to the Payment collection), and each helper below falls back to recomputing
// the value from the document itself, so a row that arrives from anywhere else
// (the redux store, sessionStorage, the full appointment view) still renders.
import { payment_status } from "../../../constant";

/** The linked Payment's status ("PAID", "PAYMENT_PENDING", ...) or "". */
export const paymentStatusOf = (appointment) =>
  appointment?.paymentStatus || appointment?.paymentId?.status || "";

/** True when the consultation fee has actually been received. */
export const isPaid = (appointment) =>
  paymentStatusOf(appointment) === payment_status.PAID;

/**
 * True once a prescription has been shared with the patient. `prescriptionUrl`
 * is written by both prescription flows (pages/api/prescription.js and the
 * helper API's savePrescription action), so it is the schema's closure signal.
 */
export const hasPrescription = (appointment) =>
  typeof appointment?.hasPrescription === "boolean"
    ? appointment.hasPrescription
    : Boolean(appointment?.prescriptionUrl);

/** "Consultation closed" = the prescription has been shared with the patient. */
export const isClosed = (appointment) =>
  typeof appointment?.isClosed === "boolean"
    ? appointment.isClosed
    : hasPrescription(appointment);

// ── Payment chip ────────────────────────────────────────────────────────────
// `tone` maps to a .paymentPaid / .paymentPending / ... class in
// css/ConsultationBooked.module.css (the mapping stays in the components, the
// copy stays here).
const PAYMENT_CHIPS = {
  [payment_status.PAID]: { label: "Paid", tone: "paid" },
  [payment_status.INITIATED]: { label: "Payment pending", tone: "pending" },
  [payment_status.PAYMENT_PENDING]: {
    label: "Payment pending",
    tone: "pending",
  },
  [payment_status.FAILED]: { label: "Payment failed", tone: "failed" },
  [payment_status.CANCELLED]: { label: "Payment cancelled", tone: "failed" },
  [payment_status.REFUND_PENDING]: { label: "Refund pending", tone: "refund" },
  [payment_status.REFUNDED]: { label: "Refunded", tone: "refund" },
};

const NO_PAYMENT_CHIP = { label: "No payment record", tone: "none" };

/** The chip for the row's payment status, e.g. { label, tone }. */
export const paymentBadge = (appointment) =>
  PAYMENT_CHIPS[paymentStatusOf(appointment)] || NO_PAYMENT_CHIP;
