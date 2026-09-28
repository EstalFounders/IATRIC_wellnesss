import { redisIncr, redisExpire, redisTTL } from "./redis";

/**
 * Simple Redis-backed rate limiter using INCR + EXPIRE.
 * Fail-open: if Redis is down, requests are allowed through
 * (so bookings/payments never break).
 *
 * Usage:
 *   const decision = await rateLimit({
 *     key: `rl:otp:${mobile}`,
 *     limit: 5,
 *     windowSeconds: 600,
 *   });
 *   if (!decision.allowed) {
 *     return res.status(429).json({
 *       message: "Too many requests. Please try again later.",
 *       retryAfter: decision.retryAfter,
 *     });
 *   }
 */
export async function rateLimit({ key, limit, windowSeconds }) {
  if (!key || !limit || !windowSeconds) {
    // Misconfigured - allow through rather than breaking the API
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }

  let count = await redisIncr(key);
  if (Number.isNaN(count)) {
    // Redis unavailable - fail open
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }

  // First hit in this window - set expiry
  if (count === 1) {
    await redisExpire(key, windowSeconds);
  }

  const ttl = await redisTTL(key);
  const retryAfter = ttl > 0 ? ttl : windowSeconds;

  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: limit - count, retryAfter };
}

export default rateLimit;