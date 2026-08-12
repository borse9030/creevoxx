// lib/syncDatabase.js
// Admin helper: batch-push resource data arrays into Firestore.
// Usage: import { syncDatabase } from "@/lib/syncDatabase";
//        await syncDatabase(resourcesArray);
//
// Run this ONCE from an admin page or Node.js script to populate the DB.
// NOTE: Requires Firebase Admin SDK for server-side use, or run in a trusted
// client context (your own machine) with the web SDK.

import curseforgeSeed from "./curseforge_seed.json" with { type: "json" };

// NOTE: syncDatabase is an admin helper. It accepts a `db` instance as a parameter.
// Pass your Firestore db instance when calling it (see scripts/seed.js for usage).
// The SEED_DATA export below is also used by lib/firestore.js for demo mode.

/**
 * Batch-write an array of resource objects into the Firestore "resources" collection.
 * Uses the resource's `id` field as the deterministic document ID (upsert pattern).
 * Firestore write batches are capped at 500 operations — this function auto-chunks.
 *
 * @param {Array<Object>} dataArray - Array of resource objects matching the schema
 * @returns {Promise<{written: number, errors: Array}>}
 */
export async function syncDatabase(db, dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.warn("[syncDatabase] No data provided.");
    return { written: 0, errors: [] };
  }

  if (!db) {
    console.error("[syncDatabase] No Firestore db instance provided.");
    return { written: 0, errors: [{ error: "No db instance" }] };
  }

  const { collection, doc, setDoc, serverTimestamp, writeBatch } = await import("firebase/firestore");
  const BATCH_SIZE = 499; // Firestore max is 500 per batch
  const errors = [];
  let totalWritten = 0;

  // Split into chunks to respect Firestore batch limits
  const chunks = [];
  for (let i = 0; i < dataArray.length; i += BATCH_SIZE) {
    chunks.push(dataArray.slice(i, i + BATCH_SIZE));
  }

  console.log(`[syncDatabase] Writing ${dataArray.length} records in ${chunks.length} batch(es)...`);

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const batch = writeBatch(db);

    for (const resource of chunk) {
      // Validate required fields
      const required = ["id", "title", "description", "category", "version", "thumbnail_url"];
      const missing = required.filter((f) => !resource[f]);
      if (missing.length > 0) {
        errors.push({ resource: resource.id || "unknown", missing });
        console.warn(`[syncDatabase] Skipping "${resource.id}" — missing: ${missing.join(", ")}`);
        continue;
      }

      // Validate category enum
      if (!["shaders", "textures", "mods", "maps", "skins"].includes(resource.category)) {
        errors.push({ resource: resource.id, error: `Invalid category: ${resource.category}` });
        continue;
      }

      const docRef = doc(collection(db, "resources"), resource.id);
      batch.set(
        docRef,
        {
          id: resource.id,
          title: resource.title,
          description: resource.description,
          category: resource.category,
          version: resource.version,
          thumbnail_url: resource.thumbnail_url,
          curseforge_url: resource.curseforge_url || "",
          author: resource.author || "creator",
          download_count: resource.download_count || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true } // merge: true = upsert, preserves existing fields
      );
    }

    try {
      await batch.commit();
      totalWritten += chunk.length - errors.filter((e) => e.resource).length;
      console.log(`[syncDatabase] Batch ${chunkIndex + 1}/${chunks.length} committed.`);
    } catch (err) {
      console.error(`[syncDatabase] Batch ${chunkIndex + 1} failed:`, err);
      errors.push({ batch: chunkIndex + 1, error: err.message });
    }
  }

  console.log(`[syncDatabase] Done. ${totalWritten} records written. ${errors.length} errors.`);
  return { written: totalWritten, errors };
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE: Real-world Minecraft resources seed data
// Call syncDatabase(SEED_DATA) to populate your Firestore DB
// ─────────────────────────────────────────────────────────────
const BASE_SEED_DATA = [
  // ── SHADERS ──────────────────────────────────────────────
  {
    id: "newb-x-legacy",
    title: "Newb X Legacy Shader",
    description: "A lightweight, vanilla-friendly shader for Minecraft Bedrock (MCPE/Windows 10). Enhances sky, water, and lighting without crushing your frame rate. Perfect for mobile devices and low-end PCs.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/238308/desc_3c0a0d48-78c6-4a5d-b5ee-42e0bbda0bdb.png",
    curseforge_url: "",
    author: "Deq",
    download_count: 850000,
  },
  {
    id: "bsl-shaders",
    title: "BSL Shaders",
    description:
      "One of the most popular and visually stunning shader packs for Minecraft. Features beautiful volumetric lighting, dynamic shadows, realistic water, and gorgeous bloom effects. Compatible with OptiFine and Iris Shaders.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/238308/desc_3c0a0d48-78c6-4a5d-b5ee-42e0bbda0bdb.png",
    curseforge_url: "https://www.curseforge.com/minecraft/customization/bsl-shaders",
  },
  {
    id: "complementary-reimagined",
    title: "Complementary Reimagined",
    description:
      "A continuation and reimagining of the iconic Complementary Shaders. Delivers a breathtaking, photorealistic visual experience with improved performance, enhanced lighting, and stunning atmospheric effects.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://cdn.modrinth.com/data/HVnmMxH1/79cb7c8123bbc54945305b2ebad6b8881efdf5f8_96.webp",
    curseforge_url: "",
  },
  {
    id: "seus-renewed",
    title: "SEUS Renewed",
    description:
      "Sonic Ether's Unbelievable Shaders Renewed brings AAA-quality cinematic lighting to Minecraft. Features ray-traced sunlight, soft shadows, and immersive atmospheric fog. A benchmark for Minecraft visuals.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/173269/desc_ae96e9c0-7de1-4e9d-8c06-7d7568eb3714.jpg",
    curseforge_url: "https://www.curseforge.com/minecraft/customization/seus-renewed",
  },
  {
    id: "iris-shaders-mod",
    title: "Iris Shaders",
    description:
      "A modern, open-source shader loader for Fabric/Quilt that replaces OptiFine shaders. Offers better performance and compatibility with modern Minecraft versions. Works with BSL, Complementary, and most popular shader packs.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://cdn.modrinth.com/data/YL57xq9U/18d0e7f076d3d6ed5bedd472b853909aac5da202_96.webp",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/irisshaders",
  },
  {
    id: "rethinking-voxels",
    title: "Rethinking Voxels",
    description:
      "A cutting-edge shader pack that uses a voxel-based global illumination approach to simulate realistic light bouncing, color bleeding, and ambient occlusion. Pushes Minecraft's visuals to their absolute limit.",
    category: "shaders",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/238308/desc_3c0a0d48-78c6-4a5d-b5ee-42e0bbda0bdb.png",
    curseforge_url: "",
  },
  // ── TEXTURE PACKS ─────────────────────────────────────────
  {
    id: "faithless",
    title: "Faithless",
    description:
      "A clean, faithful retexture of Minecraft's default resource pack at 16x16 resolution. Every block is carefully redesigned to feel fresh while preserving the classic Minecraft aesthetic. Perfect for players who want a subtle upgrade.",
    category: "textures",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/321524/desc_1e94f73a-d0f7-4a25-8c5f-8e2a74d7e41f.png",
    curseforge_url: "https://www.curseforge.com/minecraft/texture-packs/faithless",
  },
  {
    id: "fresh-animations",
    title: "Fresh Animations",
    description:
      "Overhauls all of Minecraft's entity animations to be smoother, more lifelike, and expressive. Mobs walk, swim, and attack with dramatically improved motion — completely transforms combat and exploration.",
    category: "textures",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/321524/desc_1e94f73a-d0f7-4a25-8c5f-8e2a74d7e41f.png",
    curseforge_url: "https://www.curseforge.com/minecraft/texture-packs/fresh-animations",
  },
  {
    id: "vanilla-tweaks",
    title: "Vanilla Tweaks",
    description:
      "A massive collection of small, customizable texture improvements for vanilla Minecraft. Choose exactly which tweaks to enable — from connected textures and clear glass to better tools and UI improvements.",
    category: "textures",
    version: "1.21",
    thumbnail_url: "https://vanillatweaks.net/img/pack-photos/vanillatweaks.png",
    curseforge_url: "",
  },
  {
    id: "stay-true",
    title: "Stay True",
    description:
      "An artist-crafted resource pack that enhances Minecraft's default textures with incredible detail and consistency. Blocks feel hand-painted and alive. One of the most beautiful 16x texture packs available.",
    category: "textures",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/321524/desc_1e94f73a-d0f7-4a25-8c5f-8e2a74d7e41f.png",
    curseforge_url: "https://www.curseforge.com/minecraft/texture-packs/stay-true",
  },
  {
    id: "xalis-bushy-leaves",
    title: "Xali's Bushy Leaves",
    description:
      "Transforms Minecraft's flat, sparse tree leaves into lush, dense, bushy canopies. Works in all biomes and pairs perfectly with shader packs for a breathtaking forest atmosphere.",
    category: "textures",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/321524/desc_1e94f73a-d0f7-4a25-8c5f-8e2a74d7e41f.png",
    curseforge_url: "https://www.curseforge.com/minecraft/texture-packs/xalis-bushy-leaves",
  },
  // ── MODS ──────────────────────────────────────────────────
  {
    id: "sodium",
    title: "Sodium",
    description:
      "The gold standard for Minecraft performance optimization. Rewrites the game's rendering engine from scratch, delivering massive FPS improvements (often 4-8x over vanilla) with zero visual quality loss. Essential for every modpack.",
    category: "mods",
    version: "1.21",
    thumbnail_url: "https://cdn.modrinth.com/data/AANobbMI/295862f4724dc3f78df3447ad6072b2dcd3ef0c9_96.webp",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/sodium",
  },
  {
    id: "litematica",
    title: "Litematica",
    description:
      "A powerful schematic mod for Fabric that lets you save, load, and place building blueprints in your world. Builders use it to visualize complex builds, assist construction with ghost overlays, and share creations.",
    category: "mods",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/309905/desc_5f4a20c2-ee6a-4db7-9b3b-73c3b8c0e3d6.png",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/litematica",
  },
  {
    id: "jei-just-enough-items",
    title: "Just Enough Items (JEI)",
    description:
      "The definitive item and recipe browser for Minecraft. Hover over any item to see exactly how it's crafted. Search thousands of recipes instantly. An absolute must-have for modded and vanilla survival play.",
    category: "mods",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/238222/desc_89e6e7b5-dcd1-4eb9-9e7c-d51e2bcbdf89.png",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/jei",
  },
  {
    id: "journeymap",
    title: "JourneyMap",
    description:
      "A real-time, interactive minimap and world map mod. Maps your entire explored world as you travel, supports waypoints, displays mob positions, and includes a full-screen web browser mode. The best map mod for Minecraft.",
    category: "mods",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/32274/desc_4bf49d28-b85e-4803-bd71-90e41cf88bce.png",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/journeymap",
  },
  {
    id: "create-mod",
    title: "Create",
    description:
      "A revolutionary technology mod centered around mechanical contraptions. Build automated farms, trains, conveyor belts, printing presses, and breathtaking machines using rotating shafts, gears, and cogwheels. A creative masterpiece.",
    category: "mods",
    version: "1.21",
    thumbnail_url: "https://media.forgecdn.net/attachments/description/440954/desc_2e3c8cf5-6eed-4eed-83d4-44b90c06a60d.png",
    curseforge_url: "https://www.curseforge.com/minecraft/mc-mods/create",
  },
];

// Merge and deduplicate CurseForge fetched items with local base seed
const merged = [...BASE_SEED_DATA];
const baseIds = new Set(BASE_SEED_DATA.map(item => item.id));

if (Array.isArray(curseforgeSeed)) {
  for (const item of curseforgeSeed) {
    if (!baseIds.has(item.id)) {
      merged.push(item);
    }
  }
}

export const SEED_DATA = merged;
