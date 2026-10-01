/**
 * "Education + Training" is a repeatable text field ("MBBS - Johns Hopkins
 * University"). `src/models/doctorModel.js` stores it as `[String]`, so every
 * caller (Add Doctor form, edit-doctor modal, `/api/addDoctor`, the cleanup
 * script) keeps it as an array of clean, trimmed strings.
 *
 * Draft rows in the forms may still contain blank strings — they are dropped
 * here on submit, never in the UI, so the user can keep an empty row open while
 * typing.
 */

export const EDUCATION_TRAINING_FIELD = "educationTraining";

// Legacy values were a single free-text block. Newlines and semicolons
// separated entries there; a comma never does, because one degree may contain
// one ("MBBS - Johns Hopkins University, 2010").
const LEGACY_ENTRY_SEPARATOR = /\r?\n|;/;

// Lines copied out of a CV usually start with a bullet marker.
const BULLET_PREFIX = /^\s*[-–—•*·●▪]\s*/;

const toText = (value) =>
  value === null || value === undefined ? "" : String(value);

const cleanEntry = (value) => toText(value).replace(BULLET_PREFIX, "").trim();

/**
 * Splits a legacy free-text value into single entries. A plain sentence stays
 * one entry, so a legacy record keeps its content when it is upgraded to the
 * array shape.
 */
export function splitLegacyEducationText(value) {
  return toText(value)
    .split(LEGACY_ENTRY_SEPARATOR)
    .map(cleanEntry)
    .filter(Boolean);
}

/**
 * Normalises anything the database, the API or a form can hold into the stored
 * shape: an array of trimmed, non-empty strings. `null`, `undefined`, `""` and
 * an empty array all become `[]`.
 */
export function parseEducationTraining(value) {
  if (Array.isArray(value)) {
    return value
      .map(cleanEntry)
      .filter(Boolean)
      // One legacy row can still carry newline/semicolon separated entries.
      .flatMap(splitLegacyEducationText);
  }

  return splitLegacyEducationText(value);
}

/**
 * Display label: "MBBS - Johns Hopkins University · Fellowship in Cardiology".
 * Returns "" when there is nothing to show, so callers can fall back.
 */
export function formatEducationTrainingLabel(value) {
  return parseEducationTraining(value).join(" · ");
}

/**
 * Appends the repeatable `educationTraining` fields to a FormData body — one
 * field per entry, because a comma-joined string would be ambiguous (a degree
 * can contain a comma). When nothing is left, one empty field is appended on
 * purpose: `pages/api/addDoctor.js` reads a *present* but blank field as "clear
 * the list" and an *absent* one as "leave the stored value untouched".
 */
export function appendEducationTraining(formData, value) {
  const items = parseEducationTraining(value);

  if (items.length === 0) {
    formData.append(EDUCATION_TRAINING_FIELD, "");
  } else {
    items.forEach((item) => formData.append(EDUCATION_TRAINING_FIELD, item));
  }

  return items;
}
