const fs = require('fs');

const path = './lib/mcpePerformanceModsData.js';
let content = fs.readFileSync(path, 'utf8');

const images = [
  "https://media.forgecdn.net/avatars/thumbnails/1130/670/256/256/638689862356749182.png",
  "https://media.forgecdn.net/avatars/thumbnails/1044/516/256/256/638572074817465930.webp",
  "https://media.forgecdn.net/avatars/thumbnails/452/333/256/256/637716089787270743.png",
  "https://media.forgecdn.net/avatars/thumbnails/1449/904/256/256/638940605689918485.jpg",
  "https://media.forgecdn.net/avatars/thumbnails/848/186/256/256/638248048963999686.png",
  "https://media.forgecdn.net/avatars/thumbnails/793/487/256/256/638151403748357181.png",
  "https://media.forgecdn.net/avatars/thumbnails/826/442/256/256/638212528946203815.png",
  "https://media.forgecdn.net/avatars/thumbnails/1416/843/256/256/638917946304035230.png",
  "https://media.forgecdn.net/avatars/thumbnails/1032/30/256/256/638554985436840429.png",
  "https://media.forgecdn.net/avatars/thumbnails/875/480/256/256/638298072228596362.png"
];

let i = 0;
content = content.replace(/https:\/\/media\.forgecdn\.net\/avatars\/thumbnails\/875\/481\/256\/256\/638298072734336144\.png/g, () => {
    const replacement = images[Math.floor(i / 2)];
    i++;
    return replacement;
});

fs.writeFileSync(path, content, 'utf8');
