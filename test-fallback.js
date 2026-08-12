import { SEED_DATA } from "./lib/syncDatabase.js";
import { fuzzySearchResources } from "./lib/fuzzySearch.js";

function buildSeedFallback(seedData, { query = "", category = "all", index = 0, pageSize = 24, sortOrder = "desc", edition = "all" }) {
  let list = [...seedData];
  if (category !== "all") list = list.filter((r) => r.category === category);
  
  if (edition === "bedrock" || edition === "pocket") {
    list = list.filter(
      (r) =>
        (r.curseforge_url && r.curseforge_url.includes("minecraft-bedrock")) ||
        r.category === "shaders" ||
        (r.title && (r.title.toLowerCase().includes("bedrock") || r.title.toLowerCase().includes("mcpe") || r.title.toLowerCase().includes("pe")))
    );
  }

  if (query.trim()) {
    list = fuzzySearchResources(list, query, "all");
  }
  console.log("After fuzzy search:", list.map(l => l.title));
}

buildSeedFallback(SEED_DATA, { edition: "bedrock", category: "mods", query: "performance" });
