// bankDetails.js
//
// PAN + payout bank-account helpers. Shared by the Super Admin "Add Doctor"
// wizard (step 4 - instant, inline feedback) and by pages/api/addDoctor.js,
// which is the real gate: the browser check can be skipped, the API check
// cannot.
//
// Everything here is optional by product decision - the wizard can be completed
// without banking details and they are added later. The rules below only apply
// to the values that ARE provided:
//   * PAN        -> ABCDE1234F (5 letters, 4 digits, 1 letter)
//   * IFSC       -> HDFC0001234 (4 letters, a 0, 6 alphanumerics)
//   * Account no -> 9-18 digits
// A bank account without its IFSC (or the other way round) is refused, because
// half an account cannot receive a payout, and so is an account without a holder
// name.

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// The flat multipart field names the wizard sends and the API maps onto the
// `panNumber` / `bankDetails` paths of the Doctor document.
export const BANK_TEXT_FIELDS = [
  "panNumber",
  "bankAccountHolderName",
  "bankAccountNumber",
  "bankIfscCode",
  "bankName",
  "bankBranch",
];

// Uppercase, digits/letters only, capped at the official length - so typing
// "abcde 1234 f" ends up as "ABCDE1234F" without a format surprise on blur.
export const normalisePan = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

export const normaliseIfsc = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);

export const normaliseAccountNumber = (value) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 18);

export const isValidPan = (value) =>
  PAN_PATTERN.test(normalisePan(value));

export const isValidIfsc = (value) =>
  IFSC_PATTERN.test(normaliseIfsc(value));

export const isValidAccountNumber = (value) => {
  const digits = normaliseAccountNumber(value);
  return digits.length >= 9 && digits.length <= 18;
};

/**
 * Validates the values the admin typed. `confirmAccountNumber` is a UI-only
 * field and may be omitted (the API never receives it).
 *
 * Returns `{}` when every provided value is fine, otherwise an object keyed by
 * the field name the wizard/API answers with.
 */
export function validateBankDetails({
  panNumber = "",
  accountHolderName = "",
  accountNumber = "",
  confirmAccountNumber,
  ifscCode = "",
} = {}) {
  const errors = {};

  const pan = normalisePan(panNumber);
  if (pan && !PAN_PATTERN.test(pan)) {
    errors.panNumber = "Enter a valid PAN, e.g. ABCDE1234F";
  }

  const account = normaliseAccountNumber(accountNumber);
  const ifsc = normaliseIfsc(ifscCode);
  const holder = String(accountHolderName ?? "").trim();

  if (account && !isValidAccountNumber(account)) {
    errors.accountNumber = "Account number must be 9 to 18 digits";
  }
  if (ifsc && !isValidIfsc(ifsc)) {
    errors.ifscCode = "Enter a valid IFSC, e.g. HDFC0001234";
  }
  if (account && !ifsc) {
    errors.ifscCode = "IFSC code is required together with the account number";
  }
  if (ifsc && !account) {
    errors.accountNumber = "Account number is required together with the IFSC code";
  }
  if ((account || ifsc) && !holder) {
    errors.accountHolderName = "Account holder name is required";
  }
  if (
    confirmAccountNumber !== undefined &&
    account &&
    normaliseAccountNumber(confirmAccountNumber) !== account
  ) {
    errors.confirmAccountNumber = "The account numbers do not match";
  }

  return errors;
}

/**
 * API side: turns the flat multiparty fields into the values the Doctor document
 * stores.
 *
 * Returns
 *   { present: false }                      - the request carried no bank field
 *                                             (the doctor-panel approval PUT, or
 *                                             a wizard that skipped step 4)
 *   { present: true, errors: {...} }        - a provided value is invalid (400)
 *   { present: true, panNumber, bankDetails } - ready to write; `panNumber` is ""
 *                                             and `bankDetails` null when blank,
 *                                             which clears them on an update.
 */
export function parseBankDetailsPayload(fields = {}) {
  const present = BANK_TEXT_FIELDS.some((key) => fields[key] !== undefined);
  if (!present) return { present: false };

  const raw = {
    panNumber: fields.panNumber?.[0],
    accountHolderName: fields.bankAccountHolderName?.[0],
    accountNumber: fields.bankAccountNumber?.[0],
    ifscCode: fields.bankIfscCode?.[0],
    bankName: fields.bankName?.[0],
    branchName: fields.bankBranch?.[0],
  };

  const errors = validateBankDetails(raw);
  if (Object.keys(errors).length > 0) {
    return { present: true, errors };
  }

  const bankDetails = {
    accountHolderName: String(raw.accountHolderName ?? "").trim(),
    accountNumber: normaliseAccountNumber(raw.accountNumber),
    ifscCode: normaliseIfsc(raw.ifscCode),
    bankName: String(raw.bankName ?? "").trim(),
    branchName: String(raw.branchName ?? "").trim(),
  };

  return {
    present: true,
    panNumber: normalisePan(raw.panNumber),
    bankDetails: Object.values(bankDetails).some(Boolean) ? bankDetails : null,
  };
}
