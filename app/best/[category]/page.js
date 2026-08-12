import React from "react";
import ResourceCard from "@/components/ResourceCard";
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";

// Curated Best-Of categories configuration lookup
const BEST_OF_CONFIG = {
  "realistic-shaders": {
    category: "shaders",
    query: "realistic",
    title: "Best Realistic Minecraft Shaders",
    h1: "Best Realistic Minecraft Shaders for High-End PCs (2026)",
    intro: "Transform your Minecraft world with stunning visual upgrades. Here are the top realistic Minecraft shaders, featuring dynamic lighting, realistic water reflections, and gorgeous skybox atmospheric effects.",
  },
  "performance-mods": {
    category: "mods",
    query: "fps boost",
    title: "Best Minecraft Performance Mods",
    h1: "Best Minecraft Performance Mods for Maximum FPS Boost (2026)",
    intro: "Boost your FPS and eliminate stuttering. These hand-picked Minecraft performance mods (like Sodium and Lithium) will optimize your game engine, rendering pipeline, and memory usage for maximum smooth gameplay.",
  },
  "low-end-shaders": {
    category: "shaders",
    query: "lite",
    title: "Best Minecraft Shaders for Low-End PCs",
    h1: "Best Minecraft Shaders for Laptops and Low-End PCs (2026)",
    intro: "Enjoy beautiful lighting without sacrificing performance. These light shaders are perfectly optimized to give you beautiful visual effects while maintaining a stable 60+ FPS on laptops and low-spec devices.",
  },
  "pvp-texture-packs": {
    category: "textures",
    query: "pvp",
    title: "Best Minecraft PvP Texture Packs",
    h1: "Best Minecraft PvP Texture Packs for Competitive Gameplay (2026)",
    intro: "Gain a competitive edge in Bedwars, SkyWars, and Arena PvP. These top PvP texture packs feature short swords, clear inventories, low fire, and high-FPS optimization to help you dominate.",
  },
  "shaders-low-end": {
    category: "shaders",
    query: "lite",
    title: "Best Shaders for Low-End Minecraft Devices",
    h1: "Best Shaders for Low-End Minecraft Devices (2026)",
    intro: "Looking for lightweight shaders that won't lag your device? These low-end shaders are perfectly optimized to give you beautiful lighting, realistic shadows, and smooth frame rates on laptops, mobile phones, and older PCs.",
  },
  "performance-mods-mcpe": {
    category: "mods",
    query: "fps boost",
    title: "Best Minecraft Bedrock PE Performance Mods",
    h1: "Best Minecraft PE Performance Mods (2026)",
    intro: "Boost your frame rates on Pocket Edition and Bedrock. These hand-picked FPS booster mods fix memory leaks, streamline rendering, and give your mobile Minecraft gameplay a major FPS boost.",
    edition: "bedrock",
  },
  "rtx-texture-packs": {
    category: "textures",
    query: "rtx",
    title: "Best RTX Texture Packs for Minecraft PE",
    h1: "Best RTX Texture Packs for Minecraft (2026)",
    intro: "Experience next-gen graphics in Minecraft Bedrock. These ray-tracing texture packs bring realistic 3D textures, ambient occlusion, glowing ores, and true photorealism to compatible devices.",
    edition: "bedrock",
  },
  "mcpe-shaders-1-21": {
    category: "shaders",
    query: "1.21",
    title: "Best Minecraft Bedrock 1.21 Shaders",
    h1: "Best Minecraft Bedrock 1.21 Shaders (2026)",
    intro: "Discover the top shaders updated for Minecraft Bedrock 1.21. These shaders feature full compatibility with RenderDragon and are optimized for smooth, stutter-free performance.",
    edition: "bedrock",
  },
  "shaders-for-android": {
    category: "shaders",
    query: "pe",
    title: "Best Minecraft Shaders for Android & iOS",
    h1: "Best Minecraft Shaders for Android & iOS (2026)",
    intro: "Beautiful mobile graphics without sacrificing battery life. Explore the best Minecraft Pocket Edition (MCPE) shaders specifically configured for Android and iOS devices.",
    edition: "bedrock",
  },
  "medieval-texture-packs": {
    category: "textures",
    query: "medieval",
    title: "Best Medieval Minecraft Texture Packs",
    h1: "Best Medieval Minecraft Texture Packs (2026)",
    intro: "Step back in time with rustic stone, detailed wood, and historic weapon designs. These medieval resource packs transform your worlds into majestic castles and ancient villages.",
  },
};

