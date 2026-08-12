const fs = require("fs");
const path = require("path");

const DIRECTORIES_TO_SCAN = ["app", "components"];

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, files);
    } else if (stat.isFile() && (fullPath.endsWith(".js") || fullPath.endsWith(".jsx") || fullPath.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

function processFiles() {
  let fileList = [];
  DIRECTORIES_TO_SCAN.forEach((dir) => {
    const fullDir = path.join(__dirname, "..", dir);
    if (fs.existsSync(fullDir)) {
      walkDir(fullDir, fileList);
    }
  });

  console.log(`🔍 Scanning ${fileList.length} component files for SEO issues...`);

  for (const file of fileList) {
    let content = fs.readFileSync(file, "utf8");
    let modified = false;

    // Issue A: Detect multiple <h1> tags (information warning)
    const h1Matches = content.match(/<h1/gi) || [];
    if (h1Matches.length > 1) {
      console.warn(`⚠️ [Multiple H1s] File: ${path.relative(process.cwd(), file)} has ${h1Matches.length} H1 tags!`);
    }

    // Issue B: Bulk clean internal rel="nofollow" (should only be on untrusted external links)
    const nofollowRegex = /rel=["']nofollow["']\s*href=["'](\/|\bhttps?:\/\/creevoxx\.vercel\.app)/gi;
    if (nofollowRegex.test(content)) {
      console.log(`🔧 [Nofollow Clean] Stripping nofollow from internal link in: ${path.relative(process.cwd(), file)}`);
      content = content.replace(/(href=["'](?:\/|\bhttps?:\/\/creevoxx\.vercel\.app)[^"'>]+["'])\s+rel=["']nofollow["']/gi, "$1");
      content = content.replace(/rel=["']nofollow["']\s+(href=["'](?:\/|\bhttps?:\/\/creevoxx\.vercel\.app)[^"'>]+["'])/gi, "$1");
      modified = true;
    }

    // Issue C: Bulk-update <img> tags missing alt attributes
    const imgMissingAlt = /<img(?![^>]*\balt=)[^>]*>/gi;
    if (imgMissingAlt.test(content)) {
      console.log(`🔧 [Img Alt Clean] Inserting alt tag placeholder in: ${path.relative(process.cwd(), file)}`);
      content = content.replace(/<img([^>]*)\/?>/gi, (match, p1) => {
        if (!p1.includes("alt=")) {
          return `<img${p1} alt="Minecraft resource graphic" />`;
        }
        return match;
      });
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content, "utf8");
    }
  }
  console.log("✅ Scan and cleanup complete.");
}

processFiles();
