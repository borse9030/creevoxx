import { SEED_DATA } from "./syncDatabase.js";
import { fuzzySearchResources } from "./fuzzySearch.js";

const GLOBAL_CUSTOM_THUMBNAILS = {
  // Newb Shaders
  "NEWB X DAWN": "newb_x_dawn",
  "NEWB X STARS": "newb_x_stars",
  "NEWB X UNWIND": "newb_x_unwind",
  "NEWB X FLAMINGO": "newb_x_flamingo",
  "NEWB X SAPPHIRE": "newb_x_sapphire",
  "NEWB X LEGACY": "newb_x_legacy",
  "NEWB X DRAGON": "newb_x_dragon",
  "NEWB X ALE": "newb_x_ale",
  "NEWB X APOCALIPSIS": "newb_x_apocalipsis",
  // Render Dragon Shaders
  "LUNAC SHADERS 3D": "lunac_shaders_3d",
  "LEMO VISUALS": "lemo_visuals",
  "RG SHADER": "rg_shader",
  "LUMINOUS DREAMS": "luminous_dreams",
  "BSLB SHADERS": "bslb_shaders",
  "PASTEL SHADERS": "pastel_shaders",
  "R135 SHADER": "r135_shader",
  // Vibrant Visuals Shaders
  "SILDUR'S VIBRANT": "sildurs_vibrant_shaders",
  "PRIZMA VISUALS LEGACY": "prizma_visuals_legacy",
  "REVOLUTION VIBRANT": "revolution_vibrant_visuals",
  "DEFINITIVE VIBRANT": "definitive_vibrant_visuals",
  "BETTER VIBRANT": "better_vibrant_visuals",
  "ODYSSEY VISUALS": "odyssey_visuals",
  "SOLACE V": "solace_v",
  "DREAMY VISUALS": "dreamy_visuals"
};

function getCustomThumbnail(title) {
  if (!title) return null;
  const upperTitle = title.toUpperCase();
  for (const [key, file] of Object.entries(GLOBAL_CUSTOM_THUMBNAILS)) {
    if (upperTitle.includes(key)) {
      return `https://creevoxx.store/thumbnails/${file}.webp`;
    }
  }
  return null;
}


function mapClassIdToCategory(classId, categories = []) {
  if (classId === 6 || classId === 4984) return "mods";
  if (classId === 12) return "textures";
  if (classId === 6552) return "shaders";
  if (classId === 6929) {
    if (categories && categories.some((c) => c.id === 6939)) {
      return "shaders";
    }
    return "textures";
  }
  return "mods";
}

function extractVersion(item) {
  if (item.latestFiles && Array.isArray(item.latestFiles)) {
    for (const file of item.latestFiles) {
      if (file.gameVersions && Array.isArray(file.gameVersions)) {
        const found = file.gameVersions.find((v) => v.match(/^1\.\d+(\.\d+)?$/));
        if (found) return found;
      }
    }
  }
  return "1.21";
}

