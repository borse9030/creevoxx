// lib/firestoreAdmin.js
// Server-side Firestore access using Firebase Admin SDK.
// Safe to import in Next.js Server Components and API Routes.
// Does NOT use localStorage or client-side Firebase SDK.

import { initializeApp as adminInit, getApps as adminGetApps, cert as adminCert } from "firebase-admin/app";
import { getFirestore as adminGetFirestore, FieldValue as adminFieldValue } from "firebase-admin/firestore";

// ── Initialise Admin SDK singleton ─────────────────────────────────────────
function getAdminApp() {
  const apps = adminGetApps();
  if (apps.length) return apps[0];

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("[FirestoreAdmin] FIREBASE_SERVICE_ACCOUNT_JSON not set — Admin SDK unavailable.");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return adminInit({ credential: adminCert(serviceAccount) });
  } catch (err) {
    console.error("[FirestoreAdmin] Init failed:", err.message);
    return null;
  }
}

function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  return adminGetFirestore();
}

// ── Read helpers ───────────────────────────────────────────────────────────

// Helper to convert Firestore Timestamps to plain ISO strings
// Next.js Server Components cannot pass rich objects like Timestamps to Client Components
function serializeDoc(docSnap) {
  const data = docSnap.data();
  if (!data) return null;
  
  for (const key in data) {
    if (data[key] && typeof data[key].toDate === "function") {
      data[key] = data[key].toDate().toISOString();
    }
  }
  return { docId: docSnap.id, ...data };
}

/**
 * Fetch a single resource document from Firestore by its numeric/string ID.
 * Returns null when not found or Admin SDK is unavailable.
 */
export async function adminGetResourceById(id) {
  try {
    const db = getAdminDb();
    if (!db) return null;

    const docSnap = await db.collection("resources").doc(String(id)).get();
    if (!docSnap.exists) return null;
    return serializeDoc(docSnap);
  } catch (err) {
    console.error(`[FirestoreAdmin] getResourceById(${id}) failed:`, err.message);
    return null;
  }
}

/**
 * Fetch resources by category, ordered by downloadCount desc.
 * pageSize defaults to 24; max 100.
 */
export async function adminGetResources({ category = null, pageSize = 24, offset = 0 } = {}) {
  try {
    const db = getAdminDb();
    if (!db) return [];

    let ref = db.collection("resources").orderBy("download_count", "desc");
    if (category && category !== "all") {
      ref = db.collection("resources")
        .where("category", "==", category)
        .orderBy("download_count", "desc");
    }

    const snap = await ref.limit(Math.min(pageSize, 100)).get();
    return snap.docs.map(serializeDoc);
  } catch (err) {
    console.error("[FirestoreAdmin] getResources failed:", err.message);
    return [];
  }
}

/**
 * Write (upsert) a single resource document.
 * Uses merge: true so existing fields not in `data` are preserved.
 */
export async function adminSetResource(id, data) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin not configured");

  await db
    .collection("resources")
    .doc(String(id))
    .set({ ...data, lastSynced: adminFieldValue.serverTimestamp() }, { merge: true });
}

/**
 * Bulk-write resources in Firestore batches (max 499 per batch).
 * Returns { written, errors }.
 */
export async function adminBatchSetResources(resources) {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin not configured");

  const BATCH_SIZE = 499;
  let written = 0;
  const errors = [];

  for (let i = 0; i < resources.length; i += BATCH_SIZE) {
    const chunk = resources.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const res of chunk) {
      const ref = db.collection("resources").doc(String(res.id || res.docId));
      batch.set(
        ref,
        { ...res, lastSynced: adminFieldValue.serverTimestamp() },
        { merge: true }
      );
    }
    try {
      await batch.commit();
      written += chunk.length;
      console.log(`[FirestoreAdmin] Batch ${Math.floor(i / BATCH_SIZE) + 1} committed (${chunk.length} docs).`);
    } catch (err) {
      console.error(`[FirestoreAdmin] Batch failed:`, err.message);
      errors.push({ batch: Math.floor(i / BATCH_SIZE) + 1, error: err.message });
    }
  }

  return { written, errors };
}
