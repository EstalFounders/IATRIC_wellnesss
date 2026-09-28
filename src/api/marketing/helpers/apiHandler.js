// Shared request/response helpers for the marketing API.
import { SESSION_COOKIE } from "../utils/token";

/** Reject unsupported verbs (405 + Allow header). Returns false when rejected. */
export const allowMethods = (req, res, methods) => {
  if (methods.includes(req.method)) return true;

  res.setHeader("Allow", methods);
  res.status(405).json({
    ok: false,
    message: `Method ${req.method} is not allowed on this endpoint.`,
  });
  return false;
};

/** Parse the Cookie header into a plain object. */
export const parseCookies = (req) =>
  (req.headers.cookie || "").split(";").reduce((acc, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return acc;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(value);
    } catch (error) {
      acc[key] = value;
    }
    return acc;
  }, {});

/**
 * Cookie flags. `Secure` is added only for real HTTPS requests (proxy header or
 * encrypted socket) or when explicitly forced with MARKETING_COOKIE_SECURE=true.
 * Adding it unconditionally would make the built app silently fail to keep a
 * session when it is served over plain HTTP (e.g. http://192.168.x.x:3000).
 */
const cookieFlags = (req) => {
  const isHttps =
    req?.headers?.["x-forwarded-proto"] === "https" ||
    Boolean(req?.socket?.encrypted) ||
    process.env.MARKETING_COOKIE_SECURE === "true";

  return `Path=/; HttpOnly; SameSite=Lax${isHttps ? "; Secure" : ""}`;
};

/** Store the session token in an httpOnly cookie. */
export const setSessionCookie = (req, res, token, maxAgeSeconds) => {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; ${cookieFlags(req)}; Max-Age=${maxAgeSeconds}`
  );
};

/** Expire the session cookie (logout). */
export const clearSessionCookie = (req, res) => {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieFlags(req)}; Max-Age=0`);
};
