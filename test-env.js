import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
loadEnvConfig(__dirname);

console.log("API KEY:", process.env.CURSEFORGE_API_KEY);
