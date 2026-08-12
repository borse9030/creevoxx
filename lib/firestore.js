// lib/firestore.js
// Firestore read helpers with 3-hour localStorage caching.
// Falls back to DEMO_DATA when Firebase is not configured (no .env.local).

import { SEED_DATA } from "./syncDatabase";
import { db, isConfigured } from "./firebaseConfig";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours
const CACHE_PREFIX = "mc_cache_resources_v3";

// ─── Demo data (used when Firebase is not configured) ──────────
// Maps SEED_DATA into the same shape Firestore would return
const DEMO_DATA = SEED_DATA.map((r) => ({
  ...r,
  docId: r.id,
  createdAt: { seconds: Date.now() / 1000 - Math.random() * 86400 * 30 },
}));

// ─── Cache helpers ──────────────────────────────────────────────
function getCacheKey(category = "all") {
  return `${CACHE_PREFIX}_${category}`;
}

function readCache(key) {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify({ data, expires: Date.now() + CACHE_TTL_MS }));
  } catch {
    // Quota exceeded or private mode — skip silently
  }
}

/**
 * Fetch all resources (optionally filtered by category).
 * Priority: localStorage cache → Firestore (if configured) → Demo data
 *
 * @param {string|null} category - "shaders" | "textures" | "mods" | null (all)
 * @returns {Promise<Array>}
 */
export async function getResources(category = null) {
  const cacheKey = getCacheKey(category || "all");

  // 1. Check localStorage cache first
  const cached = readCache(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cached.length} resources from localStorage`);
    return cached;
  }

  // 2. If Firebase not configured, use demo data
  if (!isConfigured) {
    console.log("[Demo Mode] Returning local sample data (Firebase not configured)");
    const data = category
      ? DEMO_DATA.filter((r) => r.category === category)
      : DEMO_DATA;
    writeCache(cacheKey, data);
    return data;
  }

  // 3. Fetch from Firestore
  console.log(`[Firestore] Fetching resources (category: ${category || "all"})`);
  try {
    const resourcesRef = collection(db, "resources");
    const q = category
      ? query(resourcesRef, where("category", "==", category), orderBy("createdAt", "desc"))
      : query(resourcesRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const dbData = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));

    // Merge in any local seed data items (including CurseForge imports) not present in Firestore
    const dbIds = new Set(dbData.map((r) => r.id || r.docId));
    const localItems = category
      ? DEMO_DATA.filter((r) => r.category === category)
      : DEMO_DATA;

    const data = [...dbData];
    for (const item of localItems) {
      if (!dbIds.has(item.id)) {
        data.push(item);
      }
    }

    writeCache(cacheKey, data);
    console.log(`[Firestore] Loaded ${data.length} resources (merged with local fallback).`);
    return data;
  } catch (error) {
    console.error("[Firestore] Fetch error — falling back to demo data:", error);
    // Fallback to demo data on any Firestore error
    const data = category
      ? DEMO_DATA.filter((r) => r.category === category)
      : DEMO_DATA;
    return data;
  }
}

/**
 * Fetch a single resource by document ID.
 * Falls back to demo data if Firebase not configured.
 *
 * @param {string} docId - Firestore document ID (same as resource.id in demo)
 * @returns {Promise<Object|null>}
 */
export async function getResourceById(docId) {
  const cacheKey = `mc_cache_resource_${docId}`;

  // 1. Cache check
  const cached = readCache(cacheKey);
  if (cached) return cached;

  // 2. Demo mode fallback
  if (!isConfigured) {
    const found = DEMO_DATA.find((r) => r.docId === docId || r.id === docId);
    if (found) writeCache(cacheKey, found);
    return found || null;
  }

  // 3. Fetch from Firestore
  try {
    const docRef = doc(db, "resources", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Fallback to local seed data if not found in Firestore
      const found = DEMO_DATA.find((r) => r.docId === docId || r.id === docId);
      if (found) writeCache(cacheKey, found);
      return found || null;
    }

    const data = { docId: docSnap.id, ...docSnap.data() };
    writeCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[Firestore] Error fetching ${docId}:`, error);
    // Fallback to demo data
    return DEMO_DATA.find((r) => r.docId === docId || r.id === docId) || null;
  }
}

/**
 * Clear all mc_ prefixed cache entries.
 */
export function clearResourceCache() {
  if (typeof window === "undefined") return;
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith("mc_cache_")) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  console.log(`[Cache] Cleared ${toRemove.length} entries.`);
}
