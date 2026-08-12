import { NextResponse } from "next/server";
import { fetchCurseforgeDetailsCached as fetchCurseforgeDetails } from "@/lib/curseforgeCached";
import { isRateLimited } from "@/lib/rateLimiter";

export async function GET(request, { params }) {
  // Block requests not from the site or the Flutter app
  const APP_SHARED_SECRET = process.env.APP_SHARED_SECRET;
  const providedSecret = request.headers.get("x-app-secret") || "";
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";
  const allowedHost = "creevoxx.dev";
  const isBrowserOrigin =
    origin.includes(allowedHost) ||
    referer.includes(allowedHost) ||
    host.includes(allowedHost);
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

  const { id } = await params;

  try {
    const details = await fetchCurseforgeDetails(id);
    // Edge cache for 24 hours — mod details almost never change within a day.
    const response = NextResponse.json(details);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return response;
  } catch (error) {
    console.error(`[API Route] Error fetching CurseForge details for ${id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
