import { getRedisClient } from "./redisClient";

const RATE_LIMIT = 120;      // max requests per window (increased for mobile app navigation)
const RATE_WINDOW = 60;     // window in seconds

/**
 * Redis-backed per-IP rate limiter.
 * Works correctly across all Vercel serverless instances (unlike in-memory Map).
 * Falls back to allowing the request if Redis is unavailable.
 *
 * @param {string} ip - The client IP address
 * @returns {Promise<boolean>} true if the request should be blocked
 */
export async function isRateLimited(ip) {
  const client = await getRedisClient();

  // If Redis is down, fail open (allow request) so the app stays available
  if (!client) return false;

  const key = `rl:${ip}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      // First request in this window — set the expiry
      await client.expire(key, RATE_WINDOW);
    }
    return count > RATE_LIMIT;
  } catch (err) {
    console.error("[RateLimiter] Redis error:", err.message);
    return false; // fail open
  }
}
