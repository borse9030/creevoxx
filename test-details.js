import { fetchCurseforgeDetails } from "./lib/curseforge.js";
process.env.CURSEFORGE_API_KEY = '$2a$10$itnoc2Jmyqf0Fcdk5NyyqeF7fFSO.3BrD3w612TUl31C4.2J4GyIO';
async function test() {
  const ids = [1325119, 1586118, 1238974, 1023716, 1382066, 1246482, 813185, 1328997];
  for (const id of ids) {
    try {
      const res = await fetchCurseforgeDetails(id);
      console.log(`ID ${id} -> ${res.name} (logoUrl: ${res.logoUrl})`);
    } catch(e) {
      console.log(`ID ${id} -> ERROR: ${e.message}`);
    }
  }
}
test();
