import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
loadEnvConfig(__dirname);

import { adminGetResourceById } from './lib/firestoreAdmin.js';
async function run() {
  try {
    console.log("Fetching from firestore...", 1486748);
    const res = await adminGetResourceById("1486748");
    console.log("Result:", res ? "Found" : "Not Found");
    if(res) {
      console.log("Name:", res.title || res.name);
      console.log("Data:", res);
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
