import { NextResponse } from "next/server";

// The same secret compiled into the Flutter APK (api_service.dart).
// Any request to /api/* must present this header OR come from the same origin (website).
const APP_SECRET = process.env.APP_SHARED_SECRET;


export function proxy(request) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // ── 1. Redirect .vercel.app → real domain ────────────────────────────────
  if (host.includes("vercel.app")) {
    const url = request.nextUrl.clone();
    url.host = "www.creevoxx.store";
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, { status: 308 });
  }

  // ── 2. Protect /api/* routes ─────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const secret  = request.headers.get("x-app-secret") || "";
    const origin  = request.headers.get("origin")  || "";
    const referer = request.headers.get("referer") || "";
    const ua      = request.headers.get("user-agent") || "";

    // Allow Flutter app — must supply the correct secret
    const hasValidSecret = secret === APP_SECRET;

    // Allow same-origin website requests (Next.js internal API calls, SSR, etc.)
    // NOTE: browsers never send the "origin" header for same-origin fetch() calls (browser spec).
    // Mobile browsers with strict privacy settings may also strip "referer".
    // The "host" header is always present for same-origin requests and is reliable.
    const isLocalDev = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const isSameOrigin =
      isLocalDev || // always allow on local dev (enables iPhone UA testing in DevTools)
      origin.includes("creevoxx.store") ||
      referer.includes("creevoxx.store") ||
      host.includes("creevoxx.store"); // reliable fallback: always sent for same-origin requests

    // Block obvious bots/scrapers that aren't the Flutter app and aren't same-origin
    if (!hasValidSecret && !isSameOrigin) {
      // Log blocked attempt (visible in Vercel function logs)
      console.warn(`[Proxy] Blocked /api request — UA: "${ua.slice(0, 80)}", IP: ${
        request.headers.get("x-forwarded-for") || "unknown"
      }`);
      return new NextResponse(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware where it's actually needed:
  //  1. All /api/* routes  → secret protection
  //  2. All real page routes → vercel.app redirect
  // Skips: _next/*, static files, images, fonts, favicon, and any URL with a file extension
  matcher: [
    "/api/:path*",
    "/((?!_next/|_static/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|css|js|map)$).*)",
  ],
};
