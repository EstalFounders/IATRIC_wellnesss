// Pure filter/sort helpers behind the public doctor filter bar.
//
// Kept free of React so the same rules can be reused by any listing (the bar
// itself only owns the UI state). Every helper tolerates the shapes actually
// stored in MongoDB:
//   - `serviceOffered` / `consultationType` are arrays but legacy rows may hold
//     a single comma-joined String,
//   - `location` is `{ state, city }` on new docs and a plain String on old ones,
//   - `workDays` is a comma-joined String with free-text history ("mon-sunday").
import { parseWorkDays, WORK_DAYS } from "../../customUtils/workDays";
import { parseWorkExperience } from "../../customUtils/workExperience";
import { formatLocation, parseLocation } from "../../customUtils/indiaLocations";
import {
  CONSULTATION_TYPE_KEY,
  SYSTEM_CONSULTATION_TYPES,
  consultationTypeName,
  toConsultationTypeEntries,
  typeKeyFor,
} from "../../utils/consultationFee";

/** The whole filter state. `sort` is "" for "recommended" (the API order). */
export const EMPTY_FILTERS = {
  search: "",
  sort: "",
  speciality: "",
  location: "",
  availability: "",
  consultation: "",
  gender: "",
};

export const FILTER_KEYS = Object.keys(EMPTY_FILTERS);

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const slugify = (value) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

// --- Speciality ---------------------------------------------------------------
// Doctor docs have no `speciality` field: the specialities a doctor covers live
// in `serviceOffered` (legacy `speciality` and the free-text `expertise` are still
// honoured when present).
export const doctorSpecialityLabels = (doctor) =>
  [doctor?.speciality, doctor?.expertise].filter(Boolean).map(String);

const doctorSpecialityHaystack = (doctor) => [
  ...doctorSpecialityLabels(doctor),
  ...asArray(doctor?.serviceOffered),
];

// Matching is word based (never a raw substring: "ent" must not match "patient").
// "&" becomes "and", short words may prefix a longer one ("obs" -> "obstetrics")
// and near-miss spellings still meet ("gynaecology" vs "gynecology").
const STOP_WORDS = new Set(["and", "of", "the", "for"]);

const words = (value) =>
  normalize(value)
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !STOP_WORDS.has(word));

const editDistance = (a, b) => {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }

  return previous[b.length];
};

// The panel mixes word forms ("Dermatologist", "Dentistry", "Pediatrics"), so a
// light suffix fold makes the practitioner/field variants meet:
// dermatologist = dermatology, psychiatrist = psychiatry, pediatrician = pediatrics.
const SUFFIX_FOLDS = [
  [/(ologies|ology|ologists|ologist)$/, "olog"],
  [/(iatrics|iatrician|iatric|iatry|iatrist)$/, "iatr"],
  [/(istry|ist)$/, ""],
  [/(therapy|therapist)$/, "therap"],
  [/(ics|ic)$/, ""],
  [/s$/, ""],
];

const fold = (word) =>
  SUFFIX_FOLDS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), word);

const wordsMatch = (left, right) => {
  if (left === right) return true;

  const foldedLeft = fold(left);
  const foldedRight = fold(right);
  if (foldedLeft.length >= 3 && foldedLeft === foldedRight) return true;

  const [short, long] = left.length <= right.length ? [left, right] : [right, left];
  if (short.length >= 3 && long.startsWith(short)) return true;

  if (short.length < 5) return false;
  return editDistance(short, long) <= Math.max(1, Math.floor(short.length / 5));
};

/**
 * Tolerant match of a SUB service name against the doctor's services.
 * Exact / slug-equal first, then every word of the filter must appear in the
 * doctor's text (as a word, a prefix, or a near-miss spelling).
 */
export const matchesSpeciality = (doctor, filter) => {
  const target = normalize(filter);
  if (!target) return true;

  const targetWords = words(filter);

  return doctorSpecialityHaystack(doctor).some((name) => {
    const value = normalize(name);
    if (value === target || slugify(name) === slugify(filter)) return true;

    const valueWords = words(name);
    if (!valueWords.length) return false;

    return targetWords.every((needle) =>
      valueWords.some((word) => wordsMatch(needle, word))
    );
  });
};

// --- Location -----------------------------------------------------------------
export const doctorLocation = (doctor) => {
  const { city, state } = parseLocation(doctor?.location);
  return { city, state, label: formatLocation(doctor?.location) };
};

export const matchesLocation = (doctor, filter) => {
  const target = normalize(filter);
  if (!target) return true;

  const { city, state, label } = doctorLocation(doctor);
  return [city, state, label]
    .map(normalize)
    .some((value) => value && (value === target || value.includes(target)));
};

// --- Availability -------------------------------------------------------------
const pad = (value) => String(value).padStart(2, "0");

const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// WORK_DAYS is Monday-first while Date#getDay() is Sunday-first.
const dayNameFor = (date) => WORK_DAYS[(date.getDay() + 6) % 7];

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** True when the doctor works that weekday and has not blocked that date. */
export const isDoctorAvailableOn = (doctor, date) => {
  if (!parseWorkDays(doctor?.workDays).includes(dayNameFor(date))) return false;

  const key = dateKey(date);
  return !asArray(doctor?.unavailableDates).some(
    (blocked) => String(blocked || "").slice(0, 10) === key
  );
};

export const matchesAvailability = (doctor, filter, now = new Date()) => {
  switch (filter) {
    case "today":
      return isDoctorAvailableOn(doctor, now);
    case "tomorrow":
      return isDoctorAvailableOn(doctor, addDays(now, 1));
    case "this_week":
      return [0, 1, 2, 3, 4, 5, 6].some((offset) =>
        isDoctorAvailableOn(doctor, addDays(now, offset))
      );
    default:
      return true;
  }
};

