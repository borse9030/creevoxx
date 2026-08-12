import { NextResponse } from "next/server";
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";

export async function GET(request) {
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

  // Each pick has a primary query and a fallback query.
  // Primary queries are tried first against the Bedrock shaders catalog (seed + cache).
  // If the primary returns nothing, the fallback is tried.
  // Using category:"shaders" + edition:"bedrock" ensures the fast seed/Redis cache
  // path is taken instead of burning a live CurseForge quota call.
  const exactTopPicks = [
    { name: "NEWB X DAWN",        query: "Newb X Dawn",        fallback: "newb" },
    { name: "NEWB X STARS",       query: "Newb X Stars",       fallback: "newb" },
    { name: "NEWB X UNWIND",      query: "Newb X Unwind",      fallback: "newb" },
    { name: "NEWB X FLAMINGO",    query: "Newb X Flamingo",    fallback: "newb" },
    { name: "NEWB X SAPPHIRE",    query: "Newb X Sapphire",    fallback: "newb" },
    { name: "NEWB X LEGACY",      query: "Newb X Legacy",      fallback: "newb" },
    { name: "NEWB X DRAGON",      query: "Newb X Dragon",      fallback: "newb" },
    { name: "NEWB X ALE",         query: "Newb X Ale",         fallback: "newb" },
    { name: "NEWB X APOCALIPSIS", query: "Newb X Apocalipsis", fallback: "newb" },
  ];

  try {
    // Fetch all primary queries in parallel using the bedrock shaders category
    // so the seed/Redis cache is used (fast, no quota cost).
    const primaryPromises = exactTopPicks.map(({ query }) =>
      fetchCurseforgeSearchCached({
        query,
        category: "shaders",
        edition: "bedrock",
        pageSize: 1,
      }).catch(() => null)
    );

    const primaryResponses = await Promise.all(primaryPromises);

    // Identify slots that came back empty and need a fallback fetch
    const fallbackPromises = primaryResponses.map((res, i) => {
      if (res && res.data && res.data.length > 0) return Promise.resolve(null);
      // Primary failed — try the fallback query
      return fetchCurseforgeSearchCached({
        query: exactTopPicks[i].fallback,
        category: "shaders",
        edition: "bedrock",
        pageSize: 3,
      }).catch(() => null);
    });

    const fallbackResponses = await Promise.all(fallbackPromises);

    // Build the final results array, PRESERVING positional mapping.
    // Each slot = primary result || first fallback result || null.
    // The Flutter app relies on array index === pick index.
    const results = primaryResponses.map((res, i) => {
      let result = null;
      if (res && res.data && res.data.length > 0) {
        result = res.data[0];
      } else {
        const fb = fallbackResponses[i];
        if (fb && fb.data && fb.data.length > 0) {
          result = fb.data[0];
        }
      }

      if (result) {
        // Inject custom thumbnail from our /public/thumbnails directory
        const customThumbnail = `https://creevoxx.dev/thumbnails/${exactTopPicks[i].name.toLowerCase().replace(/ /g, '_')}.webp`;
        result.thumbnail_url = customThumbnail;
      }

      return result; // Slot can be intentionally null — Flutter will show a placeholder
    });

    // Filter out nulls only after building the positionally-correct array.
    // Send the full array including nulls so Flutter can maintain the mapping.
    const response = NextResponse.json({ resources: results });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
