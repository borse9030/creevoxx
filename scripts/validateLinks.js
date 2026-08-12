const fs = require("fs");
const path = require("path");

const SEED_DATA_PATH = path.join(__dirname, "..", "lib", "curseforge_seed.json");

async function checkLink(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.status;
  } catch (err) {
    return 404;
  }
}

async function validateSeedLinks() {
  if (!fs.existsSync(SEED_DATA_PATH)) {
    console.error(`Seed data file not found at: ${SEED_DATA_PATH}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(SEED_DATA_PATH, "utf8"));
  console.log(`🔗 Scanning links for ${items.length} seeded catalog items...`);

  for (const item of items) {
    if (item.curseforge_url) {
      const status = await checkLink(item.curseforge_url);
      if (status >= 400) {
        console.warn(`❌ [Broken CurseForge Link] ${item.title} (ID: ${item.id}) -> Status ${status} on: ${item.curseforge_url}`);
      }
    }
      if (status >= 400) {
      }
    }
  }
  console.log("🏁 Link validation audit completed.");
}

validateSeedLinks();
