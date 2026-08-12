import { fetchCurseforgeSearch } from "./lib/curseforge.js";
process.env.CURSEFORGE_API_KEY = '$2a$10$itnoc2Jmyqf0Fcdk5NyyqeF7fFSO.3BrD3w612TUl31C4.2J4GyIO';
async function test() {
  const exactGridPicks = [
    "Lunac Shaders 3D",
    "Lemo Visuals",
    "RG Shader",
    "Luminous Dreams v1.0",
    "BSLB Shaders Bedrock",
    "Newb X Dragon Shader",
    "Pastel Shaders",
    "R135 Shader RD",
  ];
  for (const q of exactGridPicks) {
    try {
      const res = await fetchCurseforgeSearch({ query: q, category: "shaders", edition: "bedrock", pageSize: 1 });
      if (res && res.data && res.data.length > 0) {
        console.log(`✅ Found: ${res.data[0].title} (for query: "${q}")`);
      } else {
        console.log(`❌ Not Found: "${q}"`);
      }
    } catch(e) {
      console.log(`❌ Error for "${q}": ${e.message}`);
    }
  }
}
test();
