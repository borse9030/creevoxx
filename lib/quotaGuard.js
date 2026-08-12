import { getRedisClient } from "./redisClient";

// Max CurseForge API calls allowed per hour across ALL users.
// CurseForge free tier limit is well above 5000/hr before throttling.
const HOURLY_QUOTA = 5000;
const QUOTA_KEY = "cf_hourly_quota";
const WINDOW_SECONDS = 3600; // 1 hour

/**
 * Increments the hourly CurseForge API call counter and checks if we've
 * exceeded the safe quota threshold.
 *
 * @returns {Promise<{exceeded: boolean, current: number}>}
 */
export async function checkAndIncrementQuota() {
  const client = await getRedisClient();

  // If Redis is unavailable, allow the call (fail open)
  if (!client) return { exceeded: false, current: 0 };

  try {
    const count = await client.incr(QUOTA_KEY);
    if (count === 1) {
      // First call this window — set 1 hour expiry
      await client.expire(QUOTA_KEY, WINDOW_SECONDS);
    }
    const exceeded = count > HOURLY_QUOTA;
    if (exceeded) {
      console.warn(`[QuotaGuard] CurseForge hourly quota EXCEEDED: ${count}/${HOURLY_QUOTA}`);
    }
    return { exceeded, current: count };
  } catch (err) {
    console.error("[QuotaGuard] Redis error:", err.message);
    return { exceeded: false, current: 0 }; // fail open
  }
}

/**
 * Returns the current quota usage without incrementing.
 */
export async function getQuotaStatus() {
  const client = await getRedisClient();
  if (!client) return { current: 0, limit: HOURLY_QUOTA };
  try {
    const count = parseInt(await client.get(QUOTA_KEY) || "0", 10);
    return { current: count, limit: HOURLY_QUOTA };
  } catch {
    return { current: 0, limit: HOURLY_QUOTA };
  }
}
