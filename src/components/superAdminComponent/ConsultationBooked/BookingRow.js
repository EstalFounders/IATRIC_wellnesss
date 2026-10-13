// BookingRow.js - one row of the consultation bookings table.
//
// The status controls are two controlled <select>s - the consultation status and
// the linked payment's status - each seeded from the stored value, and the
// Update button only enables once at least one of them actually changes, so a
// stray click can never fire a no-op PUT. Only the changed field(s) are sent.
// The request itself is owned by the page (ConsultationBooked.handleUpdateStatus),
// which replaces the appointment in its list on success - the useEffect below
// then re-syncs this row's draft values.
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { appointment_status, payment_status } from "../../../constant";
import { doctorDisplayName } from "../../../utils/doctorName";
import {
  extractTime,
  formatIstDate,
} from "../../registerDocComponent/utils/helper";
import { isClosed, paymentBadge, paymentStatusOf } from "./consultationFlags";
import styles from "../css/ConsultationBooked.module.css";

// The statuses the super-admin may set. `OPEN` leads the list because it is the
// state every freshly booked consultation starts in (pages/api/helper.js writes
// `appointment_status.open`), so it must be representable here: a <select> whose
// value is missing from its <option>s silently falls back to the first option,
// which used to show "PENDING" next to a row whose badge read "OPEN".
const STATUS_OPTIONS = [
  appointment_status.open,
  appointment_status.pending,
  appointment_status.confirmed,
  appointment_status.rescheduled,
  appointment_status.cancelled,
  appointment_status.completed,
];

// The payment statuses the super-admin may set, most-used first. PAID leads
// because a manual override almost always records a settlement that the gateway
// callback missed; "REFUND_PENDING"/"REFUNDED" trail because they follow a
// refund request. `TOTAL` is not in payment_status, so every value here is a
// legal stored value.
const PAYMENT_STATUS_OPTIONS = [
  payment_status.PAID,
  payment_status.PAYMENT_PENDING,
  payment_status.INITIATED,
  payment_status.FAILED,
  payment_status.CANCELLED,
  payment_status.REFUND_PENDING,
  payment_status.REFUNDED,
];

// Shorter, unique wording for the select. The raw enum is what gets stored and
// what the payload carries, but "PAYMENT_PENDING" does not fit the stacked
// select and "Payment pending" would label two different options identically
// (INITIATED shares the pending tone). The "Payment" label above the control
// already supplies the context the words drop.
const PAYMENT_STATUS_LABELS = {
  [payment_status.PAID]: "Paid",
  [payment_status.PAYMENT_PENDING]: "Pending",
  [payment_status.INITIATED]: "Initiated",
  [payment_status.FAILED]: "Failed",
  [payment_status.CANCELLED]: "Cancelled",
  [payment_status.REFUND_PENDING]: "Refund pending",
  [payment_status.REFUNDED]: "Refunded",
};

const paymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] || status;

// OPEN is the "awaiting a decision" state, so it borrows the pending colour -
// the same mapping the doctor panel uses (appointmentStatus.js).
const STATUS_CLASS = {
  [appointment_status.open]: styles.badgePending,
  [appointment_status.pending]: styles.badgePending,
  [appointment_status.confirmed]: styles.badgeConfirmed,
  [appointment_status.completed]: styles.badgeCompleted,
  [appointment_status.rescheduled]: styles.badgeRescheduled,
  [appointment_status.cancelled]: styles.badgeCancelled,
};

// paymentBadge() returns a tone; the CSS module owns the colours.
const PAYMENT_CLASS = {
  paid: styles.paymentPaid,
  pending: styles.paymentPending,
  failed: styles.paymentFailed,
  refund: styles.paymentRefund,
  none: styles.paymentNone,
};

