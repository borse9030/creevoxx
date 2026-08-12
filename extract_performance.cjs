const fs = require('fs');
const seedData = JSON.parse(fs.readFileSync('./lib/curseforge_seed.json', 'utf8'));

let results = [];

for (const item of seedData) {
    if (!item.title && !item.summary) continue;
    
    const titleLower = (item.title || "").toLowerCase();
    const summaryLower = (item.summary || "").toLowerCase();
    
    // We want MCPE / Bedrock items (usually have bedrock in curseforge_url or are texture packs/shaders with these keywords)
    const isPerformance = titleLower.includes("fps") || 
                          titleLower.includes("optimizer") || 
                          titleLower.includes("performance") ||
                          titleLower.includes("boost") ||
                          titleLower.includes("lag") ||
                          summaryLower.includes("fps") || 
                          summaryLower.includes("optimizer") || 
                          summaryLower.includes("performance");
                          
    // To ensure it's bedrock/pe, we can check if url has "bedrock" or it has no java-specific modLoaders
    const isBedrock = item.curseforge_url && item.curseforge_url.includes("minecraft-bedrock");
    
    if (isPerformance && isBedrock) {
        results.push(item);
    }
}

// Sort by download count descending
results.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));

// Take top 10
const top10 = results.slice(0, 10);

// If we don't have enough bedrock ones, fallback to java ones to make up 10
if (top10.length < 10) {
    const javaResults = seedData.filter(item => {
        const titleLower = (item.title || "").toLowerCase();
        const summaryLower = (item.summary || "").toLowerCase();
        return titleLower.includes("fps") || summaryLower.includes("fps") || titleLower.includes("optimizer");
    }).sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    
    for (let i=0; i<javaResults.length && top10.length < 10; i++) {
        if (!top10.find(t => t.id === javaResults[i].id)) {
            top10.push(javaResults[i]);
        }
    }
}

// Generate the new JS file content
const jsContent = `export const MCPE_PERFORMANCE_MODS = ${JSON.stringify(top10, null, 2)};\n`;
fs.writeFileSync('./lib/mcpePerformanceModsData.js', jsContent);
console.log("Extracted top 10 real performance mods to lib/mcpePerformanceModsData.js");
