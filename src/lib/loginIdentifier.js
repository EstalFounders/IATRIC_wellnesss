// Single source of truth for "did the doctor type an email or a mobile number?".
//
// The doctor login form has one field for both, so the same detection runs in
// the browser (form validation) and on the server (database lookup). Keeping it
// here means the two can never disagree - an input the form accepts is an input
// the API can query.
//
// Mobile numbers are matched EXACTLY (the model stores `mobileNumber` as a
// Number), emails are matched case-insensitively.

/** Shown to the user for both "no such doctor" and "wrong password". */
export const INVALID_LOGIN_MESSAGE = "Invalid Email/Phone Number or Credentials";

/** Label / placeholder of the combined input. */
export const LOGIN_IDENTIFIER_LABEL = "Email or Phone Number";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEN_DIGIT_PATTERN = /^\d{10}$/;

/**
 * Classifies raw user input.
 *
 * @returns {{ kind: "empty"|"email"|"mobile"|"invalid", value: string }}
 *   - `email`  -> `value` is the lowercased address
 *   - `mobile` -> `value` is the 10-digit national number
 */
export function parseLoginIdentifier(raw) {
  const input = raw === null || raw === undefined ? "" : String(raw).trim();
  if (!input) return { kind: "empty", value: "" };

  // Anything with an "@" is meant to be an email (a mobile number never has one).
  // Inner whitespace is stripped so a pasted "john @ gmail.com" still works.
  if (input.includes("@")) {
    const email = input.replace(/\s+/g, "").toLowerCase();
    return EMAIL_PATTERN.test(email)
      ? { kind: "email", value: email }
      : { kind: "invalid", value: email };
  }

  // "+91 98765 43210", "098765 43210" and "9876543210" all mean the same doctor.
  const digits = input.replace(/\D/g, "");
  let national = digits;
  if (national.length === 12 && national.startsWith("91")) national = national.slice(2);
  else if (national.length === 11 && national.startsWith("0")) national = national.slice(1);

  if (!TEN_DIGIT_PATTERN.test(national)) return { kind: "invalid", value: input };
  return { kind: "mobile", value: national };
}

/** True for an input the form may submit (well-formed email or 10-digit mobile). */
export function isValidLoginIdentifier(raw) {
  const { kind } = parseLoginIdentifier(raw);
  return kind === "email" || kind === "mobile";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Mongo filter for the doctor identified by `raw`, or `null` when the input is
 * neither a valid email nor a valid 10-digit mobile number.
 *
 * Emails use an anchored, case-insensitive regex instead of an exact `$eq`
 * because the collection has no case-insensitive collation and older rows were
 * saved with whatever casing the doctor typed.
 */
export function doctorLoginFilter(raw) {
  const parsed = parseLoginIdentifier(raw);
  if (parsed.kind === "email") {
    return { email: new RegExp(`^${escapeRegExp(parsed.value)}$`, "i") };
  }
  if (parsed.kind === "mobile") {
    // Exact numeric matches only: the national number, and the same number with
    // the "91" country code that a few older registrations included.
    return { mobileNumber: { $in: [Number(parsed.value), Number(`91${parsed.value}`)] } };
  }
  return null;
}