export async function fetchCurseforgeSearch({
  query = "",
  category = "all",
  categoryId: explicitCategoryId = undefined,
  device = "all",
  index = 0,
  pageSize = 24,
  sortField = "6", // default TotalDownloads
  sortOrder = "desc",
  edition = "java",
  version = "",
}) {
  try {
    let apiKey = process.env.CURSEFORGE_API_KEY;
    if (apiKey) {
      apiKey = apiKey.replace(/\\/g, "");
    }
    if (!apiKey) {
      throw new Error("CurseForge API Key not configured");
    }

    let gameId = "432"; // default Java
    if (edition === "bedrock" || edition === "pocket") {
      gameId = "78022";
    }

    let classId = undefined;
    let categoryId = explicitCategoryId;

    // Top-level class IDs for Minecraft Bedrock (gameId 78022)
    const BEDROCK_TOP_LEVEL_CLASSES = new Set([4984, 6929, 6913, 6925]);

    if (explicitCategoryId) {
      if (BEDROCK_TOP_LEVEL_CLASSES.has(explicitCategoryId)) {
        classId = explicitCategoryId;
        categoryId = undefined;
      } else {
        categoryId = explicitCategoryId;
      }
    }

    if (!categoryId && classId === undefined) {
      if (gameId === "78022") {
        if (category === "mods" || category === "addons") classId = 4984; // Addons
        else if (category === "textures") classId = 6929; // Texture Packs
        else if (category === "shaders") categoryId = 6939; // Shaders subcategory
        else if (category === "maps") classId = 6913; // Bedrock Maps
        else if (category === "skins") classId = 6925; // Bedrock Skins
      } else {
        if (category === "mods") classId = 6;
        else if (category === "textures") classId = 12;
        else if (category === "shaders") classId = 6552;
      }
    }

    const url = new URL("https://api.curseforge.com/v1/mods/search");
    url.searchParams.set("gameId", gameId);
    
    let finalQuery = query;
    if (device === "low-end") {
      finalQuery = query ? `${query} lite` : "lite";
    } else if (device === "high-end") {
      finalQuery = query ? `${query} ultra` : "ultra";
    }

    if (finalQuery.trim()) {
      url.searchParams.set("searchFilter", finalQuery);
    }
    
    if (classId !== undefined) {
      url.searchParams.set("classId", classId.toString());
    }
    if (categoryId !== undefined) {
      url.searchParams.set("categoryId", categoryId.toString());
    }
    if (version) {
      url.searchParams.set("gameVersion", version);
    }
    
    url.searchParams.set("index", index.toString());
    url.searchParams.set("pageSize", pageSize.toString());
    url.searchParams.set("sortField", sortField);
    url.searchParams.set("sortOrder", sortOrder);

    url.searchParams.set("_v", "2"); // BUST NEXT.JS CACHE

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
      },
      next: { revalidate: 3600 }, // Cache response for 1 hour
    });

    if (!response.ok) {
      throw new Error(`CurseForge Search failed with status: ${response.status}`);
    }

    const resData = await response.json();
    // FIX 6: Filter out mods where distribution is explicitly disabled.
    // allowModDistribution === false means the author has blocked third-party downloads.
    // We exclude them so the download button never breaks on the Flutter side.
    const items = (resData.data || []).filter(
      (item) => item.allowModDistribution !== false
    );

    // FIX 4: Category counts are now cached at the curseforgeCached layer.
    // We return the pagination total here; the cached layer handles count fetching
    // separately (once per hour) to avoid 4 extra API calls per search request.
    const counts = {
      total: resData.pagination?.totalCount || items.length,
      mods: 0,
      textures: 0,
      shaders: 0,
    };

    const mapped = items.map((item) => {
      const docId = item.id.toString();
      const title = item.name;
      const description = item.summary || "No description provided.";
      
      let mappedCat = "mods";
      if (gameId === "78022") {
        const isShader = item.categories && item.categories.some((c) => c.id === 6939);
        if (isShader) {
          mappedCat = "shaders";
        } else if (item.classId === 6929) {
          mappedCat = "textures";
        } else if (item.classId === 4984) {
          mappedCat = "mods";
        } else if (item.classId === 6913) {
          mappedCat = "maps";
        } else if (item.classId === 6925) {
          mappedCat = "skins";
        }
      } else {
        mappedCat = mapClassIdToCategory(item.classId, item.categories);
      }
      const itemVersion = extractVersion(item);
      let thumbnail_url = item.logo ? item.logo.thumbnailUrl || item.logo.url : "";

            const overrideUrl = getCustomThumbnail(title);
      if (overrideUrl) thumbnail_url = overrideUrl;

      return {
        id: docId,
        docId: docId,
        curseforge_id: item.id,
        title,
        description,
        category: mappedCat,
        version: itemVersion,
        thumbnail_url,
        author: item.authors && item.authors[0] ? item.authors[0].name : "creator",
        download_count: item.downloadCount || 0,
        dateModified: item.dateModified,
        tags: item.categories ? item.categories.map((c) => c.name) : [],
      };
    });



    if (query.trim()) {
      const qLower = query.toLowerCase();
      mapped.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        let aScore = 0;
        if (aTitle === qLower) aScore = 4;
        else if (aTitle.startsWith(qLower)) aScore = 3;
        else if (aTitle.includes(qLower)) aScore = 2;
        else if (aTitle.split(" ").some(w => w.startsWith(qLower))) aScore = 1;

        let bScore = 0;
        if (bTitle === qLower) bScore = 4;
        else if (bTitle.startsWith(qLower)) bScore = 3;
        else if (bTitle.includes(qLower)) bScore = 2;
        else if (bTitle.split(" ").some(w => w.startsWith(qLower))) bScore = 1;
        
        return bScore - aScore;
      });
    }

    return {
      data: mapped,
      pagination: resData.pagination || {
        index: index,
        pageSize: pageSize,
        resultCount: mapped.length,
        totalCount: mapped.length,
      },
      counts,
    };
  } catch (error) {
    console.warn("[CurseForge Server Search] API search failed, falling back to local seed data:", error.message);
    
    // Fallback: Perform local search on SEED_DATA
    let list = [...SEED_DATA];

    // Filter by Category
    if (category !== "all") {
      list = list.filter((r) => r.category === category);
    }

    // Filter by Edition
    if (edition === "bedrock" || edition === "pocket") {
      list = list.filter(
        (r) =>
          (r.curseforge_url && r.curseforge_url.includes("minecraft-bedrock")) ||
          r.category === "shaders" ||
          (r.title && (r.title.toLowerCase().includes("bedrock") || r.title.toLowerCase().includes("mcpe") || r.title.toLowerCase().includes("pe")))
      );
    } else if (edition === "java") {
      list = list.filter((r) => !r.curseforge_url || !r.curseforge_url.includes("minecraft-bedrock"));
    }

    // Filter by Version
    if (version) {
      const targetVersions = version.split(",");
      list = list.filter((r) => targetVersions.some((tv) => r.version?.includes(tv)));
    }

    // Filter by Query
    if (query.trim()) {
      list = fuzzySearchResources(list, query, "all");
    }

    // Sorting
    if (sortField === "4") {
      // Alphabetical
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortField === "3") {
      // Date modified/updated (fallback to total downloads for seed data)
      list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    } else {
      // Downloads (6)
      list.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    }

    if (sortOrder === "asc") {
      list.reverse();
    }

    // Paginate
    const totalCount = list.length;
    const startIdx = index;
    const paginatedList = list.slice(startIdx, startIdx + pageSize).map(item => {
            const overrideUrl = getCustomThumbnail(item.title);
      if (overrideUrl) {
        return { ...item, thumbnail_url: overrideUrl };
      }
      return item;
    });

    // Calculate Category Counts for local data
    const counts = {
      total: SEED_DATA.length,
      mods: SEED_DATA.filter((r) => r.category === "mods").length,
      textures: SEED_DATA.filter((r) => r.category === "textures").length,
      shaders: SEED_DATA.filter((r) => r.category === "shaders").length,
    };

    return {
      data: paginatedList.map((item) => ({
        ...item,
        docId: item.id,
      })),
      pagination: {
        index: index,
        pageSize: pageSize,
        resultCount: paginatedList.length,
        totalCount: totalCount,
      },
      counts,
    };
  }
}

