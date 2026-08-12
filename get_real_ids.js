import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function search(query) {
  const url = new URL("https://api.curseforge.com/v1/mods/search");
  url.searchParams.set("gameId", "76258"); // wait, Minecraft is 432, Bedrock is 78022 or something?
  // let's just search Minecraft gameId 432
  url.searchParams.set("gameId", "432"); 
  url.searchParams.set("searchFilter", query);
  url.searchParams.set("sortField", "6");
  url.searchParams.set("sortOrder", "desc");
  url.searchParams.set("pageSize", "5");

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": process.env.CURSEFORGE_API_KEY, "Accept": "application/json" }
  });
  if(res.ok) {
    const data = await res.json();
    if(data.data && data.data.length > 0) {
      return data.data[0];
    }
  }
  return null;
}

async function run() {
  const queries = [
    "FPS Optimizer | FPS Boost Official",
    "Vanilla × Optimizer FPS Boost",
    "Boosted FPS (Optimized Performance)",
    "XiaoBoost Ultimate",
    "FPS Booster Pack | No Lag + Performance",
    "FPS Booster | Lag Fix",
    "FPS Booster (No Lag & FPS Boost)",
    "Performance+",
    "ULTIMATE FPS BOOSTER"
  ];
  
  const results = [];
  for(const q of queries) {
    const mod = await search(q);
    if(mod) {
      console.log(`Found: ${q} -> ID: ${mod.id} (${mod.name})`);
      results.push({
        id: mod.id,
        title: mod.name,
        author: mod.authors[0]?.name || "Unknown",
        download_count: mod.downloadCount,
        description: mod.summary,
        category: "mods", // assuming
        version: "1.21",
        thumbnail_url: mod.logo?.thumbnailUrl || null
      });
    } else {
      console.log(`Not found: ${q}`);
    }
  }
  fs.writeFileSync('hardcoded_mods.json', JSON.stringify(results, null, 2));
}

run();
