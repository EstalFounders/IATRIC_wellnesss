import { redisGet, redisSet, redisDel, redisIncr } from "./redis";

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

// Fee lookups used to be cached under one key per consultation type
// ("service:fee:video"), which was invalidatable because the set of keys was
// short enough to enumerate here. Per-doctor fees add a key per doctor + type,
// and those cannot be listed, so the cache is now version-stamped:
//
//   service:fee:v<N>:<doctorId>:<typeKey>
//
// `cacheDelFees()` bumps the shared counter, which orphans every key of the old
// version in one round trip (they expire on their own TTL). The legacy
// type-only keys are still deleted too, because the payment endpoints fall back
// to them while the per-doctor wiring rolls out.
const FEE_CACHE_KEYS = [
  "service:fee:audio",
  "service:fee:video",
  "service:fee:home visit",
  "service:fee:clinic",
];

const FEE_CACHE_VERSION_KEY = "fees:ver";

/**
 * Cache key for one doctor + consultation type. Write and invalidate through
 * these helpers only, so the version stamp can never drift.
 */
export function serviceFeeCacheKey(version, doctorId, typeKey) {
  return `service:fee:v${Number(version) || 0}:${doctorId}:${typeKey}`;
}

/**
 * The current fee-cache generation. Fails open to version 0 (Redis down), which
 * only ever costs a cache miss - `cacheGet` then reaches the database.
 */
export async function getFeeCacheVersion() {
  const raw = await redisGet(FEE_CACHE_VERSION_KEY);
  const version = Number(raw);
  return Number.isFinite(version) ? version : 0;
}

export async function cacheDelFees() {
  await Promise.all([
    redisIncr(FEE_CACHE_VERSION_KEY),
    ...FEE_CACHE_KEYS.map((key) => redisDel(key)),
  ]);
}

export default {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelFees,
  serviceFeeCacheKey,
  getFeeCacheVersion,
};
