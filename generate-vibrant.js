const ids = [
  { id: "544096", title: "Sildur's Vibrant shaders", url: "https://media.forgecdn.net/avatars/thumbnails/452/333/256/256/637716089787270743.png" },
  { id: "1076812", title: "Prizma Visuals Legacy (Vibrant Visuals Pack Deferred)", url: "https://media.forgecdn.net/avatars/thumbnails/1424/976/256/256/638923063575862510.png" },
  { id: "1269725", title: "Revolution Vibrant Visuals | Static Light", url: "https://media.forgecdn.net/avatars/thumbnails/1559/438/256/256/639011910866999131.png" },
  { id: "1366035", title: "Definitive Vibrant Visuals | Static Light Update", url: "https://media.forgecdn.net/avatars/thumbnails/1479/646/256/256/638961657427812490.jpg" },
  { id: "1289779", title: "Better Vibrant Visuals | Static Light", url: "https://media.forgecdn.net/avatars/thumbnails/1552/842/256/256/639007694165439271.png" },
  { id: "1170942", title: "Odyssey Visuals (Vibrant Visuals/Deferred)", url: "https://media.forgecdn.net/avatars/thumbnails/1869/383/256/256/639172345655830823.png" },
  { id: "1260110", title: "Solace V (Vibrant Visuals)", url: "https://media.forgecdn.net/avatars/thumbnails/1749/954/256/256/639113702281696724.png" },
  { id: "1330177", title: "Dreamy Visuals |  Renewed Vibrant Visuals", url: "https://media.forgecdn.net/avatars/thumbnails/1905/465/256/256/639189937240394089.png" }
];
const out = ids.map(x => {
  return `        {
          id: "${x.id}",
          docId: "${x.id}",
          curseforge_id: ${x.id},
          title: "${x.title}",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "${x.url}",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        }`;
});
console.log(out.join(",\n"));
