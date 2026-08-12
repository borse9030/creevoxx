import React from "react";
import ResourceCard from "@/components/ResourceCard";
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY INTENT MAP
// Each slug maps to a precise GSC keyword cluster.
// Keys = URL slugs at /category/<slug>
// Variants = all semantic aliases that resolve to the SAME page (helps
//            generateStaticParams / Sitemap cover long-tail intent clusters)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  // ── Bedrock / MCPE Performance ────────────────────────────────────────────
  "bedrock-performance": {
    title: "Best Performance Mods & Shaders for Minecraft Bedrock (MCPE / Mobile)",
    h1: "Best Performance Mods & Shaders for Minecraft Bedrock (MCPE / Mobile) 2026",
    intro:
      "Laggy Bedrock? Fix it instantly. We've hand-tested the highest-rated optimization addons and shaders for Minecraft Pocket Edition and Windows 10/11 Bedrock Edition. Every entry below is verified compatible with RenderDragon and the latest 1.21 update.",
    description:
      "Discover the best performance mods and shaders for Minecraft Bedrock (MCPE). Boost FPS on Android, iOS, and PC with our hand-tested optimization list updated for 1.21.",
    curseforgeParams: { query: "performance", category: "mods", edition: "bedrock" },
    curseforgeParams2: { query: "lite", category: "shaders", edition: "bedrock" },
    tags: ["bedrock", "mcpe", "performance", "pocket edition", "mobile", "fps boost", "optimization", "bedrock mods"],
    edition: "bedrock",
    emoji: "📱",
    badge: "MCPE / Bedrock",
    accentColor: "#22c55e",
    keywords:
      "bedrock performance mods, mcpe mods, minecraft pocket edition shaders, bedrock fps boost, minecraft mobile optimization, bedrock 1.21 mods, mcpe performance",
  },

  // ── Low-End Shaders ───────────────────────────────────────────────────────
  "low-end-shaders": {
    title: "Best Shaders for Low-End PCs & Laptops (1.21+ FPS Boost)",
    h1: "Best Shaders for Low-End PCs & Laptops (1.21+ FPS Boost)",
    intro:
      "You don't need an RTX card to play beautiful Minecraft. These shaders are specifically optimized for integrated graphics, older CPUs, and low-VRAM devices. We benchmarked every entry below on a budget laptop so you don't have to.",
    description:
      "Download the best minecraft shaders for low end pc layouts. Run lag-free, lightweight potato shader packs on integrated graphics for Minecraft 1.21.",
    curseforgeParams: { query: "lite performance", category: "shaders", device: "low-end", edition: "java" },
    curseforgeParams2: { query: "lite", category: "shaders", device: "low-end", edition: "bedrock" },
    tags: ["low end", "shaders", "lite", "fps", "laptop", "potato pc", "integrated graphics", "low spec"],
    edition: "java",
    emoji: "💻",
    badge: "Low-End Friendly",
    accentColor: "#f59e0b",
    keywords:
      "shaders for low end pc, minecraft shaders laptop, lite minecraft shaders, low spec shaders, minecraft shaders without lag, best shaders low end 2026",
  },

  // ── Java Performance Mods ─────────────────────────────────────────────────
  "java-performance-mods": {
    title: "Best Minecraft Java Performance Mods (Sodium, Lithium & More)",
    h1: "Best Minecraft Java Performance Mods — Sodium, Lithium & More (2026)",
    intro:
      "The definitive Java Edition performance stack. These mods target every bottleneck — rendering, chunk loading, lighting, and garbage collection — to unlock your hardware's true potential. Start with Sodium and build from there.",
    description:
      "Best Minecraft Java performance mods including Sodium, Lithium, and Iris. Maximize FPS and eliminate stuttering with our 2026 optimization guide.",
    curseforgeParams: { query: "sodium fps optimization", category: "mods", edition: "java" },
    curseforgeParams2: { query: "lithium starlight", category: "mods", edition: "java" },
    tags: ["java", "performance", "sodium", "lithium", "fps", "optimization", "iris", "starlight", "indium"],
    edition: "java",
    emoji: "⚡",
    badge: "Java Edition",
    accentColor: "#6366f1",
    keywords:
      "minecraft java performance mods, sodium mod, lithium minecraft, java fps mods, minecraft optimization mods 2026, iris shaders mod",
  },

  // ── RTX / High-End Texture Packs ─────────────────────────────────────────
  "rtx-texture-packs": {
    title: "Best RTX Texture Packs for Minecraft Bedrock & Java",
    h1: "Best RTX & Photorealistic Texture Packs for Minecraft (2026)",
    intro:
      "Push your GPU to its limit. These PBR and ray-tracing texture packs are engineered for maximum visual fidelity — realistic normals, specular maps, subsurface scattering, and true path-traced lighting on supported hardware.",
    description:
      "Best Minecraft RTX texture packs for Bedrock and Java. Photorealistic PBR graphics with ray tracing, realistic water, and stunning lighting for high-end PCs.",
    curseforgeParams: { query: "rtx realistic pbr", category: "textures", edition: "bedrock" },
    curseforgeParams2: { query: "ultra realistic", category: "textures", edition: "java" },
    tags: ["rtx", "ray tracing", "realistic", "pbr", "photorealistic", "4k", "high end", "ultra"],
    edition: "bedrock",
    emoji: "🎮",
    badge: "RTX / High-End",
    accentColor: "#ec4899",
    keywords:
      "minecraft rtx texture packs, ray tracing minecraft, pbr texture pack, photorealistic minecraft, minecraft 4k textures, rtx bedrock packs",
  },

  // ── PvP Texture Packs ─────────────────────────────────────────────────────
  "pvp-texture-packs": {
    title: "Best Minecraft PvP Texture Packs for Bedwars & SkyWars",
    h1: "Best Minecraft PvP Texture Packs — Bedwars, SkyWars & Arena (2026)",
    intro:
      "Win more fights with packs engineered for competitive play. Low fire, short swords, clear glass, clean GUI — every millisecond counts and these packs are tuned for maximum visibility and reaction speed.",
    description:
      "Best Minecraft PvP texture packs for Bedwars, SkyWars, and arena PvP. Low fire, short swords, clean UI — optimized for competitive gameplay in 2026.",
    curseforgeParams: { query: "pvp 16x", category: "textures", edition: "java" },
    curseforgeParams2: { query: "pvp competitive", category: "textures", edition: "bedrock" },
    tags: ["pvp", "bedwars", "skywars", "competitive", "16x", "low fire", "short sword", "fps friendly"],
    edition: "java",
    emoji: "⚔️",
    badge: "PvP / Competitive",
    accentColor: "#ef4444",
    keywords:
      "minecraft pvp texture packs, bedwars texture pack, skywars pack, pvp minecraft 2026, low fire texture pack, short sword pack, minecraft pvp pack",
  },

  // ── Bedrock Shaders ───────────────────────────────────────────────────────
  "bedrock-shaders": {
    title: "Best Minecraft Bedrock Shaders - Windows & Console",
    h1: "Best Minecraft Bedrock Shaders - Windows & Console",
    intro:
      "Upgrade your Bedrock visuals instantly. We've compiled the most beautiful lighting, shadows, and skies for Windows 10/11 and console players.",
    description:
      "Get top-tier shader packs for minecraft bedrock. Discover hyper-realistic visual textures, dynamic light rays, and beautiful skies for Bedrock editions.",
    curseforgeParams: { query: "shaders", category: "shaders", edition: "bedrock" },
    curseforgeParams2: null,
    tags: ["bedrock", "shaders", "windows", "console", "ray tracing", "realistic"],
    edition: "bedrock",
    emoji: "🌌",
    badge: "Bedrock Edition",
    accentColor: "#8b5cf6",
    keywords:
      "minecraft bedrock shaders, windows 10 shaders, bedrock shader packs, console minecraft shaders, bedrock edition graphics",
  },

  // ── MCPE Shaders ──────────────────────────────────────────────────────────
  "mcpe-shaders": {
    title: "Best Shaders for Minecraft Pocket Edition (MCPE 1.21)",
    h1: "Best Shaders for Minecraft Pocket Edition (MCPE 1.21)",
    intro:
      "Transform your pocket edition graphics. These optimized shaders bring dynamic lighting and vibrant colors to Android and iOS without killing your battery or FPS.",
    description:
      "Explore performance-friendly shaders for minecraft pe 1.21. Download safe render dragon shader packs for android and iOS mobile platforms without lag.",
    curseforgeParams: { query: "pe shaders renderdragon", category: "shaders", edition: "bedrock" },
    curseforgeParams2: { query: "mobile shaders", category: "shaders", edition: "bedrock" },
    tags: ["mcpe", "shaders", "pocket edition", "android", "ios", "mobile", "renderdragon"],
    edition: "bedrock",
    emoji: "📱",
    badge: "MCPE / Mobile",
    accentColor: "#0ea5e9",
    keywords:
      "mcpe shaders, minecraft pocket edition shaders, android shaders minecraft, ios minecraft shaders, renderdragon shaders mcpe",
  },

  // ── Shaders for Android / MCPE ────────────────────────────────────────────
  "shaders-for-android": {
    title: "Best Minecraft Shaders for Android & iOS (MCPE)",
    h1: "Best Minecraft Pocket Edition Shaders for Android & iOS (2026)",
    intro:
      "Beautiful visuals on mobile — without draining your battery in 10 minutes. These MCPE shaders support RenderDragon, run on mid-range Android phones, and are fully compatible with Minecraft 1.21 Bedrock.",
    description:
      "Best Minecraft shaders for Android and iOS (MCPE). RenderDragon compatible, battery-friendly, and tested on mid-range phones for Minecraft Bedrock 1.21.",
    curseforgeParams: { query: "mcpe shaders renderdragon", category: "shaders", edition: "bedrock" },
    curseforgeParams2: { query: "pe mobile shaders", category: "shaders", edition: "bedrock" },
    tags: ["android", "ios", "mcpe", "mobile", "renderdragon", "pocket edition", "phone shaders"],
    edition: "bedrock",
    emoji: "📲",
    badge: "Android / iOS",
    accentColor: "#14b8a6",
    keywords:
      "minecraft shaders android, mcpe shaders, minecraft pe shaders, renderdragon shaders, ios minecraft shaders, best shaders for phone",
  },

  // ── Medieval Texture Packs ────────────────────────────────────────────────
  "medieval-texture-packs": {
    title: "Best Medieval Minecraft Texture Packs",
    h1: "Best Medieval & Fantasy Minecraft Texture Packs (2026)",
    intro:
      "Turn your world into a kingdom. These medieval resource packs feature hand-crafted stone, wooden beams, detailed armor, and atmospheric ambiance for castle builders and RPG adventurers alike.",
    description:
      "Best medieval and fantasy Minecraft texture packs for Java and Bedrock. Detailed castles, rustic villages, and epic RPG aesthetics — updated for 1.21.",
    curseforgeParams: { query: "medieval fantasy", category: "textures", edition: "java" },
    curseforgeParams2: { query: "medieval kingdom", category: "textures", edition: "bedrock" },
    tags: ["medieval", "fantasy", "castle", "rpg", "kingdom", "rustic", "stone", "village"],
    edition: "java",
    emoji: "🏰",
    badge: "Medieval / Fantasy",
    accentColor: "#a78bfa",
    keywords:
      "medieval minecraft texture pack, fantasy resource pack, castle texture pack minecraft, rpg minecraft pack, medieval 1.21 texture pack",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK SLUG RESOLVER
// Programmatically constructs meta for any slug not pre-configured above.
// Handles unlimited long-tail GSC queries without needing manual entries.
// ─────────────────────────────────────────────────────────────────────────────
function resolveSlugConfig(slug) {
  if (CATEGORY_CONFIG[slug]) return { ...CATEGORY_CONFIG[slug], slug };

  const parts = slug.split("-");

  // Detect edition
  const isJava = parts.includes("java");
  const isBedrock =
    parts.some((p) => ["bedrock", "mcpe", "pe", "android", "ios", "mobile"].includes(p));
  const edition = isBedrock ? "bedrock" : "java";

  // Detect category
  let cfCategory = "mods";
  if (parts.some((p) => ["shaders", "shader"].includes(p))) cfCategory = "shaders";
  else if (parts.some((p) => ["textures", "texture", "pack", "resourcepack", "resource"].includes(p))) cfCategory = "textures";

  // Strip structural keywords to isolate the semantic core
  const STOP_WORDS = new Set([
    "best", "top", "shaders", "shader", "textures", "texture", "mods", "mod",
    "packs", "pack", "for", "and", "the", "a", "in", "of", "java", "bedrock",
    "minecraft", "mcpe", "pe", "2024", "2025", "2026",
  ]);
  const semanticParts = parts.filter((p) => !STOP_WORDS.has(p));
  const query = semanticParts.join(" ").trim() || cfCategory;

  // Build clean human-readable title from slug
  const prettyCore = semanticParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  const categoryLabel =
    cfCategory === "shaders" ? "Shaders" : cfCategory === "textures" ? "Texture Packs" : "Mods";
  const editionLabel = isBedrock ? "Bedrock (MCPE)" : isJava ? "Java Edition" : "Minecraft";

  const title = prettyCore
    ? `Best ${prettyCore} ${categoryLabel} for ${editionLabel}`
    : `Best ${categoryLabel} for ${editionLabel}`;

  return {
    slug,
    title,
    h1: `${title} (2026)`,
    intro: `Looking for the best ${prettyCore.toLowerCase()} ${categoryLabel.toLowerCase()} for ${editionLabel}? We have compiled and tested the highest-rated community resources in our directory. Every entry is verified compatible with Minecraft 1.21 and sourced from CurseForge.`,
    description: `${title} — Find hand-picked, performance-tested ${categoryLabel.toLowerCase()} for ${editionLabel}. Updated for Minecraft 1.21. Download links and detailed reviews included.`,
    curseforgeParams: { query, category: cfCategory, edition },
    curseforgeParams2: null,
    tags: [...semanticParts, cfCategory, edition],
    edition,
    emoji: cfCategory === "shaders" ? "✨" : cfCategory === "textures" ? "🎨" : "🔧",
    badge: categoryLabel,
    accentColor: "#7c3aed",
    keywords: `${slug.replace(/-/g, " ")}, ${prettyCore.toLowerCase()} ${categoryLabel.toLowerCase()}, minecraft ${cfCategory} 2026`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// generateStaticParams — pre-renders all configured slugs at build time
// ─────────────────────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// generateMetadata — fully optimized per-page meta + Open Graph
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cfg = resolveSlugConfig(slug);

  return {
    title: cfg.title,
    description: cfg.description,
    keywords: cfg.keywords,
    alternates: {
      canonical: `https://www.creevoxx.store/category/${slug}`,
    },
    openGraph: {
      title: cfg.h1,
      description: cfg.description,
      url: `https://www.creevoxx.store/category/${slug}`,
      type: "website",
      images: [
        {
          url: "https://www.creevoxx.store/og-default.png",
          width: 1200,
          height: 630,
          alt: cfg.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.title,
      description: cfg.description,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cfg = resolveSlugConfig(slug);

  // ── Data fetching: primary + optional secondary query merged & de-duped ──
  let resources = [];
  try {
    const [primary, secondary] = await Promise.all([
      fetchCurseforgeSearchCached({
        ...cfg.curseforgeParams,
        index: 0,
        pageSize: 20,
        sortField: "6",   // TotalDownloads — highest signal for intent match
        sortOrder: "desc",
      }),
      cfg.curseforgeParams2
        ? fetchCurseforgeSearchCached({
            ...cfg.curseforgeParams2,
            index: 0,
            pageSize: 12,
            sortField: "6",
            sortOrder: "desc",
          })
        : Promise.resolve({ data: [] }),
    ]);

    const primaryData = primary?.data || [];
    const secondaryData = secondary?.data || [];

    // Merge and de-duplicate by resource ID
    const seen = new Set();
    const merged = [...primaryData, ...secondaryData].filter((r) => {
      const id = r.docId || r.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Client-side re-rank: boost resources whose title/description
    // naturally contain the slug's semantic keyword cluster
    const keywordSet = new Set(cfg.tags.map((t) => t.toLowerCase()));
    resources = merged.sort((a, b) => {
      const scoreA = computeRelevanceScore(a, keywordSet);
      const scoreB = computeRelevanceScore(b, keywordSet);
      return scoreB - scoreA;
    });
  } catch (err) {
    console.error(`[category/${slug}] Fetch failed:`, err);
  }

  const relatedSlugs = Object.keys(CATEGORY_CONFIG)
    .filter((s) => s !== slug)
    .slice(0, 4);

  return (
    <main className="category-page-root" style={{ minHeight: "100vh" }}>
      {/* ── JSON-LD Structured Data ───────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: cfg.h1,
            description: cfg.description,
            url: `https://creevoxx.store/category/${slug}`,
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://creevoxx.store/" },
                { "@type": "ListItem", position: 2, name: "Categories", item: "https://creevoxx.store/category/" },
                { "@type": "ListItem", position: 3, name: cfg.title, item: `https://creevoxx.store/category/${slug}` },
              ],
            },
          }),
        }}
      />

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
          borderBottom: "1px solid var(--color-border)",
          padding: "48px 24px 40px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ marginBottom: "20px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}
          >
            <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <Link href="/category/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
              Categories
            </Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "var(--color-accent)" }}>{cfg.title}</span>
          </nav>

          {/* Badge + Emoji */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "2rem" }}>{cfg.emoji}</span>
            <span
              style={{
                background: cfg.accentColor + "22",
                color: cfg.accentColor,
                border: `1px solid ${cfg.accentColor}55`,
                borderRadius: "20px",
                padding: "4px 14px",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {cfg.badge}
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
              fontWeight: 800,
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
              lineHeight: 1.2,
              marginBottom: "18px",
              maxWidth: "900px",
            }}
          >
            {cfg.title}
          </h1>

          {/* Intro paragraph */}
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "780px",
            }}
          >
            {cfg.intro}
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "24px", marginTop: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Resources Found", value: resources.length || "—" },
              { label: "Edition", value: cfg.edition === "bedrock" ? "Bedrock" : "Java" },
              { label: "Updated", value: "2026" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{ fontSize: "1.4rem", fontWeight: 800, color: cfg.accentColor }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resource Grid ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        {resources.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 40px",
              background: "var(--color-surface)",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>
              No resources found for this category right now.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "20px",
                background: "var(--color-accent)",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 24px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Browse All Resources
            </Link>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-muted)",
                marginBottom: "28px",
                fontWeight: 500,
              }}
            >
              Showing {resources.length} curated result{resources.length !== 1 ? "s" : ""} — ranked by downloads &amp; relevance
            </h2>

            {/* 
              Responsive grid: 1 col mobile → 2 col sm → 4 col lg
              Uses the project's existing CSS variables for theming.
            */}
            <div
              className="resources-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: "20px",
              }}
            >
              {resources.map((item, idx) => (
                <ResourceCard
                  key={item.docId || item.id || idx}
                  resource={item}
                  priority={idx < 4} // LCP boost: eager-load first row images
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Related Categories (Internal Linking for SEO) ─────────────────── */}
      {relatedSlugs.length > 0 && (
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px 60px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "20px",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "36px",
            }}
          >
            Related Categories
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {relatedSlugs.map((s) => {
              const related = CATEGORY_CONFIG[s];
              return (
                <Link
                  key={s}
                  href={`/category/${s}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    textDecoration: "none",
                    color: "var(--color-text)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                >
                  <span>{related.emoji}</span>
                  <span>{related.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELEVANCE SCORER
// Boosts resources whose title/description overlap with the category's
// keyword cluster so the grid naturally surfaces the best matches first.
// ─────────────────────────────────────────────────────────────────────────────
function computeRelevanceScore(resource, keywordSet) {
  const haystack = [
    resource.title || "",
    resource.description || "",
    ...(resource.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const kw of keywordSet) {
    if (haystack.includes(kw)) score += 1;
  }
  // Normalize by download count so popular resources break ties naturally
  score += Math.log10((resource.download_count || 1) + 1) * 0.1;
  return score;
}
