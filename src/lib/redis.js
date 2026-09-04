import { createClient } from "redis";

// Singleton Redis client with graceful fail-open behavior.
// If Redis is unavailable, every helper in this module returns
// a "no-op" fallback so the app NEVER breaks bookings/payments.
//
// Usage:
//   import { redisGet, redisSet, redisDel, redisIncr, isRedisAvailable } from "./redis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let client = null;
let clientReady = false;
let lastErrorAt = 0;

function createRedisClient() {
  const c = createClient({ url: REDIS_URL });

  c.on("error", (err) => {
    console.error("[Redis] client error (fail-open):", err.message);
    clientReady = false;
    lastErrorAt = Date.now();
  });

  c.on("connect", () => {
    console.log("[Redis] client connected");
  });

  c.on("ready", () => {
    clientReady = true;
    console.log("[Redis] client ready");
  });

  c.on("end", () => {
    clientReady = false;
  });

  c.on("reconnecting", () => {
    console.warn("[Redis] client reconnecting...");
  });

  return c;
}

async function getClient() {
  if (client && clientReady && client.isOpen) return client;

  // Rate-limit reconnect attempts: wait at least 5s between retries
  if (client && !clientReady && Date.now() - lastErrorAt < 5000) {
    return null;
  }

  if (!client) {
    client = createRedisClient();
  }

  try {
    await client.connect();
    clientReady = true;
  } catch (err) {
    console.error("[Redis] connect failed (fail-open):", err.message);
    clientReady = false;
    lastErrorAt = Date.now();
    return null;
  }

  return clientReady ? client : null;
}

export function isRedisAvailable() {
  return clientReady && !!client && client.isOpen;
}

/**
 * Get a value from Redis. Returns null on miss or when Redis is down.
 */
export async function redisGet(key) {
  try {
    const c = await getClient();
    if (!c) return null;
    const value = await c.get(key);
    return value;
  } catch (err) {
    console.error("[Redis] GET failed (fail-open):", err.message);
    return null;
  }
}

/**
 * Set a value in Redis with optional TTL (seconds).
 */
export async function redisSet(key, value, ttlSeconds = null) {
  try {
    const c = await getClient();
    if (!c) return false;
    if (ttlSeconds) {
      await c.set(key, String(value), { EX: ttlSeconds });
    } else {
      await c.set(key, String(value));
    }
    return true;
  } catch (err) {
    console.error("[Redis] SET failed (fail-open):", err.message);
    return false;
  }
}

/**
 * Set a value only if it does NOT already exist (NX + EX).
 * Returns true if set, false if key already exists.
 */
export async function redisSetNX(key, value, ttlSeconds = null) {
  try {
    const c = await getClient();
    if (!c) return false;
    if (ttlSeconds) {
      return (await c.set(key, String(value), { NX: true, EX: ttlSeconds })) === "OK";
    }
    return (await c.set(key, String(value), { NX: true })) === "OK";
  } catch (err) {
    console.error("[Redis] SET NX failed (fail-open):", err.message);
    return false;
  }
}

/**
 * Delete a key.
 */
export async function redisDel(key) {
  try {
    const c = await getClient();
    if (!c) return false;
    await c.del(key);
    return true;
  } catch (err) {
    console.error("[Redis] DEL failed (fail-open):", err.message);
    return false;
  }
}

/**
 * Increment a counter. Returns the new value, or NaN if Redis is down.
 */
export async function redisIncr(key) {
  try {
    const c = await getClient();
    if (!c) return NaN;
    return await c.incr(key);
  } catch (err) {
    console.error("[Redis] INCR failed (fail-open):", err.message);
    return NaN;
  }
}

/**
 * Set an expiry (TTL) on an existing key.
 */
export async function redisExpire(key, ttlSeconds) {
  try {
    const c = await getClient();
    if (!c) return false;
    await c.expire(key, ttlSeconds);
    return true;
  } catch (err) {
    console.error("[Redis] EXPIRE failed (fail-open):", err.message);
    return false;
  }
}

/**
 * Get remaining TTL for a key (seconds). Returns -2 if missing, -1 if no expiry.
 */
export async function redisTTL(key) {
  try {
    const c = await getClient();
    if (!c) return -2;
    return await c.ttl(key);
  } catch (err) {
    console.error("[Redis] TTL failed (fail-open):", err.message);
    return -2;
  }
}

export default {
  redisGet,
  redisSet,
  redisSetNX,
  redisDel,
  redisIncr,
  redisExpire,
  redisTTL,
  isRedisAvailable,
};