// --- Consultation type --------------------------------------------------------
// Panel-created doctors store the *display* names ("Video call consultation"),
// not the legacy short words, so `typeKeyFor` alone cannot resolve them. Map the
// seeded names back to their stable keys first.
const SYSTEM_KEY_BY_NAME = new Map(
  SYSTEM_CONSULTATION_TYPES.map((type) => [slugify(type.name), type.key])
);

const consultationKeyFor = (name) => {
  const slug = slugify(name);
  return SYSTEM_KEY_BY_NAME.get(slug) || typeKeyFor(name);
};

export const doctorConsultationKeys = (doctor) =>
  asArray(doctor?.consultationType)
    .map(consultationTypeName)
    .filter(Boolean)
    .map(consultationKeyFor);

export const matchesConsultation = (doctor, filter) => {
  if (!filter) return true;
  return doctorConsultationKeys(doctor).includes(typeKeyFor(filter));
};

export const CONSULTATION_FILTERS = [
  CONSULTATION_TYPE_KEY.AUDIO,
  CONSULTATION_TYPE_KEY.VIDEO,
  CONSULTATION_TYPE_KEY.CLINIC,
  CONSULTATION_TYPE_KEY.HOME_VISIT,
];

// --- Gender -------------------------------------------------------------------
export const matchesGender = (doctor, filter) => {
  const target = normalize(filter);
  if (!target) return true;
  return normalize(doctor?.gender) === target;
};

// --- Sort keys ----------------------------------------------------------------
/** Cheapest consultation the doctor offers, or null when no fee is stored. */
export const doctorMinPrice = (doctor) => {
  const prices = toConsultationTypeEntries(doctor?.consultationType)
    .map((entry) => entry.price)
    .filter((price) => typeof price === "number" && price >= 0);

  const legacyPrice = Number(doctor?.price);
  if (Number.isFinite(legacyPrice) && legacyPrice > 0) prices.push(legacyPrice);

  return prices.length ? Math.min(...prices) : null;
};

/** Highest "N years" found in `workExperience` entries; 0 when unknown. */
export const doctorExperienceYears = (doctor) => {
  const entries = parseWorkExperience(doctor?.workExperience).map(String);

  const explicit = entries
    .map((entry) => entry.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  if (explicit.length) return Math.max(...explicit);

  const loose = entries.join(" ").match(/(\d{1,2})/);
  return loose ? Number(loose[1]) : 0;
};

/** Rating is not stored yet - read it when it appears, else fall back to reviews. */
export const doctorRating = (doctor) => {
  const value = Number(doctor?.rating ?? doctor?.averageRating ?? doctor?.reviews ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const byPrice = (direction) => (a, b) => {
  const left = doctorMinPrice(a);
  const right = doctorMinPrice(b);

  // Doctors without a stored fee always sink to the end of the list.
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
};

const SORTERS = {
  price_asc: byPrice("asc"),
  price_desc: byPrice("desc"),
  experience_desc: (a, b) => doctorExperienceYears(b) - doctorExperienceYears(a),
  rating_desc: (a, b) => doctorRating(b) - doctorRating(a),
};

// --- Entry points -------------------------------------------------------------
export const filterDoctors = (doctors, filters = EMPTY_FILTERS, now = new Date()) => {
  const list = Array.isArray(doctors) ? doctors.filter(Boolean) : [];
  const tokens = normalize(filters.search).split(/\s+/).filter(Boolean);

  return list.filter((doctor) => {
    // Every typed word must appear somewhere in the name (order independent).
    if (tokens.length) {
      const name = normalize(doctor?.name);
      if (!tokens.every((token) => name.includes(token))) return false;
    }

    if (!matchesSpeciality(doctor, filters.speciality)) return false;
    if (!matchesLocation(doctor, filters.location)) return false;
    if (!matchesAvailability(doctor, filters.availability, now)) return false;
    if (!matchesConsultation(doctor, filters.consultation)) return false;
    if (!matchesGender(doctor, filters.gender)) return false;

    return true;
  });
};

export const filterAndSortDoctors = (doctors, filters = EMPTY_FILTERS, now = new Date()) => {
  const result = filterDoctors(doctors, filters, now);
  const sorter = SORTERS[filters.sort];
  return sorter ? [...result].sort(sorter) : result;
};

/** Number of filters that deviate from the default state (0 = untouched bar). */
export const countActiveFilters = (filters = EMPTY_FILTERS) =>
  FILTER_KEYS.filter((key) => normalize(filters[key]) !== "").length;

const uniqueSorted = (values) =>
  Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );

// Same de-duplication but keeps the incoming (panel) order.
const uniqueOrdered = (values) => {
  const seen = new Set();

  return (Array.isArray(values) ? values : []).reduce((acc, value) => {
    const label = String(value ?? "").trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return acc;
    seen.add(key);
    acc.push(label);
    return acc;
  }, []);
};

/**
 * Dropdown options.
 *
 * `specialities` mirrors the SUB services curated in the admin panel (redux
 * `globalData.speciality`) in panel order - only names a doctor's
 * `serviceOffered` can hold. The loaded doctors are a fallback for the cold
 * start before the slice hydrates; `expertise` is free text and never becomes an
 * option.
 */
export const buildFilterOptions = (doctors = [], specialityNames = []) => {
  const list = Array.isArray(doctors) ? doctors.filter(Boolean) : [];
  const curated = uniqueOrdered(specialityNames);

  return {
    specialities: curated.length
      ? curated
      : uniqueOrdered(list.flatMap((doctor) => asArray(doctor?.serviceOffered))),
    locations: uniqueSorted(list.map((doctor) => doctorLocation(doctor).label)),
  };
};
