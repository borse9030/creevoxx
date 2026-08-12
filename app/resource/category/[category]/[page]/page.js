import React from "react";
import ResourceCard from "@/components/ResourceCard";
import AdCard from "@/components/AdCard";
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";
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

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedParams.category || "all";
  const pageNum = parseInt(resolvedParams.page || "1", 10);
  
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  // Check for any active query-string filters
  const q = resolvedSearchParams?.q || "";
  const device = resolvedSearchParams?.device || "";
  const version = resolvedSearchParams?.version || "";
  const sort = resolvedSearchParams?.sort || "";
  const edition = resolvedSearchParams?.edition || "";
  const hasFilters = !!(q || device || version || edition || (sort && sort !== "downloads"));

  // Page 1 with no filters = indexable canonical category view.
  // Everything else = navigation aid, noindex.
  const isFiltered = hasFilters || pageNum > 1;

  return {
    title: `Best Minecraft ${categoryTitle} — Page ${pageNum} | Creevoxx`,
    description: `Browse the top manually-tested and optimized Minecraft ${categoryTitle} for Minecraft 1.21.4. Page ${pageNum} of curated ${categoryTitle.toLowerCase()} with Fabric/Forge support.`,
    alternates: {
      canonical: `https://www.creevoxx.store/resource/category/${category}/1`,
    },
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function CategoryPaginationPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const defaultEdition = "all";

  const category = resolvedParams.category || "all";
  const currentPage = parseInt(resolvedParams.page || "1", 10);

  const q = resolvedSearchParams.q || "";
  const device = resolvedSearchParams.device || "all";
  const edition = resolvedSearchParams.edition || defaultEdition;
  const version = resolvedSearchParams.version || "";
  const sort = resolvedSearchParams.sort || "downloads";

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
    searchData = await fetchCurseforgeSearchCached({
      query: q,
      category: category === "all" ? undefined : category,
      device,
      index: indexOffset,
      pageSize: 24,
      sortField,
      sortOrder,
      edition,
      version,
    });
  } catch (err) {
    console.error("Error executing category pagination CurseForge search:", err);
  }

  let resources = searchData.data || [];



  const totalItems = searchData.pagination?.totalCount || resources.length;
  const totalPages = Math.min(Math.ceil(totalItems / 24), 400);
  const stats = searchData.counts || { total: 0, shaders: 0, textures: 0, mods: 0 };

  return (
    <>
      {/* Hero Section */}
      <HeroSectionClient>
        <div className="hero__eyebrow">
          <Image src="/logo.png" alt="Creevoxx Logo" width={18} height={18} style={{ objectFit: "contain" }} unoptimized={true} />
          <span>Programmatic Catalog Discovery</span>
        </div>
        <h1 className="hero__title" id="hero-title">
          Minecraft {category.charAt(0).toUpperCase() + category.slice(1)} Library
        </h1>
        <p className="hero__subtitle" style={{ maxWidth: "800px", margin: "0 auto 24px auto" }}>
          Welcome to Creevoxx MC Mods! Explore our paginated catalog of mods, shaders, and textures. Everything is manually tested to optimize performance and frame-rates in Minecraft.
        </p>

        {/* Dynamic Stats */}
        <div className="hero__stats" role="list" aria-label="Resource statistics">
          <div className="hero__stat" role="listitem">
            <span className="hero__stat-num">
              {stats.total ? `${stats.total.toLocaleString()}+` : "10,000+"}
            </span>
            <span className="hero__stat-label">Total Resources</span>
          </div>
          <div className="hero__stat" role="listitem">
            <span className="hero__stat-num">
              {stats.shaders ? `${stats.shaders.toLocaleString()}+` : "10,000+"}
            </span>
            <span className="hero__stat-label">Shader Packs</span>
          </div>
          <div className="hero__stat" role="listitem">
            <span className="hero__stat-num">
              {stats.textures ? `${stats.textures.toLocaleString()}+` : "10,000+"}
            </span>
            <span className="hero__stat-label">Texture Packs</span>
          </div>
          <div className="hero__stat" role="listitem">
            <span className="hero__stat-num">
              {stats.mods ? `${stats.mods.toLocaleString()}+` : "10,000+"}
            </span>
            <span className="hero__stat-label">Mods</span>
          </div>
        </div>
      </HeroSectionClient>

      {/* Main filters bar */}
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
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total resources)
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="main-layout">
        <FilterSidebarUrl />

        <section aria-label="Resource grid">
          {resources.length === 0 && (
            <div className="resource-grid">
              <div className="grid-empty" role="alert">
                <span className="grid-empty__icon">🔍</span>
                <p className="grid-empty__title">No matches found</p>
                <p>No resources found on this page. Try changing filters or returning to page 1.</p>
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div className="resource-grid" role="list" aria-label="Resources list">
              {resources.map((resource, index) => (
                <React.Fragment key={resource.docId || resource.id}>
                  <div role="listitem">
                    <ResourceCard resource={resource} searchQuery={q} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {resources.length > 0 && (
            <div style={{ marginTop: "24px", marginBottom: "24px", width: "100%" }}>
            </div>
          )}

          {/* Pagination */}
          <PaginationUrl totalPages={totalPages} />
        </section>
      </div>

      <footer className="footer" aria-labelledby="footer-title">
        <div className="footer__grid">
          <div className="footer__brand">
            <Image src="/logo.png" alt="Creevoxx Logo" width={28} height={28} style={{ objectFit: "contain" }} unoptimized={true} />
            <div>
              <h2 className="footer__title" id="footer-title">Creevoxx</h2>
              <p className="footer__tagline">Curated shaders, textures, mods and community content in one dark, crafted hub.</p>
            </div>
          </div>

          <div className="footer__links">
            <p className="footer__section-label">Quick Links</p>
            <ul className="footer__list">
              <li><Link href="/">Home</Link></li>
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
            <p className="footer__section-label">Community</p>
            <ul className="footer__list">
              <li><a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              <li><a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>

          <div className="footer__meta">
            <p>Curated Minecraft resource discovery with a dark, crafted interface for fans and creators.</p>
            <div className="footer__badge">Independent Minecraft fan hub</div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Creevoxx. All rights reserved.</p>
          <p>Designed for Minecraft explorers, builders, and shader fans.</p>
        </div>
      </footer>
    </>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache pages on CDN for 1 hour
