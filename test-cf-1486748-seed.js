import { SEED_DATA } from './lib/syncDatabase.js';
const found = SEED_DATA.find(r => r.id == 1486748 || r.curseforge_id == 1486748);
console.log("In SEED_DATA:", found ? "Found" : "Not Found");
if(found) console.log(found.title);
