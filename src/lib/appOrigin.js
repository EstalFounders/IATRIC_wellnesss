// Public-origin helpers for auth / redirect flows.
//
// Why this exists: next-auth builds the post-login and post-logout `callbackUrl`
// from the origin it detects *server-side*. In next-auth 4.24 that origin is
// `process.env.NEXTAUTH_URL` when it is set, otherwise the library's built-in
// `http://localhost:3000` default (`utils/detect-origin.js` -> `utils/parse-url.js`).
// `.env.production` shipped `NEXTAUTH_URL=http://localhost:3000`, so
// `defaultCallbacks.redirect()` turned the relative `callbackUrl` used by the
// SuperAdmin logout into `http://localhost:3000/superAdmin/onload` and the
// browser followed it (see pages/api/auth/[...nextauth].js + RightSideMenu.js).
//
// Rules enforced here:
//  1. No host is ever hardcoded - the request headers win, then the configured
//     public URL environment variables.
//  2. Same-site redirects are re-anchored to the origin of the live request and
//     stay *absolute* URLs - next-auth's own client parses the value with
//     `new URL()` for credentials sign-in, so a relative path throws
//     "Failed to construct 'URL': Invalid URL" in the browser.
//  3. Absolute URLs are only honoured when they point at this deployment.

/** Hostnames that mean "this machine", never a public deployment. */
const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

/** First value of a possibly comma-joined proxy header. */
const firstHeaderValue = (value) =>
  (Array.isArray(value) ? value[0] : String(value ?? ""))
    .split(",")[0]
    .trim();

/** Normalise anything URL-ish to `origin`, or "" when it is not a URL. */
const asOrigin = (value) => {
  try {
    return new URL(String(value ?? "")).origin;
  } catch (error) {
    return "";
  }
};

/**
 * Origin of the incoming request: `x-forwarded-host` / `x-forwarded-proto`
 * first (nginx, PM2 behind a proxy), then the plain `Host` header. Returns ""
 * when the request carries no host at all.
 */
export const getRequestOrigin = (req) => {
  const headers = req?.headers || {};
  const host = firstHeaderValue(headers["x-forwarded-host"] || headers.host);
  if (!host) return "";

  const forwardedProto = firstHeaderValue(headers["x-forwarded-proto"]);
  const protocol =
    forwardedProto === "https" || req?.socket?.encrypted ? "https" : "http";

  return `${protocol}://${host}`;
};

/** Public app URL from configuration, without a trailing slash. */
export const getConfiguredAppUrl = () =>
  String(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      ""
  )
    .trim()
    .replace(/\/+$/, "");

/** True when a URL points at localhost / loopback. */
export const isLocalhostUrl = (value = "") => {
  try {
    return LOCAL_HOSTNAMES.has(new URL(String(value)).hostname);
  } catch (error) {
    return false;
  }
};

/** True when two URLs share the same host (scheme/port-agnostic comparison base). */
const hasSameHost = (a, b) => {
  try {
    return new URL(a).host === new URL(b).host;
  } catch (error) {
    return false;
  }
};

/**
 * Absolute origin that redirect URLs must be built with.
 *
 * Request headers win over the configured env values, so a stale `NEXTAUTH_URL`
 * can never reach the browser. When both point at the same host the *configured*
 * URL wins, so a proxy that does not send `x-forwarded-proto` cannot downgrade
 * https -> http. `fallbackOrigin` is next-auth's own detected origin, used only
 * when neither the request nor the environment names a usable origin.
 */
export const getSameSiteOrigin = ({ requestOrigin, fallbackOrigin } = {}) => {
  const fromRequest = asOrigin(requestOrigin);
  const configured = asOrigin(getConfiguredAppUrl());

  if (configured && hasSameHost(configured, fromRequest)) return configured;
  return fromRequest || configured || asOrigin(fallbackOrigin) || "";
};

/** Origins this deployment may legitimately redirect to. */
export const getTrustedOrigins = ({ requestOrigin } = {}) =>
  [
    requestOrigin,
    getConfiguredAppUrl(),
    process.env.NEXT_PUBLIC_SOCKET_URL,
  ]
    .map(asOrigin)
    .filter(Boolean);

/** Same-site = the request itself, or the configured public app URL. */
const isSameSite = (origin, { requestOrigin } = {}) => {
  const candidates = [asOrigin(requestOrigin), asOrigin(getConfiguredAppUrl())];
  return Boolean(origin) && candidates.includes(origin);
};

/**
 * Same-site redirect target as a *relative* path, or null when the value is not
 * a same-site URL: "/panel/home" -> "/panel/home",
 * "https://<current-host>/panel/home" -> "/panel/home". Protocol-relative
 * values ("//evil.example") are deliberately rejected.
 */
export const toRelativePath = (value, { requestOrigin } = {}) => {
  if (typeof value !== "string" || !value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  const origin = asOrigin(value);
  if (!origin || !isSameSite(origin, { requestOrigin })) return null;

  const { pathname, search, hash } = new URL(value);
  return `${pathname}${search}${hash}`;
};

/** True when an absolute URL points at this deployment (not at a hardcoded host). */
export const isTrustedRedirectUrl = (value, { requestOrigin } = {}) => {
  const origin = asOrigin(value);
  return Boolean(origin) && getTrustedOrigins({ requestOrigin }).includes(origin);
};
