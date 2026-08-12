import fs from "fs";

const files = [
  "lib/curseforge.js",
  "lib/curseforgeCached.js",
  "components/MobileAppView.js",
  "components/MobileAppShell.js"
];

console.log("=== Checking File Syntax & Existence ===");
for (const file of files) {
  try {
    const code = fs.readFileSync(file, "utf-8");
    console.log(`✅ ${file} (${code.length} bytes, ${code.split("\n").length} lines)`);
  } catch (err) {
    console.error(`❌ ${file} error:`, err.message);
  }
}
