import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);
console.log("Next.js loaded env:", process.env.CURSEFORGE_API_KEY);
