import { logErrorToGoogleSheet } from "../helper";
import { rateLimit } from "../../../src/lib/rateLimiter";

// Browsers are untrusted input: every field is clipped, nothing is echoed back.
const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
const MAX_ROUTE = 200;
const MAX_USER_AGENT = 250;

const clip = (value, max) => (typeof value === "string" ? value.slice(0, max) : "");

// `req.body` is already parsed for `Content-Type: application/json`, but a
// report may also arrive as raw text - neither may throw here.
const parseBody = (body) => {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

/**
 * Receives the client-side errors collected by `src/lib/clientError.js` and
 * appends them to the same error sheet the API routes write to, so a browser
 * crash and a failed request sit in one place.
 *
 * Always answers 204 - even when logging fails: the caller is an already broken
 * tab, and an error response there would only produce another error.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const decision = await rateLimit({
      key: `rl:clienterror:ip:${ip}`,
      limit: 30,
      windowSeconds: 600,
    });
    if (!decision.allowed) return res.status(204).end();

    const body = parseBody(req.body);
    const route = clip(body.route, MAX_ROUTE) || "unknown route";
    const message = clip(body.message, MAX_MESSAGE) || "Unknown client error";

    await logErrorToGoogleSheet({
      apiName: clip(`client:${route}`, 120),
      // "client-fatal" = the page could not render; "client" = a caught error.
      errorCode: body.fatal ? "client-fatal" : "client",
      errorMessage: message,
      stackTrace: clip(body.stack, MAX_STACK),
      requestPayload: {
        route,
        userAgent: clip(body.userAgent, MAX_USER_AGENT),
      },
    });
  } catch (error) {
    // Logging to the sheet is best effort - the browser already got its answer.
    console.error("logs/clientError failed:", error?.message || error);
  }

  return res.status(204).end();
}
