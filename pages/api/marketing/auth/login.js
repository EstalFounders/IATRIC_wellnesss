// POST /api/marketing/auth/login - Phase 1 hardcoded marketing sign-in.
import { allowMethods, setSessionCookie } from "../../../../src/api/marketing/helpers/apiHandler";
import { SESSION_TTL_MS, createSessionToken } from "../../../../src/api/marketing/utils/token";
import {
  LOGIN_ERROR_MESSAGES,
  toPublicMarketingUser,
  validateMarketingCredentials,
} from "../../../../src/api/marketing/utils/validation";

export default function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const { username, password } = req.body || {};
  const { valid, reason } = validateMarketingCredentials({ username, password });

  if (!valid) {
    return res.status(401).json({
      ok: false,
      reason,
      message: LOGIN_ERROR_MESSAGES[reason] || "Invalid username or password.",
    });
  }

  const user = toPublicMarketingUser();
  const token = createSessionToken({ username: user.username, role: user.role });

  setSessionCookie(req, res, token, Math.floor(SESSION_TTL_MS / 1000));

  return res.status(200).json({ ok: true, user, expiresInMs: SESSION_TTL_MS });
}
