async function run() {
  const exactGridPicks = [
    "Lunac Shaders 3D",
    "Lemo Visuals",
    "RG Shader",
    "Luminous Dreams v1.0",
    "BSLB Shaders Bedrock",
    "Newb X Dragon Shader",
    "Pastel Shaders",
    "R135 Shader RD",
  ];
  for (const q of exactGridPicks) {
    const res = await fetch(`https://creevoxx.store/api/search?q=${encodeURIComponent(q)}&category=shaders&edition=bedrock`, {
      headers: { 'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11', 'Host': 'creevoxx.store' }
    });
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      console.log(`Query: ${q} -> ${data.data[0].title}`);
    } else {
      console.log(`Query: ${q} -> NOT FOUND`);
    }
  }
}
run();
