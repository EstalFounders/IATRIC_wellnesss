// src/utils/generateTempPassword.js
//
// Generates a short, readable temporary password for doctor accounts created
// without a manual password (Add Doctor form + Google Sheet import). The charset
// drops visually ambiguous characters (0/O, 1/l/I) so the WhatsApp message is
// easy to re-type.

import crypto from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export const generateTempPassword = (length = 8) => {
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let index = 0; index < length; index += 1) {
    password += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return password;
};

export default generateTempPassword;
