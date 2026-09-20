import { getToken } from "next-auth/jwt";

// Reuses the app's existing NextAuth JWT cookie - no second auth system.
// Supports BOTH the plain cookie (http) and the `__Secure-` prefixed cookie (https).
export async function getAuthUser(req) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn("[log-auth] NEXTAUTH_SECRET is not set - log APIs will 401");
    return null;
  }
  const attempts = [
    { secureCookie: false },
    { secureCookie: true },
    { cookieName: "next-auth.session-token" },
    { cookieName: "__Secure-next-auth.session-token" },
  ];
  for (const extra of attempts) {
    try {
      const token = await getToken({ req, secret, ...extra });
      if (token && token.user) return token.user;
    } catch (err) {
      console.error("[log-auth] token check failed", err.message);
      return null;
    }
  }
  return null;
}

export async function requireAuth(req, res) {
  const user = await getAuthUser(req);
  if (user) return user;
  if (!res.headersSent) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return null;
}

export function isLoopback(req) {
  const addr = (req.socket && req.socket.remoteAddress) || "";
  return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1";
}

export default { getAuthUser, requireAuth, isLoopback };