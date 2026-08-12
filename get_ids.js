async function searchID(query) {
  const url = `https://www.curseforge.com/api/v1/mods/search?gameId=78022&searchFilter=${encodeURIComponent(query)}&index=0&pageSize=10`;
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const json = await response.json();
    if (json.data && json.data.length > 0) {
      console.log(`Found ${query}: ${json.data[0].id} - ${json.data[0].name}`);
    } else {
      console.log(`Not found: ${query}`);
    }
  } catch (e) {
    console.log(`Error on ${query}`);
  }
}

async function run() {
  await searchID("Boosted FPS");
  await searchID("XiaoBoost Ultimate");
  await searchID("FPS Booster Pack");
  await searchID("FPS Booster | Lag Fix");
  await searchID("FPS Booster (No Lag & FPS Boost)");
  await searchID("FPS Booster (No Lag And FPS Boost)");
  await searchID("Performance+");
  await searchID("ULTIMATE FPS BOOSTER");
}

run();
