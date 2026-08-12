import { fetchCurseforgeSearchCached } from "./lib/curseforgeCached.js";

async function test() {
  const data = await fetchCurseforgeSearchCached({
    query: "performance",
    category: "mods",
    index: 0,
    pageSize: 10,
    sortField: "6",
    sortOrder: "desc",
    edition: "bedrock",
  });
  console.log(data.data.map(d => d.name));
}

test();
