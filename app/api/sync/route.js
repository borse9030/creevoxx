// app/api/sync/route.js
// Secure HTTP endpoint that triggers a CurseForge → Firestore sync.
// Called automatically by Vercel Cron Jobs (vercel.json) or manually.
//
// Authorization: must include header  x-sync-secret: <APP_SHARED_SECRET>

import { NextResponse } from "next/server";
import { adminBatchSetResources } from "@/lib/firestoreAdmin";

// ── Helpers shared with the CLI script ───────────────────────────────────────
function mapClassIdToCategory(classId, categories = []) {
  if (classId === 6 || classId === 4984) return "mods";
  if (classId === 12) return "textures";
  if (classId === 6552) return "shaders";
  if (classId === 6929) {
    return categories?.some((c) => c.id === 6939) ? "shaders" : "textures";
  }
  return "mods";
}

function extractVersion(item) {
  for (const file of item.latestFiles || []) {
    const found = (file.gameVersions || []).find((v) => /^1\.\d+(\.\d+)?$/.test(v));
    if (found) return found;
  }
  return "1.21";
}

async function cfFetch(url, apiKey) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "x-api-key": apiKey },
    // Don't cache — this is the sync source of truth
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`CF ${url} → ${res.status}`);
  return res.json();
}

async function fetchCategoryPage({ gameId = "432", classId, categoryId, index = 0, pageSize = 50, apiKey }) {
  const url = new URL("https://api.curseforge.com/v1/mods/search");
  url.searchParams.set("gameId", gameId);
  url.searchParams.set("pageSize", pageSize.toString());
  url.searchParams.set("index", index.toString());
  url.searchParams.set("sortField", "6");
  url.searchParams.set("sortOrder", "desc");
  if (classId)    url.searchParams.set("classId",    classId.toString());
  if (categoryId) url.searchParams.set("categoryId", categoryId.toString());

  const data = await cfFetch(url.toString(), apiKey);
  return data.data || [];
}

