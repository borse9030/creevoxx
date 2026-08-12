import { NextResponse } from "next/server";
import { SEO_WHITELIST } from "@/lib/seoWhitelist";
import { ARTICLES } from "@/app/guides/data";

export const revalidate = 86400; // regenerate at most once per day — sitemap content is stable

export async function GET() {
  const baseUrl = "https://www.creevoxx.store";

  // Stable site launch / last major structural update date.
  // Only bump this when static page content significantly changes.
  const SITE_LAUNCH_DATE = "2026-06-24T00:00:00.000Z";
  // Use a monthly-stable date for resource pages (1st of current month)
  // so Google doesn't treat all 500 resource pages as "just updated" every hour.
  const today = new Date();
  const RESOURCE_LASTMOD = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  ).toISOString();

  const urls = [];

  // ── Homepage (highest priority) ──────────────────────────────────────────
  urls.push({
    loc: baseUrl,
    lastmod: RESOURCE_LASTMOD, // reflects that listings change monthly
    changefreq: "daily",
    priority: "1.0",
  });

  // ── Static informational pages ───────────────────────────────────────────
  const staticPages = [
    { path: "/about",      date: SITE_LAUNCH_DATE },
    { path: "/contact",    date: SITE_LAUNCH_DATE },
    { path: "/privacy",    date: SITE_LAUNCH_DATE },
    { path: "/terms",      date: SITE_LAUNCH_DATE },
    { path: "/disclaimer", date: SITE_LAUNCH_DATE },
    { path: "/guides",     date: SITE_LAUNCH_DATE },
    { path: "/category",   date: RESOURCE_LASTMOD },
  ];
  for (const { path, date } of staticPages) {
    urls.push({
      loc: `${baseUrl}${path}`,
      lastmod: date,
      changefreq: "monthly",
      priority: "0.5",
    });
  }

  // ── Individual guide article pages (use real publish date) ───────────────
  for (const article of ARTICLES) {
    const parsed = new Date(article.date);
    const lastmod = !isNaN(parsed.getTime()) ? parsed.toISOString() : SITE_LAUNCH_DATE;
    urls.push({
      loc: `${baseUrl}/guides/${article.slug}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.75",
    });
  }

  // ── Category listing pages ───────────────────────────────────────────────
  const categoryPages = [
    "/resource/category/mods/1",
    "/resource/category/textures/1",
    "/resource/category/shaders/1",
    "/resource/category/low-end/1",
    "/resource/category/high-end/1",
  ];
  for (const p of categoryPages) {
    urls.push({
      loc: `${baseUrl}${p}`,
      lastmod: RESOURCE_LASTMOD,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  // ── Best-of curated pages ────────────────────────────────────────────────
  const bestPages = [
    "/best/shaders-low-end",
    "/best/performance-mods-mcpe",
    "/best/realistic-shaders",
    "/best/rtx-texture-packs",
    "/best/mcpe-shaders-1-21",
    "/best/shaders-for-android",
    "/best/pvp-texture-packs",
    "/best/medieval-texture-packs",
    "/best/performance-mods",
    "/best/low-end-shaders",
  ];
  for (const p of bestPages) {
    urls.push({
      loc: `${baseUrl}${p}`,
      lastmod: SITE_LAUNCH_DATE,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  // ── VIP resource pages from SEO whitelist (500 IDs) ──────────────────────
  // All use a monthly-stable date — prevents false "always-updated" signal.
  for (const id of SEO_WHITELIST) {
    urls.push({
      loc: `${baseUrl}/resource/${id}`,
      lastmod: RESOURCE_LASTMOD,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  // ── Build XML ─────────────────────────────────────────────────────────────
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Long cache — sitemap is now stable. Googlebot will still refetch on schedule.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}

