import fs from 'fs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

fs.writeFileSync('.env.test', "KEY='\\$2a\\$10\\$euENyl3Cj/FiqckHV3/LwuRRLWoahGartJvJD.WXX.U2EtQkGhKby'");
const env = dotenv.config({ path: '.env.test' });
dotenvExpand.expand(env);
console.log("Parsed:", env.parsed.KEY);
console.log("Process Env:", process.env.KEY);
