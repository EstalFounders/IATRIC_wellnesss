// GET /api/marketing/auth/session - current session state for the client guard.
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import { getMarketingSession } from "../../../../src/api/marketing/helpers/requireMarketingAuth";
import { toPublicMarketingUser } from "../../../../src/api/marketing/utils/validation";

export default function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const session = getMarketingSession(req);

  if (!session) {
    return res.status(200).json({ ok: true, authenticated: false, user: null });
  }

  return res.status(200).json({
    ok: true,
    authenticated: true,
    user: { ...toPublicMarketingUser(), username: session.username },
  });
}
