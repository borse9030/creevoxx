import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
loadEnvConfig(__dirname);

import { fetchCurseforgeDetails } from "./lib/curseforge.js";
async function run() {
  try {
    console.log("Fetching...", 1486748);
    const res = await fetchCurseforgeDetails(1486748);
    console.log("Result:", res ? "Found" : "Not Found");
    if(res) {
      console.log("Name:", res.name);
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
