// doctorName.js
// One place that decides how a doctor's name is printed.
//
// The title is part of the stored name. The Doctor document has no separate
// title field, so doctors type "Dr. Raman Kumar" / "Dr Sqn Ldr Surya Pratap
// Budhwar" themselves and that whole string is what the console saves. Printing
// therefore means printing the stored value *as it is*: this helper must never
// add a title of its own, or every screen that used to prefix by hand printed
// "Dr. Dr Sqn Ldr ..." (or "Dr. Sqn", because the old short-name helper took the
// first token after stripping the title).
//
// All it does is normalise whitespace - stored values like "Dr Ashima Narula "
// used to leak a trailing space into the UI - so every screen prints the same
// string. It is safe to call on an empty/undefined name: the caller then keeps
// its own placeholder ("Doctor", "Unnamed doctor").
//
// The title is a *display* concern only: never write the result back into the
// database or into a profile form input, or the stored value is rewritten every
// time someone opens the profile page.
//
// Zero dependencies on purpose - this is imported by public pages and by the
// meeting room, which must not pull in Firebase (src/utils.js) or the doctor
// panel bundle (registerDocComponent/utils/helper.js).

/**
 * The doctor name exactly as stored, with stray whitespace collapsed.
 * Empty/whitespace-only input returns "" so callers can keep their own
 * placeholder instead of printing an empty name.
 *
 * @param {string} name stored doctor name, title included
 * @returns {string}
 */
export const doctorDisplayName = (name) =>
  String(name ?? "")
    .replace(/\s+/g, " ")
    .trim();

