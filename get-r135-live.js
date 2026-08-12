async function run() {
  const res = await fetch('https://creevoxx.store/api/search?q=R135&category=shaders&edition=bedrock', {
    headers: {
      'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11',
      'Host': 'creevoxx.store'
    }
  });
  const data = await res.json();
  const r135 = data.data.find(r => r.curseforge_id === 1328997);
  console.log(r135 ? r135.thumbnail_url : 'Not found');
}
run();
