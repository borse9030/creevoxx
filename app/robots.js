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
    // creevoxx.dev and www.creevoxx.dev are crawled.
    sitemap: "https://www.creevoxx.dev/sitemap.xml",
    host: "https://www.creevoxx.dev",
  };
}

