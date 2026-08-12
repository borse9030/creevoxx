import { createClient } from "redis";

// Module-level singleton — shared across all imports in the same serverless instance.
let redisClient = null;

/**
 * Returns a connected Redis client, or null if REDIS_URL is not set or connection fails.
 * Used by rateLimiter.js, quotaGuard.js, and curseforgeCached.js.
 */
export async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;

  if (redisClient?.isOpen) return redisClient;

  try {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) =>
      console.error("[Redis Error]", err.message)
    );
    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    console.error("[Redis Connection Error]", error.message);
    redisClient = null;
    return null;
  }
}
