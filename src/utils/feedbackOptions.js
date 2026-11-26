// src/utils/feedbackOptions.js
//
// Single source of truth for the post-consultation feedback form, shared by the
// patient UI (src/components/Feedback) and the API validator
// (pages/api/utils/feedbackValidation.js). Pure data - no server imports, so it
// is safe in a client bundle.

/** Overall star labels, index = star count. */
export const FEEDBACK_RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

/** The optional sub-ratings the form offers. Order = display order. */
export const FEEDBACK_SUB_RATINGS = [
  { key: "doctorCommunication", label: "Doctor communication" },
  { key: "consultationHelpfulness", label: "Consultation helpfulness" },
  { key: "callQuality", label: "Call quality" },
  { key: "bookingProcess", label: "Booking process" },
];

/** Quick-feedback chips. Unknown values are dropped, never stored. */
export const FEEDBACK_TAGS = [
  "Listened carefully",
  "Clear explanation",
  "On time",
  "Good audio/video quality",
  "Prescription shared quickly",
  "Would recommend",
];

export const MAX_FEEDBACK_TAGS = 6;
export const MAX_COMMENT_LENGTH = 1500;
export const MAX_FEEDBACK_RATING = 5;
export const MIN_FEEDBACK_RATING = 1;

const feedbackOptions = {
  FEEDBACK_RATING_LABELS,
  FEEDBACK_SUB_RATINGS,
  FEEDBACK_TAGS,
  MAX_FEEDBACK_TAGS,
  MAX_COMMENT_LENGTH,
};

export default feedbackOptions;
