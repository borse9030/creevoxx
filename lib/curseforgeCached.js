import { getRedisClient } from "./redisClient";
import { checkAndIncrementQuota } from "./quotaGuard";
import { fetchCurseforgeSearch, fetchCurseforgeDetails } from "./curseforge";
import { fuzzySearchResources } from "./fuzzySearch";

const CACHE_TTL_SECONDS = 6 * 60 * 60;       // 6 hours for search results
const COUNTS_TTL_SECONDS = 60 * 60;           // 1 hour for category counts (FIX 4)
const DETAILS_TTL_SECONDS = 24 * 60 * 60;     // 24 hours for mod details

// L1 Fast In-Memory Cache (0ms latency for hot repeated queries in server RAM)
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 100;
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getFromMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > MEMORY_CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data;
}

function setToMemoryCache(key, data) {
  if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Cached wrapper for fetchCurseforgeSearch.
 * Multi-tier Caching Architecture:
 * - L1: Server RAM In-Memory Cache (0ms)
 * - L2: Upstash Redis Shared Cache (<5ms, 6h TTL)
 * - L3: Live CurseForge API
 */
export async function fetchCurseforgeSearchCached(params) {
  const client = await getRedisClient();

  const {
    query = "",
    category = "all",
    device = "all",
    index = 0,
    pageSize = 24,
    sortField = "6",
    sortOrder = "desc",
    edition = "java",
    version = "",
    categoryId = undefined,
  } = params;

  // v5: busted cache to fix bedrock seed fallback bug
  const cacheKey = `cf_search_v5_${query.trim()}_${category}_${device}_${index}_${pageSize}_${sortField}_${sortOrder}_${edition}_${version}_cid${categoryId ?? "none"}`;

  // 0. L1 In-Memory Cache (0ms response for hot repeated requests)
  const memData = getFromMemoryCache(cacheKey);
  if (memData) {
    console.log(`[L1 RAM HIT] ${cacheKey}`);
    return memData;
  }

  const FLUTTER_UI_QUERIES = new Set([
    "devil vision", "scary fog", "nissan pink petals", "legendary rtx", 
    "naturalism shaders", "fused better rain", "elys pbr", "batman heavy rain red", "eclipse deferred",
    "vibrant visual", "low end", "high end", "pvp", "rtx", "3d", "faithful", "realistic",
    "furniture", "weapons", "vehicles", "magic", "tech", "render dragon", "vibrant"
  ]);

  // 1. If explicit categoryId is provided — use Redis cache then CurseForge API
  if (categoryId) {
    if (client) {
      try {
        const cachedStr = await client.get(cacheKey);
        if (cachedStr) {
          console.log(`[Redis HIT] categoryId=${categoryId} q="${query}" page=${index}`);
          const parsed = JSON.parse(cachedStr);
          setToMemoryCache(cacheKey, parsed);
          return parsed;
        }
      } catch (err) {
        console.error("[Redis Cache Read Error]", err.message);
      }
    }
    console.log(`[CurseForge LIVE] categoryId=${categoryId} q="${query}" page=${index}`);
    const result = await fetchCurseforgeSearch(params);
    if (result) {
      setToMemoryCache(cacheKey, result);
      if (client) {
        try { await client.set(cacheKey, JSON.stringify(result), { EX: CACHE_TTL_SECONDS }); } catch {}
      }
    }
    return result;
  }

  // 2. Check if we can fulfill from synced Firestore/seed data.
  // IMPORTANT: The seed data only contains Java Edition content (Java shaders, Java
  // texture packs, Java mods). For bedrock/pocket edition, skip seed data entirely
  // and route to the live CurseForge Bedrock API (gameId=78022) which returns
  // Bedrock-only content (Render Dragon shaders, Bedrock texture packs, Addons).
  const isBedrockRequest = edition === "bedrock" || edition === "pocket";
  const isSeedableCategory = (category === "shaders" || category === "textures" || category === "mods") && !isBedrockRequest;
  if ((!query.trim() || FLUTTER_UI_QUERIES.has(query.trim().toLowerCase())) && isSeedableCategory) {
    console.log(`[Firestore/Seed HIT] Serving browsing list from synced data: ${cacheKey}`);
    const { SEED_DATA } = await import("./syncDatabase.js");
    const seedResult = buildSeedFallback(SEED_DATA, params);
    setToMemoryCache(cacheKey, seedResult);
    return seedResult;
  }

  // 3. Try Redis cache first (for actual text searches)
  if (client) {
    try {
      const cachedDataStr = await client.get(cacheKey);
      if (cachedDataStr) {
        const parsed = JSON.parse(cachedDataStr);
        setToMemoryCache(cacheKey, parsed);
        return parsed;
      }
    } catch (err) {
      console.error("[Redis Cache Read Error]", err.message);
    }
  }

  // 4. Check global CurseForge hourly quota (for searches)
  const { exceeded } = await checkAndIncrementQuota();
  if (exceeded) {
    console.warn("[CurseforgeCached] Hourly quota exceeded — returning seed fallback");
    const { SEED_DATA } = await import("./syncDatabase.js");
    return buildSeedFallback(SEED_DATA, params);
  }

  // 5. Fetch fresh from CurseForge
  console.log(`[Redis Cache MISS] Fetching fresh search: ${cacheKey}`);
  try {
    const freshData = await fetchCurseforgeSearch(params);
    if (freshData) {
      // Attach real category counts if missing or zero
      if (!freshData.counts || !freshData.counts.shaders || freshData.counts.shaders === 0) {
        const gameId = (edition === "bedrock" || edition === "pocket") ? "78022" : "432";
        // Fix: resolve the real API key here — don't pass undefined
        const resolvedKey = (process.env.CURSEFORGE_API_KEY || "").replace(/\\/g, "").replace(/^['"]|['"]$/g, "");
        const realCounts = await getCachedCounts(gameId, query, version, resolvedKey).catch(() => null);
        if (realCounts) {
          freshData.counts = { ...realCounts, total: freshData.pagination?.totalCount || realCounts.total };
        }
      }
      setToMemoryCache(cacheKey, freshData);
      if (client) {
        await client.set(cacheKey, JSON.stringify(freshData), { EX: CACHE_TTL_SECONDS }).catch(() => {});
      }
    }
    return freshData;
  } catch (error) {
    console.error("[CurseforgeCached] Search fetch failed:", error.message);
    const { SEED_DATA } = await import("./syncDatabase.js");
    return buildSeedFallback(SEED_DATA, params);
  }
}

/**
 * Cached wrapper for fetchCurseforgeDetails.
 * Priority: Redis cache → Firestore (synced data) → CurseForge API
 * Details are cached for 24 hours.
 */
export async function fetchCurseforgeDetailsCached(id) {
  const client = await getRedisClient();
  const cacheKey = `cf_details_v2_${id}`;

  // 1. Try Redis cache first
  if (client) {
    try {
      const cachedDataStr = await client.get(cacheKey);
      if (cachedDataStr) {
        return JSON.parse(cachedDataStr);
      }
    } catch (err) {
      console.error("[Redis Cache Read Error]", err.message);
    }
  }

  // 2. Try Firestore (synced data) — skip CurseForge API if data is fresh
  try {
    const { adminGetResourceById } = await import("./firestoreAdmin.js");
    const fsDoc = await adminGetResourceById(id);
    if (fsDoc && fsDoc.name && fsDoc.authors) {
      // Check if synced within last 24 hours (or lastSynced not set, still use it)
      const lastSynced = fsDoc.lastSynced?.toDate?.() || null;
      const isStale = lastSynced
        ? Date.now() - lastSynced.getTime() > 24 * 60 * 60 * 1000
        : false;

      if (!isStale) {
        console.log(`[Firestore Cache HIT] details for ${id}`);
        // Shape the Firestore data to match fetchCurseforgeDetails return format
        const shaped = {
          id:             Number(fsDoc.curseforge_id) || null,
          name:           fsDoc.name || fsDoc.title,
          summary:        fsDoc.summary || fsDoc.description || null,
          category:       fsDoc.category,
          logoUrl:        fsDoc.logoUrl || fsDoc.thumbnail_url || null,
          authors:        fsDoc.authors || (fsDoc.author ? [{ name: fsDoc.author }] : []),
          downloadCount:  fsDoc.downloadCount || fsDoc.download_count || null,
          dateCreated:    fsDoc.dateCreated || null,
          dateModified:   fsDoc.dateModified || null,
          descriptionHtml: fsDoc.descriptionHtml || null,
          screenshots:    fsDoc.screenshots || [],
          gameVersions:   fsDoc.gameVersions || (fsDoc.version ? [fsDoc.version] : []),
          modLoaders:     fsDoc.modLoaders || [],
          downloadUrl:    fsDoc.downloadUrl || null,
          fileSize:       fsDoc.fileSize || null,
        };

        // Cache in Redis so next request is even faster
        if (client) {
          client.set(cacheKey, JSON.stringify(shaped), { EX: DETAILS_TTL_SECONDS }).catch(() => {});
        }
        return shaped;
      }
    }
  } catch (fsErr) {
    // Non-fatal: Firestore unavailable, fall through to CurseForge API
    console.warn(`[CurseforgeCached] Firestore lookup failed for ${id}:`, fsErr.message);
  }

  // 3. Check global quota
  const { exceeded } = await checkAndIncrementQuota();
  if (exceeded) {
    console.warn(`[CurseforgeCached] Quota exceeded — cannot fetch details for ${id}`);
    throw new Error("Service temporarily unavailable — please try again shortly.");
  }

  // 4. Fetch fresh from CurseForge API (last resort)
  console.log(`[Redis Cache MISS] Fetching fresh details from CurseForge: ${id}`);
  try {
    const freshData = await fetchCurseforgeDetails(id);
    if (freshData && client) {
      await client.set(cacheKey, JSON.stringify(freshData), { EX: DETAILS_TTL_SECONDS }).catch(() => {});
    }
    return freshData;
  } catch (error) {
    console.warn(`[CurseforgeCached] Details fetch failed for ${id}:`, error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// FIX 4: Cached category counts
// Each search previously triggered 4 extra CurseForge API calls just to get
// category counts. Now counts are cached in Redis for 1 hour and shared
// across all requests, reducing count-fetching calls by ~99%.
// ---------------------------------------------------------------------------

/**
 * Returns cached category counts for a given gameId + query combination.
 * Calls CurseForge only on cache miss (once per hour).
 */
export async function getCachedCounts(gameId, query, version, apiKey) {
  let keyToUse = apiKey || process.env.CURSEFORGE_API_KEY;
  if (keyToUse) keyToUse = keyToUse.replace(/\\/g, "").replace(/^['"]|['"]$/g, "");

  const client = await getRedisClient();
  const countsCacheKey = `cf_counts_v1_${gameId}_${query.trim()}_${version}`;

  if (client) {
    try {
      const cached = await client.get(countsCacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error("[Redis Counts Read Error]", err.message);
    }
  }

  // Fetch fresh counts — increment quota for these calls
  await checkAndIncrementQuota(); // count the 4 calls as 1 quota unit
  const counts = await fetchFreshCounts(gameId, query, version, keyToUse);

  if (client && counts) {
    await client.set(countsCacheKey, JSON.stringify(counts), { EX: COUNTS_TTL_SECONDS }).catch(() => {});
  }

  return counts;
}

async function fetchFreshCounts(gameId, query, version, apiKey) {
  const countFetch = async (clsId, catId) => {
    try {
      const countUrl = new URL("https://api.curseforge.com/v1/mods/search");
      countUrl.searchParams.set("gameId", gameId);
      if (query.trim()) countUrl.searchParams.set("searchFilter", query);
      if (clsId !== undefined) countUrl.searchParams.set("classId", clsId.toString());
      if (catId !== undefined) countUrl.searchParams.set("categoryId", catId.toString());
      if (version) countUrl.searchParams.set("gameVersion", version);
      countUrl.searchParams.set("index", "0");
      countUrl.searchParams.set("pageSize", "1");
      countUrl.searchParams.set("sortField", "6");
      countUrl.searchParams.set("sortOrder", "desc");

      countUrl.searchParams.set("_v", "2");

      const headers = {
        Accept: "application/json",
        "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
      };
      if (apiKey) headers["x-api-key"] = apiKey;

      const res = await fetch(countUrl.toString(), {
        headers,
        next: { revalidate: 3600 },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.pagination?.totalCount || 0;
    } catch {
      return 0;
    }
  };

  if (gameId === "78022") {
    const [total, mods, textures, shaders] = await Promise.all([
      countFetch(undefined, undefined),
      countFetch(4984, undefined),
      countFetch(6929, undefined),
      countFetch(undefined, 6939),
    ]);
    return { total, mods, textures, shaders };
  } else {
    const [total, mods, textures, shaders] = await Promise.all([
      countFetch(undefined, undefined),
      countFetch(6, undefined),
      countFetch(12, undefined),
      countFetch(6552, undefined),
    ]);
    return { total, mods, textures, shaders };
  }
}

// ---------------------------------------------------------------------------
// getLiveStats — always fetches real counts from CurseForge API (not seed data)
// Used by Hero section (desktop) and Mobile stats bar.
// Results are cached in Redis for 1 hour and in memory for 5 minutes.
// ---------------------------------------------------------------------------

const LIVE_STATS_MEMORY_KEY = "creevoxx_live_stats_bedrock";

export async function getLiveStats() {
  // L1: In-memory cache
  const cached = getFromMemoryCache(LIVE_STATS_MEMORY_KEY);
  if (cached) return cached;

  const client = await getRedisClient();
  const redisCacheKey = "cf_live_stats_bedrock_v1";

  // L2: Redis cache
  if (client) {
    try {
      const redisData = await client.get(redisCacheKey);
      if (redisData) {
        const parsed = JSON.parse(redisData);
        setToMemoryCache(LIVE_STATS_MEMORY_KEY, parsed);
        return parsed;
      }
    } catch (err) {
      console.error("[getLiveStats] Redis read error:", err.message);
    }
  }

  // L3: Fetch from CurseForge API directly (Bedrock gameId=78022)
  const apiKey = (process.env.CURSEFORGE_API_KEY || "").replace(/\\/g, "").replace(/^['"]|['"]$/g, "");

  const countFetch = async (classId, categoryId) => {
    try {
      const url = new URL("https://api.curseforge.com/v1/mods/search");
      url.searchParams.set("gameId", "78022");
      if (classId != null) url.searchParams.set("classId", classId.toString());
      if (categoryId != null) url.searchParams.set("categoryId", categoryId.toString());
      url.searchParams.set("pageSize", "1");
      url.searchParams.set("sortField", "6");
      url.searchParams.set("sortOrder", "desc");

      const headers = {
        Accept: "application/json",
        "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
      };
      if (apiKey) headers["x-api-key"] = apiKey;

      const res = await fetch(url.toString(), { headers, next: { revalidate: 3600 } });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.pagination?.totalCount || 0;
    } catch {
      return 0;
    }
  };

  try {
    const [total, mods, textures, shaders, maps, skins] = await Promise.all([
      countFetch(null, null),          // All Bedrock
      countFetch(4984, null),          // Addons / Mods
      countFetch(6929, null),          // Texture Packs
      countFetch(null, 6939),          // Shaders (subcategory)
      countFetch(6913, null),          // Maps
      countFetch(6925, null),          // Skins
    ]);

    const liveStats = { total, mods, textures, shaders, maps, skins };

    // Cache result
    setToMemoryCache(LIVE_STATS_MEMORY_KEY, liveStats);
    if (client) {
      await client.set(redisCacheKey, JSON.stringify(liveStats), { EX: 60 * 60 }).catch(() => {});
    }

    console.log("[getLiveStats] Fetched live Bedrock stats:", liveStats);
    return liveStats;
  } catch (err) {
    console.error("[getLiveStats] Failed to fetch live stats:", err.message);
    // Return safe zeroes — UI will hide zero-value pills
    return { total: 0, mods: 0, textures: 0, shaders: 0, maps: 0, skins: 0 };
  }
}

// ---------------------------------------------------------------------------
// Seed fallback helper
// ---------------------------------------------------------------------------
function buildSeedFallback(seedData, { query = "", category = "all", index = 0, pageSize = 24, sortField = "6", sortOrder = "desc", edition = "all", version = "", device = "all" }) {
  let list = [...seedData];

  if (category !== "all") list = list.filter((r) => r.category === category);
  
  // Filter by edition if requested
  if (edition === "bedrock" || edition === "pocket") {
    list = list.filter(
      (r) =>
        (r.curseforge_url && r.curseforge_url.includes("minecraft-bedrock")) ||
        r.category === "shaders" ||
        (r.title && (r.title.toLowerCase().includes("bedrock") || r.title.toLowerCase().includes("mcpe") || r.title.toLowerCase().includes("pe")))
    );
  } else if (edition === "java") {
    list = list.filter((r) => !r.curseforge_url || !r.curseforge_url.includes("minecraft-bedrock"));
  }

  // Filter by version
  if (version) {
    const targetVersions = version.split(",");
    list = list.filter((r) => targetVersions.some((tv) => r.version?.includes(tv)));
  }

  // Filter by device
  if (device === "low-end") {
    list = list.filter((r) => r.category === "shaders" || (r.title && r.title.toLowerCase().match(/lite|low|fps|pe|pocket/)));
  } else if (device === "high-end") {
    list = list.filter((r) => r.category === "shaders" || (r.title && r.title.toLowerCase().match(/rtx|ultra|hd|pbr/)));
  }

  if (query.trim()) list = fuzzySearchResources(list, query, "all");

  // Sorting
  if (sortField === "3" || sortField === "1") {
    list.sort((a, b) => new Date(b.dateModified || 0) - new Date(a.dateModified || 0));
  } else if (sortField === "4") {
    list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else {
    list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
  }

  if (sortOrder === "asc") list.reverse();

  const paginated = list.slice(index, index + pageSize);
  return {
    data: paginated.map((item) => ({ ...item, docId: item.id })),
    pagination: { index, pageSize, resultCount: paginated.length, totalCount: list.length },
    counts: {
      total: seedData.length,
      mods: seedData.filter((r) => r.category === "mods").length,
      textures: seedData.filter((r) => r.category === "textures").length,
      shaders: seedData.filter((r) => r.category === "shaders").length,
      maps: seedData.filter((r) => r.category === "maps").length,
      skins: seedData.filter((r) => r.category === "skins").length,
    },
  };
}