async function fetchDetails(curseforgeId, apiKey) {
  try {
    const modData = await cfFetch(`https://api.curseforge.com/v1/mods/${curseforgeId}`, apiKey);
    const mod = modData.data || {};

    let descriptionHtml = null;
    try {
      const descData = await cfFetch(`https://api.curseforge.com/v1/mods/${curseforgeId}/description`, apiKey);
      descriptionHtml = descData.data || null;
    } catch { /* optional */ }

    const versions = new Set();
    const loaders  = new Set();
    for (const file of mod.latestFiles || []) {
      for (const v of file.gameVersions || []) {
        if (/^1\.\d+(\.\d+)?$/.test(v)) versions.add(v);
        const l = v.toLowerCase();
        if (["forge", "fabric", "quilt", "neoforge"].includes(l))
          loaders.add(l.charAt(0).toUpperCase() + l.slice(1));
      }
    }
    const gameVersions = Array.from(versions)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, 6);

    let downloadUrl = null;
    let fileSize = null;
    const targetFile = (mod.latestFiles || []).find((f) => f.downloadUrl) || mod.latestFiles?.[0];
    if (targetFile) {
      downloadUrl = targetFile.downloadUrl ||
        `https://www.curseforge.com/api/v1/mods/${curseforgeId}/files/${targetFile.id}/download`;
      const bytes = targetFile.fileLength;
      if (bytes)
        fileSize = bytes > 1048576
          ? `${(bytes / 1048576).toFixed(2)} MB`
          : `${(bytes / 1024).toFixed(2)} KB`;
    }

    return {
      name:          mod.name,
      summary:       mod.summary || null,
      logoUrl:       mod.logo?.url || mod.logo?.thumbnailUrl || null,
      authors:       mod.authors || [],
      downloadCount: mod.downloadCount || null,
      dateCreated:   mod.dateCreated || null,
      dateModified:  mod.dateModified || null,
      descriptionHtml,
      screenshots:   mod.screenshots || [],
      gameVersions,
      modLoaders:    Array.from(loaders),
      downloadUrl,
      fileSize,
    };
  } catch {
    return null;
  }
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function GET(request) {
  // Auth check
  const secret = request.headers.get("x-sync-secret") || "";
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const APP_SECRET = process.env.APP_SHARED_SECRET || "";

  if (!isVercelCron && (!APP_SECRET || secret !== APP_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let apiKey = process.env.CURSEFORGE_API_KEY || "";
  if (apiKey) apiKey = apiKey.replace(/\\/g, "");
  if (!apiKey) {
    return NextResponse.json({ error: "CURSEFORGE_API_KEY not set" }, { status: 500 });
  }

  const RESOURCES_PER_CAT = 60;
  const DETAIL_CONCURRENCY = 5;

  try {
    console.log("[Sync] Starting CurseForge → Firestore sync...");

    // ── 1. Fetch resource lists ────────────────────────────────────────────
    const categories = [
      { name: "shaders",  classId: 6552, gameId: "432"   },
      { name: "textures", classId: 12,   gameId: "432"   },
      { name: "mods",     classId: 6,    gameId: "432"   },
      { name: "shaders",  categoryId: 6939, gameId: "78022" }, // Bedrock shaders
    ];

    const allResources = [];
    const seenIds = new Set();

    for (const cat of categories) {
      let collected = 0;
      let index = 0;
      while (collected < RESOURCES_PER_CAT) {
        let items;
        try {
          items = await fetchCategoryPage({ ...cat, index, pageSize: 50, apiKey });
        } catch (err) {
          console.error(`[Sync] fetchCategory failed:`, err.message);
          break;
        }
        if (!items.length) break;

        for (const item of items.filter((i) => i.allowModDistribution !== false)) {
          if (collected >= RESOURCES_PER_CAT) break;
          const id = item.id.toString();
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          const mappedCat = cat.gameId === "78022"
            ? (item.categories?.some((c) => c.id === 6939) ? "shaders" : "textures")
            : mapClassIdToCategory(item.classId, item.categories);

          allResources.push({
            id,
            curseforge_id:  item.id,
            title:          item.name,
            description:    item.summary || "No description provided.",
            category:       mappedCat,
            version:        extractVersion(item),
            thumbnail_url:  item.logo?.thumbnailUrl || item.logo?.url || "",
            logoUrl:        item.logo?.url || item.logo?.thumbnailUrl || "",
            curseforge_url: item.links?.websiteUrl || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(item.name)}`,
            author:         item.authors?.[0]?.name || "creator",
            download_count: item.downloadCount || 0,
            dateModified:   item.dateModified || null,
          });
          collected++;
        }

        index += 50;
        if (index >= RESOURCES_PER_CAT * 2) break;
      }
    }

    console.log(`[Sync] ${allResources.length} resources collected. Fetching details...`);

    // ── 2. Enrich with full details (concurrently, with pacing) ───────────
    const enriched = [];
    for (let i = 0; i < allResources.length; i += DETAIL_CONCURRENCY) {
      const batch = allResources.slice(i, i + DETAIL_CONCURRENCY);
      const details = await Promise.all(batch.map((r) => fetchDetails(r.curseforge_id, apiKey)));
      for (let j = 0; j < batch.length; j++) {
        enriched.push(details[j] ? { ...batch[j], ...details[j] } : batch[j]);
      }
      // Small delay to respect CurseForge rate limits
      await new Promise((r) => setTimeout(r, 250));
    }

    console.log(`[Sync] Details enriched for ${enriched.length} resources. Writing to Firestore...`);

    // ── 3. Write to Firestore ─────────────────────────────────────────────
    const { written, errors } = await adminBatchSetResources(enriched);

    console.log(`[Sync] Done. Written: ${written}, Errors: ${errors.length}`);

    return NextResponse.json({
      ok: true,
      synced: written,
      total: enriched.length,
      errors: errors.length,
      categories: enriched.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("[Sync] Fatal error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
