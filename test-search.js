import { fetchCurseforgeSearch } from "./lib/curseforge.js";
process.env.CURSEFORGE_API_KEY = '$2a$10$itnoc2Jmyqf0Fcdk5NyyqeF7fFSO.3BrD3w612TUl31C4.2J4GyIO';
async function test() {
  const result = await fetchCurseforgeSearch({
    query: "Newb X Dawn Shader",
    category: "shaders",
    index: 0,
    pageSize: 50,
    sortField: "2",
    sortOrder: "desc",
    edition: "bedrock",
  });
  console.log(result.data.filter(r => (r.title||'').toLowerCase().includes("newb x dawn")).map(r => `${r.title} => ${r.thumbnail_url}`).join("\n"));
}
test();
