import fs from 'fs';
let code = fs.readFileSync('app/api/search/route.js', 'utf8');

code = code.replace(
  '"https://media.forgecdn.net/avatars/thumbnails/452/333/256/256/637716089787270743.png"',
  '"https://creevoxx.store/thumbnails/sildurs_vibrant_shaders.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1424/976/256/256/638923063575862510.png"',
  '"https://creevoxx.store/thumbnails/prizma_visuals_legacy.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1559/438/256/256/639011910866999131.png"',
  '"https://creevoxx.store/thumbnails/revolution_vibrant_visuals.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1479/646/256/256/638961657427812490.jpg"',
  '"https://creevoxx.store/thumbnails/definitive_vibrant_visuals.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1552/842/256/256/639007694165439271.png"',
  '"https://creevoxx.store/thumbnails/better_vibrant_visuals.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1869/383/256/256/639172345655830823.png"',
  '"https://creevoxx.store/thumbnails/odyssey_visuals.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1749/954/256/256/639113702281696724.png"',
  '"https://creevoxx.store/thumbnails/solace_v.webp"'
).replace(
  '"https://media.forgecdn.net/avatars/thumbnails/1905/465/256/256/639189937240394089.png"',
  '"https://creevoxx.store/thumbnails/dreamy_visuals.webp"'
);

fs.writeFileSync('app/api/search/route.js', code);
console.log('Patched route.js');
