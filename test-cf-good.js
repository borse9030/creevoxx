import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
loadEnvConfig(__dirname);

import { fetchCurseforgeDetails, fetchCurseforgeSearch } from "./lib/curseforge.js";
async function run() {
  try {
    console.log("Using API Key:", process.env.CURSEFORGE_API_KEY);
    console.log("Fetching search 'bsl'...");
    const res = await fetchCurseforgeSearch({ query: 'bsl', category: 'shaders', pageSize: 1 });
    console.log("Search Result Count:", res?.data?.length);
    if(res?.data?.length > 0) {
      console.log("Found:", res.data[0].title, "(ID:", res.data[0].curseforge_id, ")");
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
