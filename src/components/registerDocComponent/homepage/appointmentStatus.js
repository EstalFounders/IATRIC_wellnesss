// appointmentStatus.js
// Status → pill helpers shared by the home page's table and its "next
// consultation" card, so the same status can never be coloured or spelled
// differently in the two places. The colours live in HomePage.module.css.
import { appointment_status } from "../../../constant";
import styles from "../css/HomePage.module.css";

const PILL_CLASS = {
  [appointment_status.confirmed]: styles.pillConfirmed,
  [appointment_status.pending]: styles.pillPending,
  [appointment_status.open]: styles.pillPending,
  [appointment_status.rescheduled]: styles.pillPending,
  [appointment_status.completed]: styles.pillCompleted,
  [appointment_status.cancelled]: styles.pillCancelled,
};

/** Class list for the status pill of an appointment. */
export const statusPillClass = (status) =>
  `${styles.pill} ${
    PILL_CLASS[String(status || "").toUpperCase()] || styles.pillNeutral
  }`;

/** "CONFIRMED" -> "Confirmed"; the raw value when it is not a known status. */
export const statusLabel = (status) => {
  const value = String(status || "").trim();
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
