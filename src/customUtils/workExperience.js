/**
 * "Work Experience" is a repeatable text field ("8 years - Cardiology").
 * `src/models/doctorModel.js` stores it as `[String]`, so every caller (Add
 * Doctor form, edit-doctor modal, `/api/addDoctor`) keeps it as an array of
 * clean, trimmed strings. This mirrors `educationTraining.js`; the difference is
 * that at least one entry is required, so the forms raise an inline error before
 * submit (the same pattern as the mandatory `language` field).
 *
 * Draft rows in the forms may still contain blank strings — they are dropped
 * here on submit, never in the UI, so the user can keep an empty row open while
 * typing.
 */

export const WORK_EXPERIENCE_FIELD = "workExperience";

// Legacy values were a single free-text block. Newlines and semicolons
// separated entries there; a comma never does, because one entry may contain
// one ("8 years, Cardiology").
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
export function splitLegacyWorkExperienceText(value) {
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
export function parseWorkExperience(value) {
  if (Array.isArray(value)) {
    return value
      .map(cleanEntry)
      .filter(Boolean)
      // One legacy row can still carry newline/semicolon separated entries.
      .flatMap(splitLegacyWorkExperienceText);
  }

  return splitLegacyWorkExperienceText(value);
}

/**
 * Display label: "8 years - Cardiology · 3 years - General Medicine". Returns
 * "" when there is nothing to show, so callers can fall back.
 */
export function formatWorkExperienceLabel(value) {
  return parseWorkExperience(value).join(" · ");
}

/**
 * Appends the repeatable `workExperience` fields to a FormData body — one field
 * per entry, because a comma-joined string would be ambiguous (an entry can
 * contain a comma). When nothing is left, one empty field is appended on
 * purpose: `pages/api/addDoctor.js` reads a *present* but blank field as "clear
 * the list" and an *absent* one as "leave the stored value untouched".
 */
export function appendWorkExperience(formData, value) {
  const items = parseWorkExperience(value);

  if (items.length === 0) {
    formData.append(WORK_EXPERIENCE_FIELD, "");
  } else {
    items.forEach((item) => formData.append(WORK_EXPERIENCE_FIELD, item));
  }

  return items;
}
