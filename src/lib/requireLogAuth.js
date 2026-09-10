import { getToken } from "next-auth/jwt";

// Reuses the app's existing NextAuth JWT cookie - no second auth system.
export async function getAuthUser(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token && token.user) return token.user;
  } catch (err) {
    console.error("[log-auth] token check failed", err.message);
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