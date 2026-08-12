
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external image domains used by resource thumbnails
  images: {
    // Disable image optimization entirely to stop Vercel Image Cache limits from being exhausted.
    // Images will load directly from the original source (CurseForge/Modrinth) which is safe and free.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "media.forgecdn.net" },
      { protocol: "https", hostname: "cdn.modrinth.com" },
      { protocol: "https", hostname: "vanillatweaks.net" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.curseforge.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.modrinth.com" },
    ],
  },

  // Add strict cache-control headers for static assets
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Enable Turbopack (default in Next.js 16) — empty config silences the warning
  turbopack: {},
};

export default nextConfig;
