#!/usr/bin/env node
// scripts/importCurseForge.js

import { config } from "dotenv";
config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let apiKey = process.env.CURSEFORGE_API_KEY;
if (apiKey) {
  apiKey = apiKey.replace(/\\/g, "");
}

if (!apiKey) {
  console.error("❌ CURSEFORGE_API_KEY is missing in .env.local!");
  process.exit(1);
}

// Validate that Firebase credentials are provided
const missingFirebase = Object.entries(firebaseConfig)
  .filter(([, v]) => !v || v.includes("your_"))
  .map(([k]) => k);

if (missingFirebase.length > 0) {
  console.error("❌ Missing Firebase credentials in .env.local:");
  missingFirebase.forEach((k) => console.error(`   • ${k}`));
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Curated list of popular CurseForge IDs
const modIds = [
  // Mods (classId: 6)
  238222, // Just Enough Items (JEI)
  32274,  // JourneyMap
  328085, // Create
  261166, // Clumps
  248787, // AppleSkin
  223852, // Mouse Tweaks
  245733, // Waystones
  252865, // Nature's Compass
  250398, // Controlling
  361579, // Spark
  422301, // Sophisticated Backpacks
  220318, // Biomes O' Plenty
  230911, // Fast Leaf Decay
  238529, // Gravestone Mod
  
  // Resource Packs / Textures (classId: 12)
  534063, // Fresh Animations
  220919, // Sphax PureBDcraft
  348074, // Bare Bones
  349275, // Stay True
  477174, // Faithless
  341053, // Clarity
  224675, // John Smith Legacy
  326848, // Dramatic Sky
  318359, // Xray Ultimate
  501625, // Patrix
  
  // Shaders (classId: 6552)
  813295, // Complementary Shaders - Unbound
  953118, // Complementary Shaders - Rebound
  272370, // BSL Shaders
  252179, // Sildur's Vibrant Shaders
  552697, // AstraLex Shaders
  379899, // Kappa Shaders
  687223, // Rethinking Voxels
  853412, // Bliss Shader
  933068, // Pastel Shaders

  // Bedrock Shaders (classId: 6929, categoryId: 6939)
  1179976, // Newb Shader (Real Newb Shader)
  1246506, // Newb X Dawn Shader
  1246515, // Newb Complementary Shader
  1246521, // Newb X Ale
  1248967, // Newb X Stars Shader
  1174285, // iOS Newb X LMI
];

function extractVersion(item) {
  if (item.latestFiles && Array.isArray(item.latestFiles)) {
    for (const file of item.latestFiles) {
      if (file.gameVersions && Array.isArray(file.gameVersions)) {
        const found = file.gameVersions.find(v => v.match(/^1\.\d+(\.\d+)?$/));
        if (found) return found;
      }
    }
  }
  return "1.21"; // default fallback
}

function mapClassIdToCategory(classId, categories = []) {
  if (classId === 6) return "mods";
  if (classId === 12) return "textures";
  if (classId === 6552) return "shaders";
  if (classId === 6929) {
    if (categories && categories.some((c) => c.id === 6939)) {
      return "shaders";
    }
    return "textures";
  }
  return "mods"; // fallback
}

async function run() {
  console.log(`🌱 Fetching ${modIds.length} curated resources from CurseForge API...`);
  
  const url = "https://api.curseforge.com/v1/mods";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({ modIds })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`CurseForge API responded with ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const items = result.data || [];
    
    console.log(`📋 Found ${items.length} mods successfully. Formatting data...`);
    
    const formattedResources = [];

    for (const item of items) {
      const docId = item.slug || item.id.toString();
      const title = item.name;
      const description = item.summary || "No description provided.";
      const category = mapClassIdToCategory(item.classId, item.categories);
      const version = extractVersion(item);
      const thumbnail_url = item.logo ? item.logo.thumbnailUrl || item.logo.url : "";
      const curseforge_url = item.links ? item.links.websiteUrl : `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(title)}`;
      const author = item.authors && item.authors[0] ? item.authors[0].name : "creator";
      const download_count = item.downloadCount || 0;
      
      formattedResources.push({
        id: docId,
        curseforge_id: item.id,
        title,
        description,
        category,
        version,
        thumbnail_url,
        curseforge_url,
        author,
        download_count
      });
    }

    // Write to local seed JSON
    const localSeedPath = path.resolve("lib/curseforge_seed.json");
    fs.writeFileSync(localSeedPath, JSON.stringify(formattedResources, null, 2));
    console.log(`💾 Saved ${formattedResources.length} items to local seed: ${localSeedPath}`);

    console.log(`🚀 Writing items to Firestore...`);
    let totalImported = 0;
    let totalErrors = 0;

    for (const res of formattedResources) {
      try {
        const docRef = doc(collection(db, "resources"), res.id);
        await setDoc(
          docRef,
          {
            ...res,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`   ✅ [${res.category.toUpperCase()}] ${res.title} (${res.version})`);
        totalImported++;
      } catch (err) {
        console.error(`   ❌ Failed to write to Firestore: ${res.title} — ${err.message}`);
        totalErrors++;
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎉 Import complete:`);
    console.log(`   Local File: ${formattedResources.length} items saved`);
    console.log(`   Firestore: ${totalImported} items written, ${totalErrors} errors`);
    console.log(`\n👉 Note: If Firestore failed with PERMISSION_DENIED, the app will safely`);
    console.log(`   fall back to the local file. To fix Firestore, update your rules in`);
    console.log(`   the Firebase Console to allow writes to 'resources'.`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // We exit with 0 because we successfully updated the local fallback seed file
    process.exit(0);

  } catch (error) {
    console.error("💥 Import script crashed:", error.message);
    process.exit(1);
  }
}

run();
