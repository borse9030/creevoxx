import Link from "next/link";

export const metadata = {
  title: "Browse Minecraft Resource Categories",
  description:
    "Browse all Minecraft resource categories — shaders for low-end PCs, Bedrock performance mods, PvP texture packs, RTX packs, and more. Updated for 1.21.",
  alternates: {
    canonical: "https://www.creevoxx.dev/category/",
  },
};

const CATEGORIES = [
  {
    slug: "low-end-shaders",
    emoji: "💻",
    title: "Best Shaders for Low End PCs & Laptops",
    badge: "Low-End Friendly",
    accentColor: "#f59e0b",
    desc: "60 FPS on budget hardware — tested and verified.",
  },
  {
    slug: "bedrock-performance",
    emoji: "📱",
    title: "Bedrock Performance Mods (MCPE / Mobile)",
    badge: "Bedrock / MCPE",
    accentColor: "#22c55e",
    desc: "Fix lag on Android, iOS, and Windows Bedrock Edition.",
  },
  {
    slug: "java-performance-mods",
    emoji: "⚡",
    title: "Java Performance Mods (Sodium & More)",
    badge: "Java Edition",
    accentColor: "#6366f1",
    desc: "Maximize FPS with the definitive Java optimization stack.",
  },
  {
    slug: "pvp-texture-packs",
    emoji: "⚔️",
    title: "PvP Texture Packs for Bedwars & SkyWars",
    badge: "PvP / Competitive",
    accentColor: "#ef4444",
    desc: "Low fire, short swords, clean UI — win more fights.",
  },
  {
    slug: "rtx-texture-packs",
    emoji: "🎮",
    title: "RTX & Photorealistic Texture Packs",
    badge: "RTX / High-End",
    accentColor: "#ec4899",
    desc: "PBR ray-tracing graphics for high-end hardware.",
  },
  {
    slug: "shaders-for-android",
    emoji: "📲",
    title: "Shaders for Android & iOS (MCPE)",
    badge: "Mobile",
    accentColor: "#14b8a6",
    desc: "RenderDragon compatible, battery-friendly mobile shaders.",
  },
  {
    slug: "medieval-texture-packs",
    emoji: "🏰",
    title: "Medieval & Fantasy Texture Packs",
    badge: "Medieval / Fantasy",
    accentColor: "#a78bfa",
    desc: "Castles, RPG villages, and rustic hand-crafted aesthetics.",
  },
];

export default function CategoryIndexPage() {
  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <h1
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          fontWeight: 800,
          color: "var(--color-text)",
          fontFamily: "var(--font-heading)",
          marginBottom: "12px",
        }}
      >
        Browse Minecraft Categories
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "1.05rem",
          marginBottom: "40px",
          maxWidth: "640px",
          lineHeight: 1.6,
        }}
      >
        Hand-curated resource collections for every Minecraft player — Java, Bedrock, low-end
        hardware, PvP, and beyond. Updated for 1.21.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "14px",
                padding: "24px",
                transition: "border-color 0.2s, transform 0.15s",
                cursor: "pointer",
              }}

            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>{cat.emoji}</span>
                <span
                  style={{
                    background: cat.accentColor + "22",
                    color: cat.accentColor,
                    border: `1px solid ${cat.accentColor}55`,
                    borderRadius: "20px",
                    padding: "3px 12px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {cat.badge}
                </span>
              </div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {cat.title}
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                {cat.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
