import { SEED_DATA } from "./lib/syncDatabase.js";
const bedrockMods = SEED_DATA.filter(r => 
  (r.curseforge_url && r.curseforge_url.includes("minecraft-bedrock")) ||
  (r.title && (r.title.toLowerCase().includes("bedrock") || r.title.toLowerCase().includes("mcpe") || r.title.toLowerCase().includes("pe ")))
);
console.log("Total Bedrock items:", bedrockMods.length);
console.log("Bedrock Mods:", bedrockMods.filter(r => r.category === "mods").map(r => r.title));
