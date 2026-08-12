#!/usr/bin/env node
/**
 * scripts/syncCurseForge.js
 *
 * Bulk-syncs CurseForge data → Firestore.
 *
 * What it does:
 *   1. Fetches top popular resources per category (shaders, textures, mods)
 *      using the CurseForge search API.
 *   2. For each resource, also fetches FULL detail data (description HTML,
 *      screenshots, game versions, download URL, file size, etc.).
 *   3. Writes everything to Firestore `resources` collection (upsert/merge).
 *   4. Saves a local JSON fallback to `lib/curseforge_seed.json`.
 *
 * Usage:
 *   node scripts/syncCurseForge.js
 *   node scripts/syncCurseForge.js --dry-run   (fetch only, no writes)
 *   node scripts/syncCurseForge.js --category=shaders
 *
 * Environment variables required (from .env.local):
 *   CURSEFORGE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_* (for Firestore client SDK writes)
 *   FIREBASE_SERVICE_ACCOUNT_JSON (optional, for Admin SDK writes)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp as adminInit, getApps as adminGetApps, cert as adminCert } from "firebase-admin/app";
import { getFirestore as adminGetFirestore, FieldValue as adminFieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SEO_WHITELIST } from "../lib/seoWhitelist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ────────────────────────────────────────────────────────────────
let CF_API_KEY = process.env.CURSEFORGE_API_KEY || "";
if (CF_API_KEY) CF_API_KEY = CF_API_KEY.replace(/\\/g, "");

const DRY_RUN = process.argv.includes("--dry-run");
const CATEGORY_FILTER = process.argv.find((a) => a.startsWith("--category="))?.split("=")[1] || null;

const RESOURCES_PER_CATEGORY = 80;
const DETAIL_CONCURRENCY = 5;
const DETAIL_DELAY_MS = 300;

const JAVA_CATEGORIES = [
  { name: "shaders",  classId: 6552 },
  { name: "textures", classId: 12   },
  { name: "mods",     classId: 6    },
];
const BEDROCK_SHADERS = { name: "shaders", gameId: "78022", categoryId: 6939 };

// ─── Firebase Admin SDK init (bypasses Firestore security rules) ────────────
let adminDb = null;

function initAdminSDK() {
  if (adminGetApps().length) {
    adminDb = adminGetFirestore();
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("⚠  FIREBASE_SERVICE_ACCOUNT_JSON not set — will try client SDK fallback.");
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminInit({ credential: adminCert(serviceAccount) });
    adminDb = adminGetFirestore();
    console.log("✅ Firebase Admin SDK connected (bypasses security rules).");
  } catch (err) {
    console.error("❌ Firebase Admin init failed:", err.message);
  }
}

// ─── Firebase client SDK fallback (needs open rules) ───────────────────────
let clientDb = null;

function initClientSDK() {
  if (adminDb) return; // prefer Admin
  const firebaseConfig = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    clientDb = getFirestore(app);
    console.log("✅ Firebase client SDK connected (needs open Firestore rules).");
  } catch (err) {
    console.error("❌ Firebase client init failed:", err.message);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function cfFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "x-api-key": CF_API_KEY },
  });
  if (!res.ok) throw new Error(`CurseForge ${url} → ${res.status}`);
  return res.json();
}

// ─── Fetch list of resources for one category ────────────────────────────
async function fetchCategory({ name, classId, gameId = "432", categoryId }) {
  const results = [];
  const pageSize = 50;
  let index = 0;

  while (results.length < RESOURCES_PER_CATEGORY) {
    const url = new URL("https://api.curseforge.com/v1/mods/search");
    url.searchParams.set("gameId", gameId);
    url.searchParams.set("pageSize", pageSize.toString());
    url.searchParams.set("index", index.toString());
    url.searchParams.set("sortField", "6");   // TotalDownloads
    url.searchParams.set("sortOrder", "desc");
    if (classId)    url.searchParams.set("classId",    classId.toString());
    if (categoryId) url.searchParams.set("categoryId", categoryId.toString());

    let data;
    try {
      data = await cfFetch(url.toString());
    } catch (err) {
      console.error(`  ⚠ fetchCategory(${name}) page failed:`, err.message);
      break;
    }

    const items = (data.data || []).filter((i) => i.allowModDistribution !== false);
    if (!items.length) break;

    for (const item of items) {
      if (results.length >= RESOURCES_PER_CATEGORY) break;
      const cat = gameId === "78022"
        ? (item.categories?.some((c) => c.id === 6939) ? "shaders" : "textures")
        : mapClassIdToCategory(item.classId, item.categories);

      results.push({
        id:             item.id.toString(),
        curseforge_id:  item.id,
        title:          item.name,
        description:    item.summary || "No description provided.",
        category:       cat,
        version:        extractVersion(item),
        thumbnail_url:  item.logo?.thumbnailUrl || item.logo?.url || "",
        logoUrl:        item.logo?.url || item.logo?.thumbnailUrl || "",
        curseforge_url: item.links?.websiteUrl || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(item.name)}`,
        author:         item.authors?.[0]?.name || "creator",
        download_count: item.downloadCount || 0,
        dateModified:   item.dateModified || null,
      });
    }

    const total = data.pagination?.totalCount || 0;
    index += pageSize;
    if (index >= total || index >= RESOURCES_PER_CATEGORY) break;
    await sleep(200);
  }

  console.log(`  📦 ${name}: fetched ${results.length} resources`);
  return results;
}

// ─── Fetch full details for one resource ──────────────────────────────────
async function fetchDetails(curseforgeId) {
  try {
    // Mod info
    const modData = await cfFetch(`https://api.curseforge.com/v1/mods/${curseforgeId}`);
    const mod = modData.data || {};

    // Description HTML
    let descriptionHtml = null;
    try {
      const descData = await cfFetch(`https://api.curseforge.com/v1/mods/${curseforgeId}/description`);
      descriptionHtml = descData.data || null;
    } catch { /* optional */ }

    // Parse versions & loaders
    const versions = new Set();
    const loaders  = new Set();
    for (const file of mod.latestFiles || []) {
      for (const v of file.gameVersions || []) {
        if (/^1\.\d+(\.\d+)?$/.test(v)) versions.add(v);
        const l = v.toLowerCase();
        if (["forge", "fabric", "quilt", "neoforge"].includes(l)) {
          loaders.add(l.charAt(0).toUpperCase() + l.slice(1));
        }
      }
    }
    const gameVersions = Array.from(versions)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, 6);

    // Download URL + file size
    let downloadUrl = null;
    let fileSize = null;
    const fileWithUrl = (mod.latestFiles || []).find((f) => f.downloadUrl);
    const targetFile  = fileWithUrl || mod.latestFiles?.[0];
    if (targetFile) {
      downloadUrl = targetFile.downloadUrl ||
        `https://www.curseforge.com/api/v1/mods/${curseforgeId}/files/${targetFile.id}/download`;
      const bytes = targetFile.fileLength;
      if (bytes) {
        fileSize = bytes > 1024 * 1024
          ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
          : `${(bytes / 1024).toFixed(2)} KB`;
      }
    }

    return {
      // Full detail fields (same shape as fetchCurseforgeDetails return)
      name:            mod.name,
      summary:         mod.summary || null,
      logoUrl:         mod.logo?.url || mod.logo?.thumbnailUrl || null,
      authors:         mod.authors || [],
      downloadCount:   mod.downloadCount || null,
      dateCreated:     mod.dateCreated || null,
      dateModified:    mod.dateModified || null,
      descriptionHtml,
      screenshots:     mod.screenshots || [],
      gameVersions,
      modLoaders:      Array.from(loaders),
      downloadUrl,
      fileSize,
    };
  } catch (err) {
    console.warn(`    ⚠ details fetch failed for ${curseforgeId}:`, err.message);
    return null;
  }
}

