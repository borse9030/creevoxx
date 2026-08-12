// Next.js Home Page — Desktop & Mobile Layout
import React from "react";
import ResourceCard from "@/components/ResourceCard";
import AdCard from "@/components/AdCard";
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";
import LiveStatsClient from "@/components/LiveStatsClient";
import {
  CategoryTabsUrl,
  DeviceTabsUrl,
  EditionSelectorUrl,
  SearchInputUrl,
  FilterSidebarUrl,
  PaginationUrl,
} from "@/components/HomeControls";
import Link from "next/link";
import Image from "next/image";
import HeroSectionClient from "@/components/HeroSectionClient";
import MobileHero from "@/components/MobileHero";
import DesktopPopularCollections from "@/components/DesktopPopularCollections";
import PlayStoreBadge from "@/components/PlayStoreBadge";




export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams?.page || "1", 10);
  const q = resolvedParams?.q || "";
  const category = resolvedParams?.category || "";
  const device = resolvedParams?.device || "";
  const version = resolvedParams?.version || "";
  const sort = resolvedParams?.sort || "";
  const edition = resolvedParams?.edition || "";

  // Any active filter (except category) or pagination beyond page 1 = navigation aid, not indexable
  const hasFilters = !!(q || device || version || edition || (sort && sort !== "downloads"));
  const isFiltered = hasFilters || page > 1;

  const canonicalUrl = category 
    ? `https://www.creevoxx.dev/?category=${category}` 
    : "https://www.creevoxx.dev/";

  let dynamicTitle = "Creevoxx — Best Minecraft Shaders, Texture Packs & Mods";
  if (category === "shaders") dynamicTitle = "Best Minecraft Shaders | Creevoxx";
  else if (category === "textures") dynamicTitle = "Best Minecraft Texture Packs | Creevoxx";
  else if (category === "mods") dynamicTitle = "Best Minecraft Mods | Creevoxx";
  if (q) dynamicTitle = `Search Results for "${q}" | Creevoxx`;

  return {
    title: dynamicTitle,
    description: "Discover the best Minecraft shaders, texture packs, and mods for Java, Bedrock, and MCPE. Featuring low-end shaders, RTX packs, PvP texture packs, and top mods for Minecraft 1.21. Curated links to CurseForge.",
    keywords: "minecraft shaders, minecraft mods, minecraft texture packs, minecraft resource packs, low end shaders, RTX texture packs, PvP texture packs, BSL shaders, Sodium, Bedrock mods, MCPE shaders, minecraft 1.21",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function HomePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const defaultEdition = "all";

  const q = resolvedParams.q || "";
  // When searching, don't restrict to a category — search across all categories.
  // Only default to "shaders" on the homepage with no active search query.
  const category = resolvedParams.category || (q ? "all" : "shaders");
  const device = resolvedParams.device || "all";
  const edition = resolvedParams.edition || defaultEdition;
  const version = resolvedParams.version || "";
  const sort = resolvedParams.sort || "downloads";
  const currentPage = parseInt(resolvedParams.page || "1", 10);

  // Map sort option value to CurseForge sortField API code
  const sortFieldMap = {
    newest: "3", // LastUpdated
    oldest: "3", // LastUpdated (with asc)
    alpha: "4",  // Name
    downloads: "6" // Popular
  };
  const sortField = sortFieldMap[sort] || "6";
  const sortOrder = sort === "oldest" || sort === "alpha" ? "asc" : "desc";
  const indexOffset = (currentPage - 1) * 24;

  let searchData = { data: [], pagination: { totalCount: 0 }, counts: { total: 0, shaders: 0, textures: 0, mods: 0 } };

  try {
    // getLiveStats() has been moved to /api/stats (edge-cached) and is now fetched
    // client-side by LiveStatsClient — removing it from the SSR critical path.
    searchData = await fetchCurseforgeSearchCached({
      query: q,
      category,
      device,
      index: indexOffset,
      pageSize: 24,
      sortField,
      sortOrder,
      edition,
      version,
    });
  } catch (err) {
    console.error("Error executing server-side CurseForge search:", err);
  }

  let resources = searchData.data || [];



  const totalItems = searchData.pagination?.totalCount || resources.length;
  const totalPages = Math.min(Math.ceil(totalItems / 24), 400);
  // searchData.counts comes from seed/Redis (fast, always available).
  // LiveStatsClient will upgrade these to real live API counts asynchronously.
  const initialStats = searchData.counts || null;

  return (
    <>
      {/* --- Mobile Layout ------------------------------------ */}
      <MobileHero stats={initialStats} />

      <div className="desktop-hero-container">
        {/* --- Hero Section ------------------------------------ */}
        <HeroSectionClient>
          <div className="hero__eyebrow">
            <span>⚡</span>
            <span>Hand-Tested &amp; FPS-Optimized Minecraft Hub</span>
          </div>
          <h1 className="hero__title" id="hero-title">
            Discover Next-Level<br />Minecraft Shaders &amp; Mods
          </h1>
          <p className="hero__subtitle" style={{ maxWidth: "800px", margin: "0 auto 20px auto" }}>
            Welcome to Creevoxx MC Mods! Our curation team manually tests every shader, resource pack, and mod on this page to ensure full compatibility with Minecraft 1.21+ and maximum frame-rate optimization. Explore our hand-picked collection below.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <PlayStoreBadge />
          </div>

        {/* Stats — fetched client-side via /api/stats (edge-cached) */}
        <LiveStatsClient initialStats={initialStats} />
      </HeroSectionClient>

      {/* --- Category Tabs + Search --------------------------- */}
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px" }}>
        <div className="filter-header-wrap" style={{ flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "16px" }}>
            <CategoryTabsUrl />
            <EditionSelectorUrl defaultEdition={defaultEdition} />
          </div>
          <DeviceTabsUrl />
        </div>

        <div className="grid-controls">
          <SearchInputUrl />
          <p className="grid-count" aria-live="polite" aria-atomic="true">
            {q.trim() ? (
              <>
                Found <strong>{totalItems}</strong> matching resources
              </>
            ) : (
              <>
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total resources)
              </>
            )}
          </p>
        </div>
      </div>
      </div>
      <div className="desktop-home-container">
        {/* Top Homepage Leaderboard Ad */}
        <div style={{ maxWidth: "1440px", margin: "24px auto 20px auto", padding: "0 24px" }}>
        </div>

        {/* --- Main Grid Layout (Sidebar + Cards) -------------- */}
        <div className="main-layout">
          {/* Sidebar */}
          <FilterSidebarUrl />

          {/* Resource Grid */}
          <section aria-labelledby="resource-grid-title">
            <h2 id="resource-grid-title" className="sr-only">Latest Resources</h2>
            {resources.length === 0 && (
              <div className="resource-grid">
                <div className="grid-empty" role="alert">
                  <span className="grid-empty__icon">🔍</span>
                  <p className="grid-empty__title">No matches found</p>
                  <p>We couldn't find any resources matching your current filters. Try relaxing your filters or typing a different search query.</p>
                </div>
              </div>
            )}

            {resources.length > 0 && (
              <div className="resource-grid">
                {resources.map((resource, index) => (
                  <React.Fragment key={resource.docId || resource.id || index}>
                    <ResourceCard resource={resource} searchQuery={q} priority={index < 4} />
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Bottom Horizontal Ad banner below resource cards */}
            {resources.length > 0 && (
              <div style={{ marginTop: "24px", marginBottom: "24px", width: "100%" }}>
              </div>
            )}

            {/* Pagination */}
            <PaginationUrl totalPages={totalPages} />
          </section>
        </div>

        {/* -- Full-Width Desktop Popular Collections Section (Right Above Footer) -- */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <DesktopPopularCollections />
        </div>

        <footer className="footer" aria-labelledby="footer-title">
          {/* -- Android App Promotional Banner -- */}
          <div className="footer__app-banner">
            <div className="footer__app-info">
              <span className="footer__app-pill">📱 OFFICIAL MOBILE APP</span>
              <h3 className="footer__app-title">Get the Android App — Free on Play Store</h3>
              <p className="footer__app-sub">Download hand-tested shaders, texture packs &amp; mods directly to your Android device with 1-click install links.</p>
            </div>
            <PlayStoreBadge />
          </div>

          <div className="footer__grid">
            <div className="footer__brand">
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Image src="/logo.png" alt="Creevoxx Logo" width={48} height={48} style={{ objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(16, 185, 129, 0.4))" }} unoptimized={true} />
              </div>
              <div>
                <h2 className="footer__title" id="footer-title" style={{ fontSize: "1.35rem", fontWeight: 900, color: "#fff" }}>Creevoxx<span style={{ color: "#10b981" }}>MCMods</span></h2>
                <p className="footer__tagline">Curated shaders, textures, mods and community content in one dark, crafted hub.</p>
              </div>
            </div>

            <div className="footer__links">
              <p className="footer__section-label">Quick Links</p>
              <ul className="footer__list">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/saved">Saved Library</Link></li>
                <li><Link href="/guides">Guides &amp; Installation</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/sponsor">Sponsor & Partner</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms &amp; Conditions</Link></li>
                <li><Link href="/disclaimer">Disclaimer</Link></li>
              </ul>
            </div>

            <div className="footer__links">
              <p className="footer__section-label">Community &amp; App</p>
              <ul className="footer__list" style={{ gap: "10px" }}>
                <li>
                  <a href="https://play.google.com/store/apps/details?id=com.creevoxx.creevoxx" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3.609 1.814C3.256 2.188 3.05 2.766 3.05 3.518v16.964c0 .752.206 1.33.559 1.704l.09.084 9.502-9.502v-.224L3.699 1.73l-.09.084z" fill="#00D2FF"/><path d="M16.368 15.711l-3.167-3.167v-.224l3.167-3.167.071.04 3.754 2.134c1.072.609 1.072 1.606 0 2.217l-3.754 2.134-.071.033z" fill="#FFD500"/><path d="M13.272 12.32l-3.071-3.071L3.609 1.814c.356-.376.953-.594 1.666-.188l11.093 6.302-3.096 4.392z" fill="#00F076"/><path d="M13.272 11.68l3.096 4.392-11.093 6.302c-.713.406-1.31.188-1.666-.188l6.592-7.435 3.071-3.071z" fill="#FF3A44"/></svg>
                    <span>Get Android App</span>
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <span>YouTube Channel</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    <span>Instagram Community</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer__meta">
              <p>Curated Minecraft resource discovery with a dark, crafted interface for fans and creators.</p>
              <div className="footer__badge">Independent Minecraft fan hub</div>
            </div>
          </div>

          <div className="footer__bottom">
            <p suppressHydrationWarning>© {new Date().getFullYear()} Creevoxx. All rights reserved.</p>
            <p>Designed for Minecraft explorers, builders, and shader fans.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
