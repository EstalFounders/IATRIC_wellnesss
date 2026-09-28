// POST /api/marketing/auth/logout - clears the marketing session cookie.
import { allowMethods, clearSessionCookie } from "../../../../src/api/marketing/helpers/apiHandler";

export default function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  clearSessionCookie(req, res);

  return res.status(200).json({ ok: true, message: "Signed out." });
}