export async function fetchCurseforgeDetails(id) {
  let apiKey = process.env.CURSEFORGE_API_KEY;
  if (apiKey) {
    apiKey = apiKey.replace(/\\/g, "");
  }
  if (!apiKey) {
    throw new Error("CurseForge API Key not configured on server");
  }

  try {
    let curseforgeId = null;

    // Check if the id is numeric directly
    if (/^\d+$/.test(id)) {
      curseforgeId = parseInt(id, 10);
    } else {
      // Import dynamic to avoid circular import issues
      const { getResourceById } = await import("./firestore");
      const resource = await getResourceById(id);
      if (resource && resource.curseforge_id) {
        curseforgeId = resource.curseforge_id;
      } else {
        let matchedItem = null;

        // Try searching in Java Edition first
        const searchUrlJava = `https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${encodeURIComponent(id)}&_v=2`;
        const searchResponseJava = await fetch(searchUrlJava, {
          headers: {
            "Accept": "application/json",
            "x-api-key": apiKey,
            "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
          },
        });

        if (searchResponseJava.ok) {
          const searchData = await searchResponseJava.json();
          const items = searchData.data || [];
          matchedItem = items.find(
            (item) => item.slug === id || item.id.toString() === id
          );
        }

        // If not found, try Bedrock
        if (!matchedItem) {
          const searchUrlBedrock = `https://api.curseforge.com/v1/mods/search?gameId=78022&searchFilter=${encodeURIComponent(id)}&_v=2`;
          const searchResponseBedrock = await fetch(searchUrlBedrock, {
            headers: {
              "Accept": "application/json",
              "x-api-key": apiKey,
              "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
            },
          });
          if (searchResponseBedrock.ok) {
            const searchData = await searchResponseBedrock.json();
            const items = searchData.data || [];
            matchedItem = items.find(
              (item) => item.slug === id || item.id.toString() === id
            );
          }
        }

        if (matchedItem) {
          curseforgeId = matchedItem.id;
        }
      }
    }

    if (!curseforgeId) {
      throw new Error("Resource details not found on CurseForge");
    }

    // Fetch mod details
    const modUrl = `https://api.curseforge.com/v1/mods/${curseforgeId}?_v=2`;
    const modResponse = await fetch(modUrl, {
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
      },
    });

    if (!modResponse.ok) {
      throw new Error(`CurseForge Mod details failed with status: ${modResponse.status}`);
    }

    const modData = await modResponse.json();
    const modDetails = modData.data || {};

    // Fetch mod description HTML
    const descUrl = `https://api.curseforge.com/v1/mods/${curseforgeId}/description?_v=2`;
    const descResponse = await fetch(descUrl, {
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "Creevoxx/1.0 (contact@creevoxx.store)",
      },
    });

    let descriptionHtml = null;
    if (descResponse.ok) {
      const descData = await descResponse.json();
      descriptionHtml = descData.data || "";
    }

    // Parse versions and loaders
    const versions = new Set();
    const loaders = new Set();
    
    if (modDetails.latestFiles && Array.isArray(modDetails.latestFiles)) {
      for (const file of modDetails.latestFiles) {
        if (file.gameVersions && Array.isArray(file.gameVersions)) {
          for (const v of file.gameVersions) {
            if (v.match(/^1\.\d+(\.\d+)?$/)) {
              versions.add(v);
            }
            const lower = v.toLowerCase();
            if (["forge", "fabric", "quilt", "neoforge"].includes(lower)) {
              loaders.add(lower.charAt(0).toUpperCase() + lower.slice(1));
            }
          }
        }
      }
    }

    const gameVersions = Array.from(versions)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, 6);

    const modLoaders = Array.from(loaders);

    // Extract direct downloadUrl
    let downloadUrl = null;
    let fileSize = null;
    if (modDetails.latestFiles && Array.isArray(modDetails.latestFiles)) {
      const fileWithUrl = modDetails.latestFiles.find((f) => f.downloadUrl);
      if (fileWithUrl) {
        downloadUrl = fileWithUrl.downloadUrl;
        const bytes = fileWithUrl.fileLength;
        if (bytes) {
          fileSize = bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + " MB" : (bytes / 1024).toFixed(2) + " KB";
        }
      } else if (modDetails.latestFiles.length > 0) {
        const firstFile = modDetails.latestFiles[0];
        if (firstFile) {
          downloadUrl = firstFile.downloadUrl || `https://www.curseforge.com/api/v1/mods/${curseforgeId}/files/${firstFile.id}/download`;
          const bytes = firstFile.fileLength;
          if (bytes) {
            fileSize = bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + " MB" : (bytes / 1024).toFixed(2) + " KB";
          }
        }
      }
    }

    return {
      id: modDetails.id,
      name: modDetails.name,
      summary: modDetails.summary,
      category: mapClassIdToCategory(modDetails.classId, modDetails.categories),
      logoUrl: (() => {
        let url = modDetails.logo ? modDetails.logo.url || modDetails.logo.thumbnailUrl : null;
        const overrideUrl = getCustomThumbnail(modDetails.name);
        if (overrideUrl) url = overrideUrl;
        return url;
      })(),
      authors: modDetails.authors || [],
      downloadCount: modDetails.downloadCount || null,
      dateCreated: modDetails.dateCreated || null,
      dateModified: modDetails.dateModified || null,
      descriptionHtml,
      screenshots: modDetails.screenshots || [],
      gameVersions,
      modLoaders,
      downloadUrl,
      fileSize,
    };
  } catch (error) {
    console.error(`[CurseForge Details Helper] Live fetch for ${id} failed:`, error.message);
    try {
      const { SEED_DATA } = await import("./syncDatabase.js");
      const idStr = String(id).toLowerCase();
      const found = SEED_DATA.find((r) =>
        String(r.id) === idStr ||
        String(r.curseforge_id) === idStr ||
        r.docId === id ||
        (r.title && r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === idStr) ||
        (r.title && r.title.toLowerCase().includes(idStr))
      );
      if (found) {
        return {
          id: found.id,
          name: found.title,
          summary: found.description || "No description provided.",
          category: found.category || "shaders",
          logoUrl: (() => {
            let url = found.thumbnail_url || found.logoUrl;
            const overrideUrl = getCustomThumbnail(found.title);
            if (overrideUrl) url = overrideUrl;
            return url;
          })(),
          authors: found.authors || [{ name: found.author || "creator" }],
          downloadCount: found.download_count || found.downloadCount || 0,
          dateCreated: found.dateCreated || null,
          dateModified: found.dateModified || new Date().toISOString(),
          descriptionHtml: `<p>${found.description || ""}</p>`,
          screenshots: found.screenshots || [],
          gameVersions: found.gameVersions || [found.version || "1.21"],
          modLoaders: found.modLoaders || [],
          downloadUrl: found.downloadUrl || found.curseforge_url || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(found.title)}`,
          fileSize: found.fileSize || "N/A",
        };
      }
    } catch (fallbackErr) {
      console.error("[CurseForge Details Fallback Error]", fallbackErr.message);
    }
    throw error;
  }
}
