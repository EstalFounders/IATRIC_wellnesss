// Canonical work-day helpers, shared by the super-admin "Add Doctor" form, the
// shared edit-doctor modal (DoctorModalComp) and the doctor list.
//
// `doctor.workDays` is a **String** on the document (src/models/doctorModel.js)
// and both API routes forward it verbatim, so the day picker keeps its state as
// an array of canonical day names and submits it comma-joined - the same trick
// as `consultationType` / `serviceOffered` (see pages/api/addDoctor.js).
//
// Rows created before the picker existed hold free text ("mon-sunday",
// "Mon - Fri", "Monday & Wednesday"), so `parseWorkDays` understands ranges and
// short/full day names in any casing; the forms never write an array back, as
// mongoose 8 drops an array assigned to a String path.

export const WORK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const WORK_DAY_SHORT_LABELS = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

// Every accepted spelling -> index inside WORK_DAYS.
const DAY_ALIASES = {
  monday: 0,
  mon: 0,
  tuesday: 1,
  tues: 1,
  tue: 1,
  wednesday: 2,
  weds: 2,
  wed: 2,
  thursday: 3,
  thurs: 3,
  thur: 3,
  thu: 3,
  friday: 4,
  fri: 4,
  saturday: 5,
  sat: 5,
  sunday: 6,
  sun: 6,
};

// Longest names first so "sunday" is never read as "sun".
const DAY_TOKEN_PATTERN =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tues|thurs|thur|weds|mon|tue|wed|thu|fri|sat|sun)\b/gi;

// "-", "to", "till", "through" ... used inside a single part, e.g. "mon-sunday".
const DAY_RANGE_PATTERN = /\s*(?:-|–|—|\bto\b|\btill\b|\bthrough\b|\bthru\b)\s*/i;

const toDayIndex = (value) =>
  DAY_ALIASES[String(value || "").toLowerCase().replace(/[^a-z]/g, "")];

const isKnownDay = (index) => typeof index === "number" && index >= 0;

/**
 * Normalises anything the DB / a form holds into a Monday -> Sunday array of
 * canonical day names. Unknown words ("alternate days", "weekdays") are ignored
 * instead of throwing, so legacy values never break the picker.
 */
export const parseWorkDays = (value) => {
  const source = (Array.isArray(value) ? value.join(",") : String(value || ""))
    // "Mon and Wed" -> "Mon, Wed" ("and" never appears inside a day name).
    .replace(/\band\b/gi, ",");

  const selected = new Set();

  source
    .split(/[,/&|;]+/) // a range keeps its "-"/"to" because it is not a separator
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const bounds = part.split(DAY_RANGE_PATTERN);

      if (bounds.length === 2) {
        const from = toDayIndex(bounds[0]);
        const to = toDayIndex(bounds[1]);

        if (isKnownDay(from) && isKnownDay(to)) {
          let index = from;
          selected.add(WORK_DAYS[index]);
          while (index !== to) {
            index = (index + 1) % 7; // both "mon-fri" and "fri-mon" wrap
            selected.add(WORK_DAYS[index]);
          }
          return;
        }
      }

      // "Mon Wed Fri" / padded text: keep every day name we recognise.
      (part.match(DAY_TOKEN_PATTERN) || []).forEach((token) => {
        const index = toDayIndex(token);
        if (isKnownDay(index)) selected.add(WORK_DAYS[index]);
      });
    });

  return WORK_DAYS.filter((day) => selected.has(day));
};

/** Value stored in MongoDB and sent to the API: "Monday,Tuesday,Wednesday". */
export const formatWorkDays = (value) => parseWorkDays(value).join(",");

/** Compact label for tables/tooltips: "Mon – Fri", "Mon, Wed, Fri". */
export const formatWorkDaysLabel = (value) => {
  const indexes = parseWorkDays(value).map((day) => WORK_DAYS.indexOf(day));
  if (indexes.length === 0) return "";

  const runs = [];
  let start = indexes[0];
  let previous = indexes[0];

  indexes.slice(1).forEach((index) => {
    if (index === previous + 1) {
      previous = index;
      return;
    }
    runs.push([start, previous]);
    start = index;
    previous = index;
  });
  runs.push([start, previous]);

  return runs
    .map(([from, to]) => {
      const label = WORK_DAY_SHORT_LABELS[WORK_DAYS[from]];
      if (to === from) return label;
      // A two-day run reads better as "Sat, Sun" than as a range.
      if (to === from + 1) {
        return `${label}, ${WORK_DAY_SHORT_LABELS[WORK_DAYS[to]]}`;
      }
      return `${label} – ${WORK_DAY_SHORT_LABELS[WORK_DAYS[to]]}`;
    })
    .join(", ");
};
