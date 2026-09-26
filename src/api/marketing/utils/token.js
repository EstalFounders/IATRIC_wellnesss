// Marketing panel session tokens: HMAC-signed, no external dependency.
// Lives outside pages/api so it is NOT exposed as an HTTP endpoint.
import crypto from "crypto";

const SECRET =
  process.env.MARKETING_SESSION_SECRET || "healthpath-marketing-dev-secret";

export const SESSION_COOKIE = "marketing_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const toBase64Url = (value) => Buffer.from(value).toString("base64url");

/** Create a signed session token: <base64url payload>.<hmac> */
export const createSessionToken = (payload = {}) => {
  const body = toBase64Url(
    JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_MS })
  );
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
};

/** Verify a token and return its payload, or null when invalid/expired/tampered. */
export const verifySessionToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [body, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");

  const received = Buffer.from(signature || "");
  const computed = Buffer.from(expected);
  if (
    received.length !== computed.length ||
    !crypto.timingSafeEqual(received, computed)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (error) {
    return null;
  }
};
