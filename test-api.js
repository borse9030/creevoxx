async function run() {
  try {
    const res = await fetch('https://creevoxx.store/api/search?q=Vibrant%20Visual', {
      headers: { 'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11', 'Host': 'creevoxx.store' }
    });
    const text = await res.text();
    console.log(res.status);
    console.log(text.substring(0, 100));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
run();
