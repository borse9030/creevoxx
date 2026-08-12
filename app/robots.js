export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block API routes and internal Next.js paths from indexing
        disallow: ["/api/"],
      },
    ],
    // Always point at the www-prefixed canonical URL.
    // This helps Googlebot resolve the canonical domain when both
    // creevoxx.store and www.creevoxx.store are crawled.
    sitemap: "https://www.creevoxx.store/sitemap.xml",
    host: "https://www.creevoxx.store",
  };
}

