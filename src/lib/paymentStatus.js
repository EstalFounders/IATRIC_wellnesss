/**
 * Shared handling for the payment status Cashfree hands back to the app.
 *
 * Two places consume this:
 *   - /payment/thankyou (Cashfree appends `order_id` / `payment_status` to the
 *     configured return_url),
 *   - the appointment page's verify-only PaymentModal (our own return_url uses
 *     `?appointmentId=<order_id>`, but a dismissal can still surface a status).
 *
 * A patient who closes the gateway without paying must never be shown a
 * "pending" spinner or a success screen, so both surfaces agree on which
 * values mean "walked away".
 */
export const PAYMENT_CANCELLED_MESSAGE =
  "Your transaction was cancelled. Please try again or choose another payment method.";

const CANCELLED_VALUES = [
  "cancelled",
  "canceled",
  "cancel",
  "user_cancelled",
  "user_canceled",
  "payment_cancelled",
  "payment_canceled",
  "aborted",
  "dismissed",
];

const FAILED_VALUES = ["failed", "failure", "payment_failed", "declined", "error"];

const PAID_VALUES = ["paid", "success", "successful", "payment_success"];

/**
 * @param {unknown} value - a single query value (or array, as Next gives for
 *   repeated params).
 * @returns {"cancelled" | "failed" | "paid" | null} null when the value carries
 *   no terminal information (missing/empty/unknown).
 */
export function normalizeReturnPaymentStatus(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw || "").trim().toLowerCase();

  if (!normalized) return null;
  if (CANCELLED_VALUES.includes(normalized)) return "cancelled";
  if (FAILED_VALUES.includes(normalized)) return "failed";
  if (PAID_VALUES.includes(normalized)) return "paid";

  return null;
}

export function isPaymentCancelledStatus(value) {
  return normalizeReturnPaymentStatus(value) === "cancelled";
}
