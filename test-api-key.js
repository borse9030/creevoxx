import { fetchCurseforgeSearch } from "./lib/curseforge.js";

process.env.CURSEFORGE_API_KEY = '$2a$10$itnoc2Jmyqf0Fcdk5NyyqeF7fFSO.3BrD3w612TUl31C4.2J4GyIO';

async function test(query) {
  const result = await fetchCurseforgeSearch({
    query,
    category: "mods",
    index: 0,
    pageSize: 15,
    sortField: "6",
    sortOrder: "desc",
    edition: "bedrock",
  });
  console.log(`\n=== Query: "${query}" (${result.pagination?.totalCount} total) ===`);
  result.data.forEach((d, i) => console.log(i+1, d.title, '|', d.download_count));
}

await test("fps boost");
await test("lag fix");
await test("fps");
