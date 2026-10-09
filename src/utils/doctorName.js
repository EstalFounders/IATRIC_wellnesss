// doctorName.js
// One place that decides how a doctor's name is printed.
//
// The name is stored on the Doctor document exactly as the doctor typed it, and
// doctors are inconsistent: some keep it bare ("Raman Kumar"), some already
// type the title ("Dr. Raman Kumar"). Every screen that used to prefix by hand
// printed either "Dr Raman Kumar" (no period), "Dr.Raman Kumar" (no space) or
// "Dr Dr. Raman Kumar" (double prefix) depending on the file. These helpers make
// the printed form idempotent, so `doctorDisplayName(doctor.name)` is safe to
// call on any stored value.
//
// The title is a *display* concern only: never write the result back into the
// database or into a profile form input, or the stored value grows a title it
// has to strip again on the next render.
//
// Zero dependencies on purpose - this is imported by public pages and by the
// meeting room, which must not pull in Firebase (src/utils.js) or the doctor
// panel bundle (registerDocComponent/utils/helper.js).

// An existing title at the start of the name, with the optional "Dr."/डॉ. dot.
// `drs` is listed before `dr` so "Drs. Mehta" is not left as "s. Mehta".
const DOCTOR_PREFIX = /^(?:drs|dr|डॉ)\.?\s*/i;

/** The name with any title it already carries removed. */
const stripDoctorPrefix = (name) =>
  String(name ?? "")
    .trim()
    .replace(DOCTOR_PREFIX, "")
    .trim();

/**
 * "Raman Kumar" -> "Dr. Raman Kumar"; "Dr. Raman Kumar" -> "Dr. Raman Kumar".
 * Empty/whitespace-only input returns "" so callers can keep their own
 * placeholder instead of printing a dangling "Dr.".
 *
 * @param {string} name stored doctor name, with or without a title
 * @param {string} prefix title to print, e.g. the i18n value ("Dr." / "डॉ.")
 * @returns {string}
 */
export const doctorDisplayName = (name, prefix = "Dr.") => {
  const value = String(name ?? "").trim();
  if (!value) return "";

  const rest = stripDoctorPrefix(value);
  // A name that is *only* a title ("Dr.") is printed as stored rather than
  // printed with an empty name after it.
  return rest ? `${prefix} ${rest}` : value;
};

/**
 * The title plus the first name only - what fits in the header dropdown.
 * Same idempotency as doctorDisplayName.
 *
 * @param {string} name stored doctor name, with or without a title
 * @param {string} prefix title to print, e.g. the i18n value ("Dr." / "डॉ.")
 * @returns {string}
 */
export const doctorShortName = (name, prefix = "Dr.") => {
  const full = doctorDisplayName(name, prefix);
  if (!full) return "";

  const first = full.slice(prefix.length).trim().split(/\s+/)[0];
  return first ? `${prefix} ${first}` : full;
};
