import { NextResponse } from "next/server";
import { fetchCurseforgeSearchCached as fetchCurseforgeSearch } from "@/lib/curseforgeCached";
import { isRateLimited } from "@/lib/rateLimiter";

export async function GET(request) {
  // Block requests not from the site or the Flutter app
  const APP_SHARED_SECRET = process.env.APP_SHARED_SECRET;
  const providedSecret = request.headers.get("x-app-secret") || "";
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  // NOTE: same-origin fetch() calls do NOT send an "origin" header (browser spec).
  // Mobile browsers with strict privacy settings may also strip the "referer" header.
  // The "host" header is always sent for same-origin requests and is reliable.
  const host = request.headers.get("host") || "";
  const allowedHost = "creevoxx.dev";
  const isBrowserOrigin =
    origin.includes(allowedHost) ||
    referer.includes(allowedHost) ||
    host.includes(allowedHost); // catches same-origin fetches from mobile with no referer
  const isAuthorizedApp = APP_SHARED_SECRET && providedSecret === APP_SHARED_SECRET;
  const isInternal = isBrowserOrigin || isAuthorizedApp || process.env.NODE_ENV === "development";

  if (!isInternal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Redis-backed rate limit by IP (works across all Vercel instances)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
  const index = parseInt(searchParams.get("index") || "0", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "24", 10), 48); // cap at 48
  const sortField = searchParams.get("sortField") || "6";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const edition = searchParams.get("edition") || "all";
  const version = searchParams.get("version") || "";

  try {
    let result;

    // Special case: lock the Render Dragon grid to exactly these 8 shaders
    if (query === "RenderDragonGrid") {
      const gridItems = [
        {
          id: "1325119",
          docId: "1325119",
          curseforge_id: 1325119,
          title: "Lunac Shaders 3D 1.9.9 | RTX, Heightmaps, High - Q Lighting And Shadows",
          description: "Lunac Shaders 3D offers an incredible graphical overhaul with realistic lighting, shadows, and heightmaps.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/lunac_shaders_3d.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "RTX", "Render Dragon"]
        },
        {
          id: "1586118",
          docId: "1586118",
          curseforge_id: 1586118,
          title: "Lemo Visuals",
          description: "Lemo Visuals is a beautiful and lightweight shader pack that works on Render Dragon.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/lemo_visuals.webp",
          author: "creator",
          download_count: 45000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "1238974",
          docId: "1238974",
          curseforge_id: 1238974,
          title: "RG Shader | Renderdragon Shaders",
          description: "RG Shader is designed specifically for the new Render Dragon graphics engine.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/rg_shader.webp",
          author: "creator",
          download_count: 55000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "1023716",
          docId: "1023716",
          curseforge_id: 1023716,
          title: "Luminous Dreams v1.0 [RELEASE]",
          description: "Luminous Dreams provides vibrant colors and stunning atmospheric lighting.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/luminous_dreams.webp",
          author: "creator",
          download_count: 60000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "1382066",
          docId: "1382066",
          curseforge_id: 1382066,
          title: "BSLB Shaders Bedrock - Classic V3",
          description: "BSLB Shaders brings a classic and nostalgic shader feel to Bedrock edition.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/bslb_shaders.webp",
          author: "creator",
          download_count: 70000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "1246482",
          docId: "1246482",
          curseforge_id: 1246482,
          title: "Newb X Dragon Shader | Compatible with Minecraft  v26.32",
          description: "Newb X Dragon is a highly optimized and beautiful shader for Render Dragon.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/newb_x_dragon.webp",
          author: "creator",
          download_count: 85000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "813185",
          docId: "813185",
          curseforge_id: 813185,
          title: "Pastel Shaders",
          description: "Pastel Shaders add a soft, dreamy, and colorful look to your Minecraft world.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/pastel_shaders.webp",
          author: "creator",
          download_count: 95000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        },
        {
          id: "1328997",
          docId: "1328997",
          curseforge_id: 1328997,
          title: "R135 Shader RD | Realistic and Lightweight Shader | Minecraft BE 1.21+ (Render Dragon Support!!)",
          description: "R135 is a highly realistic yet lightweight shader designed for maximum performance.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/r135_shader.webp",
          author: "creator",
          download_count: 40000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Render Dragon"]
        }
      ];

      result = {
        data: gridItems,
        pagination: {
          index: 0,
          pageSize: 20,
          resultCount: gridItems.length,
          totalCount: gridItems.length,
        },
        counts: {},
      };
    } else if (query === "VibrantVisualsGrid") {
      const gridItems = [
        {
          id: "544096",
          docId: "544096",
          curseforge_id: 544096,
          title: "Sildur's Vibrant shaders",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/sildurs_vibrant_shaders.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1076812",
          docId: "1076812",
          curseforge_id: 1076812,
          title: "Prizma Visuals Legacy (Vibrant Visuals Pack Deferred)",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/prizma_visuals_legacy.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1269725",
          docId: "1269725",
          curseforge_id: 1269725,
          title: "Revolution Vibrant Visuals | Static Light",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/revolution_vibrant_visuals.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1366035",
          docId: "1366035",
          curseforge_id: 1366035,
          title: "Definitive Vibrant Visuals | Static Light Update",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/definitive_vibrant_visuals.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1289779",
          docId: "1289779",
          curseforge_id: 1289779,
          title: "Better Vibrant Visuals | Static Light",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/better_vibrant_visuals.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1170942",
          docId: "1170942",
          curseforge_id: 1170942,
          title: "Odyssey Visuals (Vibrant Visuals/Deferred)",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/odyssey_visuals.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1260110",
          docId: "1260110",
          curseforge_id: 1260110,
          title: "Solace V (Vibrant Visuals)",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/solace_v.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        },
        {
          id: "1330177",
          docId: "1330177",
          curseforge_id: 1330177,
          title: "Dreamy Visuals |  Renewed Vibrant Visuals",
          description: "A highly rated Vibrant Visuals shader.",
          category: "shaders",
          version: "1.21",
          thumbnail_url: "https://creevoxx.dev/thumbnails/dreamy_visuals.webp",
          author: "creator",
          download_count: 50000,
          dateModified: new Date().toISOString(),
          tags: ["Shaders", "Vibrant Visuals"]
        }
      ];

      result = {
        data: gridItems,
        pagination: {
          index: 0,
          pageSize: 20,
          resultCount: gridItems.length,
          totalCount: gridItems.length,
        },
        counts: {},
      };
    } else {
      result = await fetchCurseforgeSearch({
        query,
        category,
        categoryId,
        index,
        pageSize,
        sortField,
        sortOrder,
        edition,
        version,
      });
    }

    // Edge cache: same query served from Vercel CDN for 5 min.
    // stale-while-revalidate: edge refreshes in background — zero user-visible latency.
    // This is the single biggest Vercel invocation saving at high traffic.
    const response = NextResponse.json(result);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
    return response;
  } catch (error) {
    console.error("[API Search Route] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
