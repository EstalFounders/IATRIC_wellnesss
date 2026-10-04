/**
 * "Language" is a repeatable text field ("English", "Hindi"), stored as
 * `[String]` in `src/models/doctorModel.js` — a doctor usually speaks more than
 * one language. Every caller (Add Doctor form, edit-doctor modal,
 * `/api/addDoctor`, the cleanup script) keeps it as an array of clean, trimmed
 * strings.
 *
 * Draft rows in the forms may still contain blank strings — they are dropped
 * here on submit, never in the UI, so the user can keep an empty row open while
 * typing.
 */

export const LANGUAGE_FIELD = "language";

// Legacy values were a single free-text String. Unlike a degree name, a language
// is usually listed with a separator: "English, Hindi", "English / Spanish /
// German", "English & Hindi", "English and Hindi" (or on its own line).
const LEGACY_ENTRY_SEPARATOR = /\r?\n|[,;/|]|\s&\s|\s+and\s+/i;

const toText = (value) =>
  value === null || value === undefined ? "" : String(value);

const cleanEntry = (value) => toText(value).trim();

/**
 * Splits a legacy free-text value into single entries. A lone "English" stays
 * one entry, so a legacy record keeps its content when it is upgraded to the
 * array shape.
 */
export function splitLegacyLanguageText(value) {
  return toText(value)
    .split(LEGACY_ENTRY_SEPARATOR)
    .map(cleanEntry)
    .filter(Boolean);
}

/**
 * Normalises anything the database, the API or a form can hold into the stored
 * shape: an array of trimmed, non-empty, de-duplicated strings (matching is
 * case-insensitive, the first spelling wins). `null`, `undefined`, `""` and an
 * empty array all become `[]`.
 */
export function parseLanguages(value) {
  const entries = Array.isArray(value)
    ? value.flatMap(splitLegacyLanguageText)
    : splitLegacyLanguageText(value);

  const seen = new Set();
  const languages = [];

  for (const entry of entries) {
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    languages.push(entry);
  }

  return languages;
}

/**
 * Display label: "English · Hindi · Marathi". Returns "" when there is nothing
 * to show, so callers can fall back.
 */
export function formatLanguagesLabel(value) {
  return parseLanguages(value).join(" · ");
}

/**
 * Appends the repeatable `language` fields to a FormData body — one field per
 * entry, because a comma-joined string would be ambiguous (a language can be
 * submitted again once the array is stored). When nothing is left, one empty
 * field is appended on purpose: `pages/api/addDoctor.js` reads a *present* but
 * blank field as "clear the list" and an *absent* one as "leave the stored
 * value untouched".
 */
export function appendLanguages(formData, value) {
  const items = parseLanguages(value);

  if (items.length === 0) {
    formData.append(LANGUAGE_FIELD, "");
  } else {
    items.forEach((item) => formData.append(LANGUAGE_FIELD, item));
  }

  return items;
}
