import { SEED_DATA } from './lib/syncDatabase.js';
const vibrant = SEED_DATA.filter(r => (r.title || '').toLowerCase().includes('vibrant') || (r.tags && r.tags.some(t => t.toLowerCase().includes('vibrant'))));
console.log(vibrant.map(r => r.title));
