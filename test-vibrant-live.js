async function run() {
  const res = await fetch('https://creevoxx.store/api/search?q=VibrantVisualsGrid', {
    headers: { 'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11', 'Host': 'creevoxx.store' }
  });
  const data = await res.json();
  console.log(data);
}
run();
