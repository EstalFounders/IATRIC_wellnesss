// One sink for every client-side error (render crashes, event handlers, promise
// rejections, failed chunk loads). Two destinations, both best effort:
//
//   1. GA4 - an `exception` event (what the Realtime/Exceptions report shows) plus
//      a `client_error` event carrying the route, so a crash can be tied to the
//      page it happened on instead of only to a browser.
//   2. The error Google Sheet, through `POST /api/logs/clientError`, which is the
//      same sheet every API route already writes to.
//
// Nothing in here may throw: it runs while something else is already broken, and
// an exception raised by the reporter would replace the error being reported.
import { GA_SKIP_PREFIXES } from "../components/Common/GoogleAnalytics";

const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 2000;
const MAX_ROUTE_LENGTH = 200;
const MAX_TRACKED_KEYS = 100;

// A component that throws on every render fires dozens of reports per second.
// Keyed by route + message: one report per key per window is enough to see it.
const recentReports = new Map();

const clip = (value, max) => {
  if (typeof value !== "string" || !value) return "";
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

// "at Component (webpack-internal:///./src/...:12:3)" - the frame that says where.
const firstStackFrame = (stack) => {
  if (typeof stack !== "string") return "";
  const frame = stack.split("\n").find((line) => line.trim().startsWith("at "));
  return frame ? clip(frame.trim(), 160) : "";
};

// The super-admin / marketing / doctor-panel screens are excluded from GA (see
// GoogleAnalytics), so their crashes must not reach the property either. They
// still land in the sheet.
const isAnalyticsSkipped = (route) => {
  const path = String(route || "");
  return GA_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const isDuplicate = (key) => {
  const now = Date.now();
  if (recentReports.size > MAX_TRACKED_KEYS) {
    recentReports.forEach((timestamp, trackedKey) => {
      if (now - timestamp > DEDUPE_WINDOW_MS) recentReports.delete(trackedKey);
    });
  }
  const previous = recentReports.get(key);
  if (previous && now - previous < DEDUPE_WINDOW_MS) return true;
  recentReports.set(key, now);
  return false;
};

/**
 * Report a client-side error. Safe to call from anywhere in the browser.
 *
 * @param {Object} [details]
 * @param {string} [details.message] - human readable error message
 * @param {string} [details.stack] - stack trace (React component stack is fine too)
 * @param {string} [details.route] - pathname the error happened on
 * @param {boolean} [details.fatal] - true when the UI could not render at all
 */
export function reportClientError({ message, stack, route, fatal = false } = {}) {
  try {
    const routePath = clip(
      route || (typeof window !== "undefined" ? window.location.pathname : ""),
      MAX_ROUTE_LENGTH,
    );
    const errorMessage = clip(message, MAX_MESSAGE_LENGTH) || "Unknown client error";

    if (isDuplicate(`${routePath}::${errorMessage}`)) return;

    const stackTrace = clip(stack, MAX_STACK_LENGTH);
    const frame = firstStackFrame(stackTrace);

    if (
      typeof window !== "undefined" &&
      typeof window.gtag === "function" &&
      !isAnalyticsSkipped(routePath)
    ) {
      window.gtag("event", "exception", {
        description: clip(
          `${routePath || "unknown route"} :: ${errorMessage}${frame ? ` :: ${frame}` : ""}`,
          450,
        ),
        fatal: Boolean(fatal),
      });
      window.gtag("event", "client_error", {
        error_route: routePath,
        error_message: errorMessage,
        fatal: Boolean(fatal),
      });
    }

    if (typeof window === "undefined" || typeof window.fetch !== "function") return;

    // keepalive so the request still leaves the browser when the error page is
    // being navigated away from (or the tab is closing).
    window
      .fetch("/api/logs/clientError", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          message: errorMessage,
          stack: stackTrace,
          route: routePath,
          fatal: Boolean(fatal),
          userAgent: clip(
            typeof navigator !== "undefined" ? navigator.userAgent : "",
            250,
          ),
        }),
      })
      .catch(() => {});
  } catch (reporterError) {
    // Never rethrow: the error we were reporting is the interesting one.
    console.error("reportClientError failed:", reporterError);
  }
}

export default reportClientError;
