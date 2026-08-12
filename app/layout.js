import "./globals.css";
import "./mobile-app.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import NavigationLoader from "@/components/NavigationLoader";
import MobileInnerNav from "@/components/MobileInnerNav";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import MonetagController from "@/components/MonetagController";

export const metadata = {
  metadataBase: new URL("https://www.creevoxx.dev"),
  title: {
    default: "Creevoxx - Best Minecraft Shaders, Textures & Mods",
    template: "%s | Creevoxx",
  },
  description:
    "Discover the best Minecraft shaders, texture packs, and mods for Java and Bedrock. Optimize your performance with curated, tested assets.",
  keywords:
    "minecraft shaders, minecraft mods, minecraft texture packs, minecraft resource packs, BSL shaders, Sodium, Create mod",
  alternates: {
    canonical: "https://www.creevoxx.dev",
  },
  openGraph: {
    title: "Creevoxx — Minecraft Shaders, Texture Packs & Mods",
    description: "The ultimate curated Minecraft resource hub.",
    type: "website",
    url: "https://www.creevoxx.dev",
    images: [
      {
        url: "https://www.creevoxx.dev/og-default.png",
        width: 1200,
        height: 630,
        alt: "Creevoxx — Best Minecraft Shaders, Texture Packs & Mods",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creevoxx - Best Minecraft Shaders, Textures & Mods",
    description: "Discover the best Minecraft shaders, texture packs, and mods for Java and Bedrock. Optimize your performance with curated, tested assets.",
    images: ["https://www.creevoxx.dev/og-default.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content="0RTOjPLkXdkNGYWxUJbtRUaGGVTjRiTSpp0qC3a_s2A" />
        <meta name="monetag" content="5ddf371e48bead55fa5c8387469099e0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Creevoxx",
              "url": "https://www.creevoxx.dev/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.creevoxx.dev/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-GQE0EPRPC2"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GQE0EPRPC2', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* AdSense script moved to <Script> with afterInteractive — never blocks LCP */}
      </head>
      <body>
        <NavigationLoader />
        <Navbar />
        <MobileInnerNav />
        <main className="page-wrapper">{children}</main>
        <MonetagController />
        <footer className="footer" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "40px", paddingBottom: "40px" }}>
          {/* Popular Collections Grid */}
          <div style={{ maxWidth: "1200px", margin: "0 auto 32px auto", padding: "0 16px", textAlign: "left" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-accent)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Popular Collections
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ color: "var(--color-text)", marginBottom: "4px" }}>📱 Performance Hub</strong>
                <Link href="/best/shaders-low-end" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Best Low-End Shaders</Link>
                <Link href="/best/performance-mods-mcpe" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>MCPE Performance Mods</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ color: "var(--color-text)", marginBottom: "4px" }}>✨ Realism &amp; RTX</strong>
                <Link href="/best/realistic-shaders" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Realistic RTX Shaders</Link>
                <Link href="/best/rtx-texture-packs" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>RTX Texture Packs for MCPE</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ color: "var(--color-text)", marginBottom: "4px" }}>🤖 Platform Compatibility</strong>
                <Link href="/best/mcpe-shaders-1-21" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Minecraft PE Shaders 1.21</Link>
                <Link href="/best/shaders-for-android" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Shaders for Android &amp; iOS</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ color: "var(--color-text)", marginBottom: "4px" }}>⚔️ Gameplay Vibe</strong>
                <Link href="/best/pvp-texture-packs" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Top PvP Texture Packs</Link>
                <Link href="/best/medieval-texture-packs" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Medieval Texture Packs</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ color: "var(--color-text)", marginBottom: "4px" }}>🤝 Community &amp; Socials</strong>
                <a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>YouTube</a>
                <a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Instagram</a>
              </div>
            </div>
          </div>

          {/* Get the App banner */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <a
              href="https://play.google.com/store/apps/details?id=com.creevoxx.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "100px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                letterSpacing: "0.02em",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 20.5L14.5 12 3 3.5V20.5ZM16.5 12L21 9.3l-4.5-2.7V12ZM16.5 12v5.4L21 14.7 16.5 12Z" fill="white"/>
              </svg>
              Get the Android App — Free on Play Store
            </a>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", opacity: 0.8 }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <Link href="/guides" style={{ color: "inherit", textDecoration: "none" }}>Guides</Link>
            <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>About Us</Link>
            <Link href="/sponsor" style={{ color: "inherit", textDecoration: "none" }}>Sponsor &amp; Partner</Link>
            <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms &amp; Conditions</Link>
            <Link href="/disclaimer" style={{ color: "inherit", textDecoration: "none" }}>Disclaimer</Link>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
