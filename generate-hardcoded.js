const ids = [
  { id: 1325119, title: "Lunac Shaders 3D 1.9.9 | RTX, Heightmaps, High - Q Lighting And Shadows", file: "lunac_shaders_3d" },
  { id: 1586118, title: "Lemo Visuals", file: "lemo_visuals" },
  { id: 1238974, title: "RG Shader | Renderdragon Shaders", file: "rg_shader" },
  { id: 1023716, title: "Luminous Dreams v1.0 [RELEASE]", file: "luminous_dreams" },
  { id: 1382066, title: "BSLB Shaders Bedrock - Classic V3", fallbackImg: "https://media.forgecdn.net/avatars/thumbnails/1516/99/256/256/638984571285412329.png" },
  { id: 1246482, title: "Newb X Dragon Shader | Compatible with Minecraft  v26.32", file: "newb_x_dragon" },
  { id: 813185, title: "Pastel Shaders", fallbackImg: "https://media.forgecdn.net/avatars/thumbnails/826/442/256/256/638212528946203815.png" },
  { id: 1328997, title: "R135 Shader RD | Realistic and Lightweight Shader | Minecraft BE 1.21+ (Render Dragon Support!!)", fallbackImg: "https://media.forgecdn.net/avatars/thumbnails/1483/102/256/256/638964724036688756.png" }
];
const out = ids.map(x => {
  return `        {
          id: "${x.id}",
          docId: "${x.id}",
          curseforge_id: ${x.id},
          title: "${x.title}",
          description: "A great shader for Minecraft Bedrock.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "${x.file ? 'https://creevoxx.dev/thumbnails/'+x.file+'.webp' : x.fallbackImg}",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders"]
        }`;
});
console.log(out.join(",\n"));
