// Phase 1 marketing credentials. Override with env vars in real deployments and
// replace with a DB-backed user (hashed) in Phase 5.
export const MARKETING_USERNAME =
  process.env.MARKETING_USERNAME || "marketing@healthpath.com";
export const MARKETING_PASSWORD =
  process.env.MARKETING_PASSWORD || "Marketing123!";

/**
 * Check submitted credentials against the configured ones.
 * Returns { valid, reason } so the login route can say which field is wrong
 * (Phase 1 has a single known account, so this helps rather than leaks).
 * Values are trimmed: mobile keyboards/autofill often append whitespace.
 */
export const validateMarketingCredentials = ({ username, password } = {}) => {
  if (typeof username !== "string" || typeof password !== "string") {
    return { valid: false, reason: "missing" };
  }

  const submittedUser = username.trim().toLowerCase();
  const expectedUser = MARKETING_USERNAME.trim().toLowerCase();

  if (!submittedUser) return { valid: false, reason: "missing" };
  if (submittedUser !== expectedUser) return { valid: false, reason: "username" };
  if (password.trim() !== MARKETING_PASSWORD) {
    return { valid: false, reason: "password" };
  }

  return { valid: true, reason: null };
};

/** Human-readable message per failure reason. */
export const LOGIN_ERROR_MESSAGES = {
  missing: "Enter both the username and the password.",
  username: `Unknown username. Use ${MARKETING_USERNAME}.`,
  password:
    "Incorrect password. Check the password (copy it again if it was pasted).",
};

/** Shape the safe user object returned to the client (never the password). */
export const toPublicMarketingUser = () => ({
  username: MARKETING_USERNAME,
  role: "marketing",
  panel: "marketing",
});