const BookingRow = ({ appointment, doctor, onUpdateStatus, busy }) => {
  const router = useRouter();
  const storedStatus = appointment.status || appointment_status.pending;
  const storedPaymentStatus = paymentStatusOf(appointment);
  const [status, setStatus] = useState(storedStatus);
  const [paymentStatus, setPaymentStatus] = useState(storedPaymentStatus);

  useEffect(() => {
    setStatus(storedStatus);
  }, [storedStatus]);

  useEffect(() => {
    setPaymentStatus(storedPaymentStatus);
  }, [storedPaymentStatus]);

  // The patient name stays the entry point to the full appointment view.
  const openAppointment = () => {
    router.push({
      pathname: "/superAdmin/viewAppointment",
      query: { data: JSON.stringify(appointment) },
    });
  };

  const badgeClass = STATUS_CLASS[appointment.status] || styles.badgeNeutral;
  const statusChanged = status !== storedStatus;
  const paymentChanged = paymentStatus !== storedPaymentStatus;
  const changed = statusChanged || paymentChanged;
  const closed = isClosed(appointment);

  // A booking with no linked Payment document has nothing stored to show, so the
  // select opens on a placeholder. (Value "" is not a legal stored status, so it
  // can never be mistaken for one.) A stored value outside the known list is
  // prepended rather than dropped, which keeps the select's value and the
  // payment chip above it in agreement.
  const paymentOptions = PAYMENT_STATUS_OPTIONS.includes(storedPaymentStatus)
    ? PAYMENT_STATUS_OPTIONS
    : [storedPaymentStatus, ...PAYMENT_STATUS_OPTIONS].filter(Boolean);
  const hasPaymentRecord = Boolean(storedPaymentStatus);

  // The booking id is the row's stable handle (the appointment view is keyed on
  // it), so the cell prints a short form and keeps the full value in the
  // tooltip instead of flooding the column with 24 hex characters.
  const bookingId = String(appointment._id || "");
  const payment = paymentBadge(appointment);
  const department =
    doctor?.expertise ||
    (Array.isArray(doctor?.serviceOffered)
      ? doctor.serviceOffered.filter(Boolean).join(", ")
      : "");

  return (
    <tr>
      <td className={styles.td}>
        <button
          type="button"
          className={styles.nameBtn}
          onClick={openAppointment}
          title="Open the full appointment"
        >
          {appointment.name || "Unnamed patient"}
        </button>
        {bookingId ? (
          <span className={styles.idLine} title={`Booking ID ${bookingId}`}>
            ID {bookingId.slice(0, 8)}
          </span>
        ) : null}
        <span className={styles.contact}>
          {appointment.patientMobNo || appointment.email || "No contact saved"}
        </span>
      </td>
      <td className={styles.td}>{appointment.consultationType || "-"}</td>
      <td className={styles.td}>
        {appointment.appointmentTime ? (
          <span className={styles.cellStack}>
            <span className={styles.dateLine}>
              {formatIstDate(appointment.appointmentTime)}
            </span>
            <span className={styles.timeLine}>
              {extractTime(appointment.appointmentTime)}
            </span>
          </span>
        ) : (
          "-"
        )}
      </td>
      <td className={styles.td}>
        {doctor ? doctorDisplayName(doctor.name) : "Doctor not available"}
      </td>
      <td className={styles.td}>{department || "Not recorded"}</td>
      <td className={styles.td}>
        <span
          className={`${styles.badge} ${styles.paymentChip} ${
            PAYMENT_CLASS[payment.tone] || styles.badgeNeutral
          }`}
        >
          {payment.label}
        </span>
      </td>
      <td className={styles.td}>
        <span className={styles.clamp} title={appointment.symptoms || ""}>
          {appointment.symptoms || "-"}
        </span>
      </td>
      <td className={styles.td}>
        <span className={`${styles.badge} ${badgeClass}`}>
          {storedStatus}
        </span>
        {closed ? (
          <span className={styles.closedTag}>Prescription shared</span>
        ) : null}
        {appointment.recordingURL ? (
          <a
            className={styles.recordingLink}
            href={appointment.recordingURL}
            target="_blank"
            rel="noopener noreferrer"
            title="Watch the consultation recording"
          >
            ▶ Recording
          </a>
        ) : null}
      </td>
      <td className={styles.td}>
        <div className={styles.statusStack}>
          <div className={styles.statusField}>
            <label
              className={styles.statusLabel}
              htmlFor={`payment-status-${appointment._id}`}
            >
              Payment
            </label>
            <select
              id={`payment-status-${appointment._id}`}
              className={styles.select}
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              disabled={busy}
              title={
                hasPaymentRecord
                  ? "Update the linked payment's status"
                  : "This booking has no payment record yet"
              }
            >
              {hasPaymentRecord ? null : (
                <option value="">No payment</option>
              )}
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {paymentStatusLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.statusField}>
            <label
              className={styles.statusLabel}
              htmlFor={`status-${appointment._id}`}
            >
              Consultation
            </label>
            <select
              id={`status-${appointment._id}`}
              className={styles.select}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={busy}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.rowBtnPrimary}
            onClick={() =>
              onUpdateStatus({
                appointmentId: appointment._id,
                // Only the changed field(s) travel, so a booking with no payment
                // record is never rejected for a payment it did not touch.
                ...(statusChanged ? { selectedStatus: status } : {}),
                ...(paymentChanged
                  ? { selectedPaymentStatus: paymentStatus }
                  : {}),
              })
            }
            disabled={busy || !changed}
          >
            {busy ? "Saving..." : "Update"}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;