// ─── Write to Firestore ────────────────────────────────────────────────────
async function writeToFirestore(resources) {
  // ── Admin SDK path (bypasses security rules) ────────────────────────────
  if (adminDb) {
    const BATCH_SIZE = 499;
    let written = 0;
    // TTL: documents auto-delete after 72 hours via Firestore TTL policy.
    // Enable in Firebase Console → Firestore → Indexes → TTL → field: expireAt
    // This ensures the sync is a time-limited cache, not a permanent mirror.
    const expireAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    for (let i = 0; i < resources.length; i += BATCH_SIZE) {
      const chunk = resources.slice(i, i + BATCH_SIZE);
      const batch = adminDb.batch();
      for (const res of chunk) {
        const ref = adminDb.collection("resources").doc(res.id);
        batch.set(ref, { ...res, lastSynced: adminFieldValue.serverTimestamp(), expireAt }, { merge: true });
      }
      try {
        await batch.commit();
        written += chunk.length;
        console.log(`  ✅ Admin batch ${Math.ceil((i + 1) / BATCH_SIZE)} committed (${chunk.length} docs, TTL: 72h)`);
      } catch (err) {
        console.error(`  ❌ Admin batch failed:`, err.message);
      }
    }
    return written;
  }

  // ── Client SDK fallback (requires open Firestore rules) ─────────────────
  if (clientDb) {
    const BATCH_SIZE = 499;
    let written = 0;
    // TTL: 72-hour expiry — same policy as Admin SDK path above.
    const expireAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    for (let i = 0; i < resources.length; i += BATCH_SIZE) {
      const chunk = resources.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(clientDb);
      for (const res of chunk) {
        const ref = doc(collection(clientDb, "resources"), res.id);
        batch.set(ref, { ...res, updatedAt: serverTimestamp(), expireAt }, { merge: true });
      }
      try {
        await batch.commit();
        written += chunk.length;
        console.log(`  ✅ Client batch ${Math.ceil((i + 1) / BATCH_SIZE)} committed (${chunk.length} docs, TTL: 72h)`);
      } catch (err) {
        console.error(`  ❌ Client batch failed (check Firestore rules):`, err.message);
      }
    }
    return written;
  }

  console.log("⚠ No Firestore connection — skipping DB write.");
  return 0;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function run() {
  console.log("\n🚀 Creevoxx — CurseForge → Firestore Sync");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   Category filter: ${CATEGORY_FILTER || "all"}\n`);

  if (!CF_API_KEY) {
    console.error("❌ CURSEFORGE_API_KEY missing in .env.local");
    process.exit(1);
  }

  // Initialise Firebase (Admin SDK preferred, client SDK as fallback)
  if (!DRY_RUN) {
    initAdminSDK();
    initClientSDK();
  }

  // ── 1. Fetch resource lists ──────────────────────────────────────────────
  const categoriesToSync = JAVA_CATEGORIES.filter(
    (c) => !CATEGORY_FILTER || c.name === CATEGORY_FILTER
  );

  const allResources = [];

  for (const cat of categoriesToSync) {
    console.log(`\n📋 Fetching Java ${cat.name}...`);
    const items = await fetchCategory(cat);
    allResources.push(...items);
    await sleep(500);
  }

  // Deduplicate by ID
  const existingIds = new Set(allResources.map((r) => r.id));

  // Also sync Bedrock shaders if not filtered
  if (!CATEGORY_FILTER || CATEGORY_FILTER === "shaders") {
    console.log(`\n📋 Fetching Bedrock shaders...`);
    const bedrockItems = await fetchCategory(BEDROCK_SHADERS);
    for (const item of bedrockItems) {
      if (!existingIds.has(item.id)) {
        allResources.push(item);
        existingIds.add(item.id);
      }
    }
    await sleep(500);
  }

  // ── 1b. Inject all SEO_WHITELIST items not already included ──────────────
  console.log(`\n📋 Injecting SEO Whitelist VIP items...`);
  let injectedCount = 0;
  for (const id of SEO_WHITELIST) {
    const strId = String(id);
    if (!existingIds.has(strId)) {
      allResources.push({
        id: strId,
        curseforge_id: id,
        category: "mods", // default fallback, will be overwritten if detail provides one
        is_whitelist_stub: true, // flag to indicate we need to backfill legacy fields
      });
      existingIds.add(strId);
      injectedCount++;
    }
  }
  console.log(`  📦 Injected ${injectedCount} missing VIP items.`);

  // ── 1c. Inject UI Specific Queries (Flutter App Homepage & Collections) ──
  console.log(`\n📋 Injecting UI Specific Queries...`);
  const UI_QUERIES = [
    "DEVIL VISION", "SCARY FOG", "NISSAN PINK PETALS", "LEGENDARY RTX", 
    "NATURALISM SHADERS", "FUSED BETTER RAIN", "ELYS PBR", "BATMAN HEAVY RAIN RED", "ECLIPSE DEFERRED",
    "Vibrant Visual", "Low End", "High End",
    "PVP", "RTX", "3D", "Faithful", "Realistic",
    "Furniture", "Weapons", "Vehicles", "Magic", "Tech",
    "render dragon", "vibrant", "rtx"
  ];

  let uiInjectedCount = 0;
  for (const q of UI_QUERIES) {
    for (const gid of [432, 78022]) {
      try {
        const url = new URL("https://api.curseforge.com/v1/mods/search");
        url.searchParams.set("gameId", gid);
        url.searchParams.set("searchFilter", q);
        url.searchParams.set("pageSize", "3"); // Top 3 per query per game edition is enough
        url.searchParams.set("sortField", "2"); // Popularity
        
        const data = await cfFetch(url.toString());
        for (const item of (data.data || [])) {
          const strId = String(item.id);
          if (!existingIds.has(strId)) {
            const cat = gid === 78022
              ? (item.categories?.some((c) => c.id === 6939) ? "shaders" : "textures")
              : mapClassIdToCategory(item.classId, item.categories);

            allResources.push({
              id:             strId,
              curseforge_id:  item.id,
              title:          item.name,
              description:    item.summary || "No description provided.",
              category:       cat,
              version:        extractVersion(item),
              thumbnail_url:  item.logo?.thumbnailUrl || item.logo?.url || "",
              logoUrl:        item.logo?.url || item.logo?.thumbnailUrl || "",
              curseforge_url: item.links?.websiteUrl || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(item.name)}`,
              author:         item.authors?.[0]?.name || "creator",
              download_count: item.downloadCount || 0,
              dateModified:   item.dateModified || null,
            });
            existingIds.add(strId);
            uiInjectedCount++;
          }
        }
      } catch (err) {
        console.error(`  ⚠ Failed to fetch UI query '${q}' for game ${gid}`);
      }
    }
    await sleep(200);
  }
  console.log(`  📦 Injected ${uiInjectedCount} UI specific items.`);

  console.log(`\n📊 Total resources to fetch details for: ${allResources.length}`);

  // ── 2. Fetch full details in batches ─────────────────────────────────────
  console.log(`\n🔍 Fetching full details for each resource (concurrency: ${DETAIL_CONCURRENCY})...`);

  const enriched = [];
  for (let i = 0; i < allResources.length; i += DETAIL_CONCURRENCY) {
    const batch = allResources.slice(i, i + DETAIL_CONCURRENCY);
    const detailResults = await Promise.all(
      batch.map((r) => fetchDetails(r.curseforge_id))
    );
    for (let j = 0; j < batch.length; j++) {
      const base = batch[j];
      const detail = detailResults[j];
      if (detail) {
        // Backfill legacy fields for injected stubs
        if (base.is_whitelist_stub) {
          base.title = detail.name;
          base.description = detail.summary || "No description provided.";
          base.thumbnail_url = detail.logoUrl || "";
          base.author = detail.authors?.[0]?.name || "creator";
          base.download_count = detail.downloadCount || 0;
          base.version = detail.gameVersions?.[0] || "1.21";
          base.curseforge_url = detail.downloadUrl || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(detail.name)}`;
          delete base.is_whitelist_stub;
        }
        enriched.push({ ...base, ...detail });
      } else {
        enriched.push(base);
      }
    }
    const pct = Math.round(((i + batch.length) / allResources.length) * 100);
    process.stdout.write(`\r  Progress: ${i + batch.length}/${allResources.length} (${pct}%)`);
    await sleep(DETAIL_DELAY_MS);
  }
  console.log("\n✅ Detail fetch complete.");

  // ── 3. Save local seed file ───────────────────────────────────────────────
  const seedPath = path.resolve(__dirname, "../lib/curseforge_seed.json");
  // Strip descriptionHtml from seed file (too large, it's in Firestore)
  const seedData = enriched.map(({ descriptionHtml, ...rest }) => rest);
  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2));
  console.log(`\n💾 Local seed saved: ${seedPath} (${enriched.length} items)`);

  // ── 4. Write to Firestore ─────────────────────────────────────────────────
  if (!DRY_RUN) {
    console.log(`\n🔥 Writing ${enriched.length} resources to Firestore...`);
    const written = await writeToFirestore(enriched);
    console.log(`✅ Firestore write complete: ${written} documents.`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const byCategory = enriched.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Sync Summary:");
  console.log(`   Total: ${enriched.length} resources`);
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`   ${cat}: ${count}`);
  }
  if (DRY_RUN) console.log("   (DRY RUN — no data was written)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(0);
}

run().catch((err) => {
  console.error("💥 Sync crashed:", err);
  process.exit(1);
});
