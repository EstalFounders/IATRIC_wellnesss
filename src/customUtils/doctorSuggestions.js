/**
 * One-tap suggestions for the two repeatable doctor fields that are almost
 * always filled with the same handful of values: "Education + Training"
 * (degrees) and "Language".
 *
 * They are plain arrays so a caller can pass its own list to
 * `<EducationTrainingInput suggestions={...} />` / `<LanguageInput suggestions={...} />`
 * - the components only read the strings, so adding or reordering an entry here
 * needs no other change. Order matters: it is the order the chips are shown in,
 * not the order the user picks them (picks are appended in click order).
 */

export const DEGREE_SUGGESTIONS = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "DRN",
  "DM",
  "MCh",
  "BAMS",
];

export const LANGUAGE_SUGGESTIONS = ["Hindi", "English", "Punjabi", "Marathi"];

/**
 * Appends `suggestion` to a list of draft rows: blanks are dropped (they are
 * dropped on submit anyway, so a pick should land in the first visible row) and
 * a value that is already present - compared trimmed and case-insensitively -
 * is not added twice. Existing order is preserved, so picking MBBS then MD
 * yields ["MBBS", "MD"].
 */
export function appendSuggestion(rows, suggestion) {
  const entry = String(suggestion ?? "").trim();
  if (!entry) return rows;

  const filled = (Array.isArray(rows) ? rows : [])
    .map((row) => String(row ?? "").trim())
    .filter(Boolean);

  const key = entry.toLowerCase();
  if (filled.some((row) => row.toLowerCase() === key)) return filled;

  return [...filled, entry];
}

/** True when `suggestion` is already one of the (trimmed) draft rows. */
export function containsSuggestion(rows, suggestion) {
  const key = String(suggestion ?? "").trim().toLowerCase();
  if (!key) return false;

  return (Array.isArray(rows) ? rows : []).some(
    (row) => String(row ?? "").trim().toLowerCase() === key
  );
}
