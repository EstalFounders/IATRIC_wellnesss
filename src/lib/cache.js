import { redisGet, redisSet, redisDel } from "./redis";

/**
 * Tiny Redis cache-aside helpers with fail-open behavior.
 * If Redis is down, cacheGet returns null and cacheSet silently no-ops,
 * so the app always falls through to the database.
 *
 * Usage:
 *   const cached = await cacheGet("service:fee:Video");
 *   if (cached) return cached;
 *
 *   const fee = await ServiceOffered.findOne(...);
 *   await cacheSet("service:fee:Video", fee, 300);
 */
export async function cacheGet(key) {
  const raw = await redisGet(key);
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // Stored value wasn't JSON (e.g. plain string) - return raw
    return raw;
  }
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  let payload = value;
  if (typeof value !== "string") {
    payload = JSON.stringify(value);
  }
  return redisSet(key, payload, ttlSeconds);
}

export async function cacheDel(key) {
  return redisDel(key);
}

// The only consumers of service:fee:* keys are the payment create-order/pay
// endpoints, which look up the fee for one of these consultation types.
// Invalidate all of them whenever the admin changes services/fees.
const FEE_CACHE_KEYS = [
  "service:fee:audio",
  "service:fee:video",
  "service:fee:home visit",
  "service:fee:clinic",
];

export async function cacheDelFees() {
  await Promise.all(FEE_CACHE_KEYS.map((key) => redisDel(key)));
}

export default { cacheGet, cacheSet, cacheDel, cacheDelFees };
