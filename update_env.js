const fs = require('fs');
let env = fs.readFileSync('.env.local', 'utf8');
env = env.replace(/CURSEFORGE_API_KEY=.*$/, "CURSEFORGE_API_KEY='$2a$10$itnoc2Jmyqf0Fcdk5NyyqeF7fFSO.3BrD3w612TUl31C4.2J4GyIO'");
fs.writeFileSync('.env.local', env);
