async function run() {
  const res = await fetch('https://creevoxx.dev/api/search?q=RenderDragonGrid', {
    headers: { 'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11', 'Host': 'creevoxx.dev' }
  });
  const data = await res.json();
  console.log(data);
}
run();
