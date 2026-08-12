async function run() {
  const r1 = await fetch('https://creevoxx.dev/api/search?q=VibrantVisualsGrid', { headers: { 'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11', 'Host': 'creevoxx.dev' } });
  const data1 = await r1.json();
  console.log('Keys:', Object.keys(data1));
  console.log('Pagination:', data1.pagination);
}
run();
