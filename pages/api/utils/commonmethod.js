// Shared API helpers (invoice generation helpers were removed - the SuperAdmin
// panel now only lists/previews saved invoices, see pages/api/helper/invoices.js).
export const formatPhoneNumber = (phoneNumberString) => {
  // Normalize numbers (e.g. 9876543210, +91 9876543210, 919876543210)
  let digits;
  if (typeof phoneNumberString === "string") {
    digits = phoneNumberString.replace(/\D/g, "");
  } else if (typeof phoneNumberString === "number") {
    digits = String(phoneNumberString).replace(/\D/g, "");
  } else {
    return null;
  }

  // If it already includes the 91 country code and is 12 digits, keep it
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  // Strip a leading 0 (local formatting like 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Keep only the last 10 digits (assumed to be the actual mobile number)
  const last10Digits = digits.slice(-10);

  // Ensure it's 10 digits
  if (last10Digits.length !== 10) return null;

  // Prefix with country code
  return `91${last10Digits}`;
};
