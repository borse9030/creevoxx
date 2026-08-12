import fs from 'fs';
let code = fs.readFileSync('lib/curseforge.js', 'utf8');

const globalOverride = `
const GLOBAL_CUSTOM_THUMBNAILS = {
  // Newb Shaders
  "NEWB X DAWN": "newb_x_dawn",
  "NEWB X STARS": "newb_x_stars",
  "NEWB X UNWIND": "newb_x_unwind",
  "NEWB X FLAMINGO": "newb_x_flamingo",
  "NEWB X SAPPHIRE": "newb_x_sapphire",
  "NEWB X LEGACY": "newb_x_legacy",
  "NEWB X DRAGON": "newb_x_dragon",
  "NEWB X ALE": "newb_x_ale",
  "NEWB X APOCALIPSIS": "newb_x_apocalipsis",
  // Render Dragon Shaders
  "LUNAC SHADERS 3D": "lunac_shaders_3d",
  "LEMO VISUALS": "lemo_visuals",
  "RG SHADER": "rg_shader",
  "LUMINOUS DREAMS": "luminous_dreams",
  "BSLB SHADERS": "bslb_shaders",
  "PASTEL SHADERS": "pastel_shaders",
  "R135 SHADER": "r135_shader",
  // Vibrant Visuals Shaders
  "SILDUR'S VIBRANT": "sildurs_vibrant_shaders",
  "PRIZMA VISUALS LEGACY": "prizma_visuals_legacy",
  "REVOLUTION VIBRANT": "revolution_vibrant_visuals",
  "DEFINITIVE VIBRANT": "definitive_vibrant_visuals",
  "BETTER VIBRANT": "better_vibrant_visuals",
  "ODYSSEY VISUALS": "odyssey_visuals",
  "SOLACE V": "solace_v",
  "DREAMY VISUALS": "dreamy_visuals"
};

function getCustomThumbnail(title) {
  if (!title) return null;
  const upperTitle = title.toUpperCase();
  for (const [key, file] of Object.entries(GLOBAL_CUSTOM_THUMBNAILS)) {
    if (upperTitle.includes(key)) {
      return \`https://creevoxx.dev/thumbnails/\${file}.webp\`;
    }
  }
  return null;
}
`;

code = code.replace('import { fuzzySearchResources } from "./fuzzySearch.js";', 'import { fuzzySearchResources } from "./fuzzySearch.js";\n' + globalOverride);

const block1Regex = /\/\/ Global Custom Thumbnail Override[\s\S]*?thumbnail_url = customThumbnailMap\[matchedKey\];\n      \}/;
code = code.replace(block1Regex, `      const overrideUrl = getCustomThumbnail(title);
      if (overrideUrl) thumbnail_url = overrideUrl;`);

const block2Regex = /const customThumbnailMap = \[\s*\{ key: "NEWB X DAWN"[\s\S]*?return item;/;
code = code.replace(block2Regex, `      const overrideUrl = getCustomThumbnail(item.title);
      if (overrideUrl) {
        return { ...item, thumbnail_url: overrideUrl };
      }
      return item;`);

const block3Regex = /const customThumbnailMap = \[\s*\{ key: "NEWB X DAWN"[\s\S]*?return url;/;
code = code.replace(block3Regex, `const overrideUrl = getCustomThumbnail(modDetails.name);
        if (overrideUrl) url = overrideUrl;
        return url;`);

const block4Regex = /const customThumbnailMap = \[\s*\{ key: "NEWB X DAWN"[\s\S]*?return url;/;
code = code.replace(block4Regex, `const overrideUrl = getCustomThumbnail(found.title);
            if (overrideUrl) url = overrideUrl;
            return url;`);

fs.writeFileSync('lib/curseforge.js', code);
console.log('Fixed curseforge.js');
