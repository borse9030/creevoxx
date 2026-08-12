import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function search(query) {
  const url = new URL("https://api.curseforge.com/v1/mods/search");
  url.searchParams.set("gameId", "78022"); // Minecraft Bedrock
  // just search substring
  url.searchParams.set("searchFilter", query.split(' ')[0]);
  url.searchParams.set("sortField", "6");
  url.searchParams.set("sortOrder", "desc");
  url.searchParams.set("pageSize", "20");

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": process.env.CURSEFORGE_API_KEY, "Accept": "application/json" }
  });
  if(res.ok) {
    const data = await res.json();
    if(data.data) {
      // Find exact or fuzzy match
      for (const mod of data.data) {
        if (mod.name.toLowerCase().includes(query.split(' ')[0].toLowerCase())) {
          return mod;
        }
      }
    }
  }
  return null;
}

async function run() {
  const queries = [
    "FPS Optimizer",
    "Vanilla × Optimizer",
    "Boosted FPS",
    "XiaoBoost",
    "FPS Booster Pack",
    "FPS Booster | Lag Fix",
    "Performance+"
  ];
  
  const results = [];
  for(const q of queries) {
    const mod = await search(q);
    if(mod) {
      console.log(`Found: ${q} -> ID: ${mod.id} (${mod.name})`);
    } else {
      console.log(`Not found: ${q}`);
    }
  }
}

run();
