/**
 * One-tap suggestions and dropdown options for the doctor fields that are
 * almost always filled with the same values: "Education + Training" (degrees),
 * "Language" and the "Speciality" dropdown.
 *
 * They are plain arrays / small helpers so a caller can pass its own list to
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

// One-tap chips: the languages a department sees most often, in that order.
// Deliberately short - the full list lives in `LANGUAGE_OPTIONS` (the datalist
// behind each row), so a rarer language is one word away instead of turning the
// chip cloud into a wall of buttons.
export const LANGUAGE_SUGGESTIONS = [
  "English",
  "Hindi",
  "Punjabi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Urdu",
];

/**
 * Everything offered in the datalist behind a language row: the 22 languages of
 * the Eighth Schedule plus English and the regional languages patients actually
 * ask for. A datalist only suggests - a language missing here can still be typed.
 */
export const LANGUAGE_OPTIONS = [
  ...LANGUAGE_SUGGESTIONS,
  "Assamese",
  "Bodo",
  "Bhojpuri",
  "Chhattisgarhi",
  "Dogri",
  "Haryanvi",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Manipuri",
  "Nepali",
  "Rajasthani",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Tulu",
];

/**
 * How several specialities are stored in the single `expertise` String on the
 * Doctor schema ("Cardiology, Diabetology"). A plain comma-joined String keeps
 * the schema, the API and every read site untouched, and the public speciality
 * filter matches word by word - so each listed speciality still answers to its
 * own filter.
 */
export const SPECIALITY_SEPARATOR = ", ";

// Doctor specialities offered by the "Speciality" dropdown, grouped into the
// `<optgroup>`s the step renders. `expertise` stays a single String on the
// schema, so this list only constrains what is *suggested* - "Other" keeps a
// legacy or unusual value possible.
const SPECIALITY_GROUPS_SOURCE = [
  {
    label: "Medicine & allied",
    items: [
      "General Physician",
      "Family Medicine",
      "Internal Medicine",
      "Cardiology",
      "Dermatology",
      "Diabetology",
      "Endocrinology",
      "Gastroenterology",
      "Hepatology",
      "Nephrology",
      "Neurology",
      "Pulmonology",
      "Rheumatology",
      "Medical Oncology",
      "Haematology",
      "Infectious Diseases",
      "Critical Care",
      "Emergency Medicine",
      "Geriatrics",
      "Pain Management",
      "Sleep Medicine",
      "Sports Medicine",
      "Clinical Genetics",
    ],
  },
  {
    label: "Surgical",
    items: [
      "General Surgery",
      "Orthopaedics",
      "Neurosurgery",
      "Urology",
      "Plastic & Reconstructive Surgery",
      "Vascular Surgery",
      "Bariatric Surgery",
      "Surgical Oncology",
      "Anaesthesiology",
      "Proctology",
    ],
  },
  {
    label: "Mother & child",
    items: [
      "Paediatrics",
      "Neonatology",
      "Gynaecology & Obstetrics",
      "IVF & Fertility",
    ],
  },
  {
    label: "Eye, ENT & therapy",
    items: [
      "Ophthalmology",
      "ENT",
      "Dentistry",
      "Physiotherapy",
      "Nutrition & Dietetics",
      "Audiology",
      "Speech Therapy",
      "Occupational Therapy",
      "Psychology & Counselling",
      "Podiatry",
    ],
  },
  {
    label: "Systems of medicine",
    items: [
      "Allopathy",
      "Ayurveda",
      "Homeopathy",
      "Unani",
      "Siddha",
      "Yoga & Naturopathy",
    ],
  },
  {
    label: "Wellness & lifestyle",
    items: [
      "Cosmetology",
      "Hair Transplant",
      "Sexology",
      "Palliative Care",
    ],
  },
];

const cleanEntry = (value) => String(value ?? "").trim();

// Loose identity for the option list only: the panel may spell a department
// "Dermatologist" / "Pediatrics" where this list says "Dermatology" /
// "Paediatrics" - they are the same specialty, so the department's spelling is
// offered once and the duplicate is dropped. ae/oe are folded and the trailing
// person/plural suffix (…ist, …ian, …s, …y) is dropped, nothing more.
const specialityKey = (value) =>
  cleanEntry(value)
    .toLowerCase()
    .replace(/ae/g, "e")
    .replace(/oe/g, "e")
    .replace(/[^a-z]/g, "")
    .replace(/(ists|ist|ians|ian|s|y)$/, "");

/**
 * The dropdown's options, ready to render.
 *
 * `departmentNames` is the panel-curated list (`globalData.speciality`, the SUB
 * services the public filter bar offers) - prepended as its own group so a
 * doctor is always filed under a department the website actually lists. Every
 * name is de-duplicated (see `specialityKey`) and blank entries are dropped, so
 * a caller can pass raw redux data.
 */
export function buildSpecialityGroups(departmentNames = []) {
  const seen = new Set();

  const dedupe = (names) => {
    const items = [];
    (Array.isArray(names) ? names : []).forEach((name) => {
      const entry = cleanEntry(name);
      if (!entry) return;
      const key = specialityKey(entry);
      if (seen.has(key)) return;
      seen.add(key);
      items.push(entry);
    });
    return items;
  };

  const groups = [];
  const departments = dedupe(departmentNames);
  if (departments.length > 0) {
    groups.push({ label: "HealthPath departments", items: departments });
  }

  SPECIALITY_GROUPS_SOURCE.forEach((group) => {
    const items = dedupe(group.items);
    if (items.length > 0) groups.push({ label: group.label, items });
  });

  return groups;
}

/** Splits a stored `expertise` String back into the specialities it lists. */
export const parseSpecialities = (value) =>
  String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * One-line speciality label for the public cards ("Cardiology · Diabetology").
 * Read-only: the stored value stays the comma-joined String.
 */
export const formatSpecialityLine = (value, separator = " · ") =>
  parseSpecialities(value).join(separator);

/**
 * The value written back to `expertise`: trimmed, blanks dropped and duplicates
 * removed case-insensitively (first spelling wins). An empty list returns "" so
 * the required-field check keeps working.
 */
export function formatSpecialities(names = []) {
  const seen = new Set();
  const items = [];

  (Array.isArray(names) ? names : []).forEach((name) => {
    const entry = cleanEntry(name);
    const key = entry.toLowerCase();
    if (!entry || seen.has(key)) return;
    seen.add(key);
    items.push(entry);
  });

  return items.join(SPECIALITY_SEPARATOR);
}

/** True when `name` is already one of the selected specialities. */
export function hasSpeciality(names, name) {
  const key = cleanEntry(name).toLowerCase();
  if (!key) return false;

  return (Array.isArray(names) ? names : []).some(
    (entry) => cleanEntry(entry).toLowerCase() === key
  );
}

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
