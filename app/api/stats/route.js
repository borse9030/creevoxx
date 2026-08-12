// app/api/stats/route.js
// Dedicated endpoint for live Bedrock stats (total, shaders, textures, mods counts).
// Served with aggressive edge caching (5 min CDN, 1hr stale-while-revalidate).
// This offloads getLiveStats() from the SSR critical path entirely.

import { NextResponse } from "next/server";
import { getLiveStats } from "@/lib/curseforgeCached";

export async function GET() {
  try {
    const stats = await getLiveStats();
    const response = NextResponse.json(stats);
    // Edge cache: Vercel CDN serves this for 5 min, refreshes in background for 1 hr.
    // All homepage visitors share one cached response — getLiveStats() runs at most
    // once per 5 minutes globally instead of once per user request.
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
    return response;
  } catch (err) {
    console.error("[/api/stats] Failed to fetch live stats:", err.message);
    return NextResponse.json(
      { total: 0, mods: 0, textures: 0, shaders: 0, maps: 0, skins: 0 },
      { status: 200 } // Always return 200 so UI doesn't break
    );
  }
}
