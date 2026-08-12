import { SEED_DATA } from './lib/syncDatabase.js';
const titles = [
  "Sildur's Vibrant shaders",
  "Prizma Visuals Legacy",
  "Revolution Vibrant Visuals",
  "Definitive Vibrant Visuals",
  "Better Vibrant Visuals",
  "Odyssey Visuals",
  "Solace V",
  "Dreamy Visuals"
];
for (const t of titles) {
  const item = SEED_DATA.find(r => (r.title||'').includes(t));
  if (item) {
    console.log(`{ id: "${item.curseforge_id}", title: "${item.title.replace(/"/g, '\\"')}", url: "${item.thumbnail_url}" }`);
  } else {
    console.log(`NOT FOUND: ${t}`);
  }
}
