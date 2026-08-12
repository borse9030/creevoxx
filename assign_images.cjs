const fs = require('fs');
const path = './lib/mcpePerformanceModsData.js';

let data = fs.readFileSync(path, 'utf-8');

const distinctImages = [
  "https://media.forgecdn.net/avatars/thumbnails/1465/938/256/256/638951660071232414.png",
  "https://media.forgecdn.net/avatars/thumbnails/1516/99/256/256/638984571285412329.png",
  "https://media.forgecdn.net/avatars/thumbnails/1698/759/256/256/639078761433023568_animated.gif",
  "https://media.forgecdn.net/avatars/thumbnails/1559/864/256/256/639012209904271753.png",
  "https://media.forgecdn.net/avatars/thumbnails/1748/87/256/256/639112449885816865.png",
  "https://media.forgecdn.net/avatars/thumbnails/1526/674/256/256/638991454297504929.jpg",
  "https://media.forgecdn.net/avatars/thumbnails/1599/995/256/256/639033854379882112.jpg",
  "https://media.forgecdn.net/avatars/thumbnails/1634/590/256/256/639046967385038376.png",
  "https://media.forgecdn.net/avatars/thumbnails/1696/617/256/256/639077205019049744.png",
  "https://media.forgecdn.net/avatars/thumbnails/1904/230/256/256/639189366040843789.png"
];

let index = 0;
data = data.replace(/https:\/\/media\.forgecdn\.net\/avatars\/thumbnails\/875\/481\/256\/256\/638298072734336144\.png/g, () => {
  const url = distinctImages[Math.floor(index / 2) % distinctImages.length];
  index++;
  return url;
});

fs.writeFileSync(path, data);
console.log("Updated images in", path);
