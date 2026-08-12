import { SEED_DATA } from './lib/syncDatabase.js';
const r135 = SEED_DATA.find(r => r.curseforge_id === 1328997 || (r.title && r.title.includes('R135')));
console.log(r135 ? r135.thumbnail_url : 'Not found');
