#!/usr/bin/env node
// scripts/seed.js
// ─────────────────────────────────────────────────────────────
// ONE-TIME seed script to populate your Firestore database.
//
// Usage:
//   1. Rename .env.local.example to .env.local and fill in your Firebase credentials.
//   2. Run:  node scripts/seed.js
//
// This script uses the Firebase Web SDK (not Admin SDK) for simplicity.
// Run it from your local machine ONLY — never from a CI/CD pipeline.
// ─────────────────────────────────────────────────────────────

// Load .env.local variables
import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { SEED_DATA } from "../lib/syncDatabase.js";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that credentials are provided
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v || v.includes("your_"))
  .map(([k]) => k);

if (missing.length > 0) {
  console.error("\n❌ Missing Firebase credentials in .env.local:");
  missing.forEach((k) => console.error(`   • ${k}`));
  console.error("\n→ Copy .env.local.example to .env.local and fill in your credentials.\n");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`\n🌱 Seeding ${SEED_DATA.length} resources into Firestore...`);
  console.log(`   Project: ${firebaseConfig.projectId}\n`);

  let written = 0;
  let errors = 0;

  for (const resource of SEED_DATA) {
    try {
      const docRef = doc(collection(db, "resources"), resource.id);
      await setDoc(
        docRef,
        {
          ...resource,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`   ✅ [${resource.category.toUpperCase().padEnd(8)}] ${resource.title}`);
      written++;
    } catch (err) {
      console.error(`   ❌ Failed: ${resource.title} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Seeding complete: ${written} written, ${errors} errors`);
  console.log(`\n→ Your Firestore console: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore\n`);

  process.exit(errors > 0 ? 1 : 0);
}

seed().catch((err) => {
  console.error("\n💥 Seed script crashed:", err);
  process.exit(1);
});