// Helper function to dynamically resolve parameters from URL slugs
function resolveBestOfParams(slug) {
  const config = BEST_OF_CONFIG[slug];
  if (config) return config;

  // Programmatic fallback if the slug isn't pre-configured
  const parts = slug.split("-");
  let category = "mods";
  if (parts.includes("shaders") || parts.includes("shader")) {
    category = "shaders";
  } else if (parts.includes("textures") || parts.includes("texture") || parts.includes("resourcepack") || parts.includes("pack")) {
    category = "textures";
  }

  // Filter out category keywords to reconstruct the query term
  const keywords = ["shaders", "shader", "textures", "texture", "resourcepack", "pack", "mods", "mod", "best", "top", "of"];
  const queryParts = parts.filter((p) => !keywords.includes(p));
  const query = queryParts.join(" ");

  const formattedTitle = queryParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  const categoryLabel = category === "shaders" ? "Shaders" : category === "textures" ? "Texture Packs" : "Mods";

  const resolvedTitle = formattedTitle 
    ? `Best ${formattedTitle} ${categoryLabel}`
    : `Best Minecraft ${categoryLabel}`;

  const isBedrock = slug.match(/mcpe|bedrock|android|ios|pocket|-pe(-|$)/);

  return {
    category,
    query: query || "best",
    title: resolvedTitle,
    h1: `${resolvedTitle} (2026)`,
    intro: `Looking for the absolute best ${formattedTitle ? formattedTitle.toLowerCase() : ""} ${categoryLabel.toLowerCase()}? We have analyzed and compiled the top performance-rated resources in our directory for Minecraft 1.21. Explore download links and details below.`,
    edition: isBedrock ? "bedrock" : "java",
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;
  const data = resolveBestOfParams(slug);

  return {
    title: `${data.title} - Top 10 Best Lists (2026)`,
    description: `Discover the top 10 list of ${data.h1.toLowerCase()}. Read reviews, details, and download directly. Hand-picked and manually tested for performance.`,
    alternates: {
      canonical: `https://www.creevoxx.dev/best/${slug}`,
    },
  };
}

export default async function BestOfPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;
  const data = resolveBestOfParams(slug);

  let resources = [];
  try {
    const searchData = await fetchCurseforgeSearchCached({
      query: data.query,
      category: data.category,
      index: 0,
      pageSize: 20, // Fetch the top 20 items
      sortField: "6", // Popularity (Downloads)
      sortOrder: "desc",
      edition: data.edition || "java",
    });
    resources = searchData.data || [];
  } catch (err) {
    console.error(`Failed to fetch Best-Of landing page resources for slug ${slug}:`, err);
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.creevoxx.dev/" },
      { "@type": "ListItem", position: 2, name: data.title, item: `https://www.creevoxx.dev/best/${slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": data.h1,
    "description": data.intro,
    "itemListElement": resources.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.creevoxx.dev/resource/${item.id || item.docId}`
    }))
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Dynamic SEO H1 & Header */}
      <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "var(--color-accent)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          {data.h1}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted)", lineHeight: "1.6", maxWidth: "900px" }}>
          {data.intro}
        </p>
      </div>

      {/* Grid Layout reusing Card Components */}
      {resources.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
          <p style={{ color: "var(--color-text-muted)" }}>No resources found for this category.</p>
        </div>
      ) : (
        <div className="resources-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {resources.map((item) => (
            <ResourceCard 
              key={item.id} 
              resource={item} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
