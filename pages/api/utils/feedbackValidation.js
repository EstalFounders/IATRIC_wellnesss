// pages/api/utils/feedbackValidation.js
//
// Server-side rules for the post-consultation feedback form. The page renders
// these same limits (max length, tag list, 1-5 stars), but the API is reachable
// directly, so every rule is re-checked here before anything is written.
//
// The option lists live in src/utils/feedbackOptions.js so the form and the API
// cannot drift apart. `evaluateFeedbackEligibility` is a pure function, so both
// sides can reason about "is this consultation over?".
import { appointment_status } from "../../../src/constant";
import {
  FEEDBACK_SUB_RATINGS,
  FEEDBACK_TAGS,
  MAX_COMMENT_LENGTH,
  MAX_FEEDBACK_RATING,
  MAX_FEEDBACK_TAGS,
  MIN_FEEDBACK_RATING,
} from "../../../src/utils/feedbackOptions";

// Re-exported for API-side consumers (routes, tests).
export { FEEDBACK_SUB_RATINGS, FEEDBACK_TAGS, MAX_FEEDBACK_TAGS, MAX_COMMENT_LENGTH };

export const MAX_SOURCE_LENGTH = 32;

// A consultation is only over once its slot has finished - otherwise a patient
// could open the link during the call and rate it. Completed/prescription-shared
// appointments are always eligible; this grace period only covers bookings whose
// status was never updated by the doctor.
export const FEEDBACK_GRACE_MS = 15 * 60 * 1000;

const asText = (value) =>
  value === undefined || value === null ? "" : String(value);

/**
 * Parses one star value.
 * @returns {{ empty: boolean, invalid: boolean, value: number|null }}
 */
const parseRating = (value) => {
  if (value === undefined || value === null || value === "") {
    return { empty: true, invalid: false, value: null };
  }
  const numeric = Number(value);
  if (
    !Number.isInteger(numeric) ||
    numeric < MIN_FEEDBACK_RATING ||
    numeric > MAX_FEEDBACK_RATING
  ) {
    return { empty: false, invalid: true, value: null };
  }
  return { empty: false, invalid: false, value: numeric };
};

/** Trimmed, newline-preserving, control-character-free comment text. */
export const normalizeComment = (value) =>
  asText(value)
    .replace(/\r\n?/g, "\n")
    // Tabs/multiple spaces collapse, newlines survive (they are line breaks the
    // patient typed on purpose).
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, MAX_COMMENT_LENGTH);

/** Whitelisted, de-duplicated chips, capped at MAX_FEEDBACK_TAGS. */
export const normalizeTags = (value) => {
  const input = Array.isArray(value) ? value : [];
  const seen = new Set();
  const tags = [];

  for (const item of input) {
    const tag = asText(item).trim();
    if (!tag || seen.has(tag) || !FEEDBACK_TAGS.includes(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length >= MAX_FEEDBACK_TAGS) break;
  }

  return tags;
};

/**
 * Normalises the submitted payload. Invalid values are kept as `null` so the
 * validator below can name the offending field instead of silently dropping it.
 */
export const normalizeFeedbackPayload = (body = {}) => {
  const overall = parseRating(body?.overallRating ?? body?.rating);
  const ratings = {};
  const invalidSubRatings = [];

  FEEDBACK_SUB_RATINGS.forEach(({ key, label }) => {
    const parsed = parseRating(body?.ratings?.[key] ?? body?.[key]);
    ratings[key] = parsed.value;
    if (parsed.invalid) invalidSubRatings.push(label);
  });

  return {
    overallRating: overall.value,
    overallInvalid: overall.invalid,
    ratings,
    invalidSubRatings,
    tags: normalizeTags(body?.tags),
    comment: normalizeComment(body?.comment),
    source: asText(body?.source).trim().slice(0, MAX_SOURCE_LENGTH) || "web",
  };
};

/**
 * @returns {{ ok: boolean, message: string, payload: object }} `message` is the
 * first problem found, phrased for the patient (the form renders it verbatim).
 */
export function validateFeedbackPayload(body = {}) {
  const normalized = normalizeFeedbackPayload(body);
  const problems = [];

  if (normalized.overallInvalid) {
    problems.push("Overall rating must be between 1 and 5 stars.");
  }
  // Nothing on this form is mandatory: a patient may send only a comment, only
  // tags, or only one sub-rating, so an empty overall rating is accepted.

  if (normalized.invalidSubRatings.length) {
    problems.push(
      `${normalized.invalidSubRatings.join(", ")} must be between 1 and 5 stars (or left empty).`
    );
  }

  const { overallInvalid, invalidSubRatings, ...payload } = normalized;

  return {
    ok: problems.length === 0,
    message: problems[0] || "",
    payload,
  };
}

/**
 * Whether a consultation may receive feedback yet.
 * @returns {{ eligible: boolean, status: number, message: string }}
 */
export function evaluateFeedbackEligibility(appointment, now = Date.now()) {
  if (!appointment) {
    return {
      eligible: false,
      status: 404,
      message: "We could not find this consultation. Please check your booking link.",
    };
  }

  const status = asText(appointment.status).trim().toUpperCase();

  if (status === appointment_status.cancelled) {
    return {
      eligible: false,
      status: 409,
      message: "This consultation was cancelled, so feedback is not needed.",
    };
  }

  // "Consultation closed" = the prescription has been shared with the patient.
  if (status === appointment_status.completed || appointment.prescriptionUrl) {
    return { eligible: true, status: 200, message: "" };
  }

  const slotTime = appointment.appointmentTime
    ? new Date(appointment.appointmentTime).getTime()
    : NaN;

  if (Number.isFinite(slotTime) && now - slotTime >= FEEDBACK_GRACE_MS) {
    return { eligible: true, status: 200, message: "" };
  }

  return {
    eligible: false,
    status: 409,
    message: "Feedback opens once your consultation is completed.",
  };
}

export default validateFeedbackPayload;
