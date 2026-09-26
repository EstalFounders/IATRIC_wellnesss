// Route guard for every authenticated marketing endpoint.
import { SESSION_COOKIE, verifySessionToken } from "../utils/token";
import { parseCookies } from "./apiHandler";

/** Returns the marketing session payload, or null when not authenticated. */
export const getMarketingSession = (req) =>
  verifySessionToken(parseCookies(req)[SESSION_COOKIE]);

/** Wrap a handler so only authenticated marketing users can reach it. */
export const requireMarketingAuth = (handler) => async (req, res) => {
  const session = getMarketingSession(req);

  if (!session) {
    return res.status(401).json({
      ok: false,
      authenticated: false,
      message: "Marketing session required. Please sign in again.",
    });
  }

  req.marketingSession = session;
  return handler(req, res);
};
