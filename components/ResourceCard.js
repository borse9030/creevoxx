"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { damerauLevenshtein, normalizeText } from "@/lib/fuzzySearch";
import { SEO_WHITELIST_SET } from "@/lib/seoWhitelist";

const EDITORS_TAKES = {
  "jei": "Essential recipe reference; zero frame impact.",
  "just-enough-items": "Essential recipe reference; zero frame impact.",
  "jei-just-enough-items": "Essential recipe reference; zero frame impact.",
  "journeymap": "Best real-time minimap; minor memory overhead.",
  "create": "Incredibly detailed technology; complex automation.",
  "create-mod": "Incredibly detailed technology; complex automation.",
  "appleskin": "Indispensable HUD upgrade; highly lightweight.",
  "storage-drawers": "Excellent visual storage solution; space saver.",
  "torohealth-damage-indicators": "Reliable damage indicators; perfect for RPG play.",
  "bsl-shaders": "Stunning water physics and soft bloom; heavy on GPU.",
  "complementary-reimagined": "Gorgeous, accurate visual style with great optimization.",
  "seus-renewed": "Ultra-realistic cinematic lighting; highly demanding.",
  "iris-shaders-mod": "Top-tier graphics performance; highly recommended.",
  "sodium": "Essential optimization; massive FPS gains.",
  "litematica": "Perfect blueprint tool for schematic building.",
  "fresh-animations": "Transforms default mob animations beautifully.",
  "vanilla-tweaks": "Excellent compilation of subtle vanilla enhancements.",
  "stay-true": "Hand-painted aesthetic that upgrades vanilla beautifully.",
  "xalis-bushy-leaves": "Makes tree canopies lush and dense."
};

function getEditorsTake(resource) {
  const slug = resource.docId || resource.id || "";
  const cleanSlug = slug.toLowerCase();
  
  if (EDITORS_TAKES[cleanSlug]) {
    return EDITORS_TAKES[cleanSlug];
  }
  
  for (const [key, val] of Object.entries(EDITORS_TAKES)) {
    if (cleanSlug.includes(key)) {
      return val;
    }
  }

  if (resource.category === "shaders") {
    return "Stunning volumetric lighting effects, recommended for medium to high-end PCs.";
  }
  if (resource.category === "textures") {
    return "High fidelity resource pack, excellent addition to improve default graphics.";
  }
  return "Tested and verified compatible with Minecraft 1.21+.";
}

const CATEGORY_LABELS = {
  mods: "Mods",
  textures: "Textures",
  shaders: "Shaders",
  maps: "Maps",
  skins: "Skins",
};

const CATEGORY_ICONS = {
  mods: "🔧",
  textures: "🎨",
  shaders: "✨",
  maps: "🗺️",
  skins: "👤",
};

function formatCardDownloads(count) {
  if (count === null || count === undefined || count === 0) return "0";
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}

function highlightText(text, query) {
  if (!text) return text;
  if (!query || !query.trim()) return text;

  const queryNormalized = normalizeText(query);
  if (!queryNormalized) return text;

  const queryTokens = queryNormalized.split(" ");
  const wordsAndSpaces = text.split(/(\s+)/);

  return wordsAndSpaces.map((part, index) => {
    if (/^\s+$/.test(part)) return part;

    const cleanWord = part.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleanWord) return part;

    let isMatched = false;

    for (const token of queryTokens) {
      if (cleanWord === token) {
        isMatched = true;
        break;
      }
      if (cleanWord.includes(token)) {
        isMatched = true;
        break;
      }

      // Fuzzy check (typo tolerance)
      if (Math.abs(cleanWord.length - token.length) <= 2) {
        const d = damerauLevenshtein(token, cleanWord);
        let threshold = 0;
        if (token.length === 3) threshold = 1;
        else if (token.length <= 6) threshold = 2;
        else threshold = 3;

        if (d <= threshold) {
          isMatched = true;
          break;
        }
      }
    }

    if (isMatched) {
      return (
        <span key={index} className="cf-search-highlight">
          {part}
        </span>
      );
    }

    return part;
  });
}

function formatCardDate(dateString) {
  if (!dateString) return "Jun 20, 26";
  try {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  } catch (e) {
    return "Jun 20, 26";
  }
}

export default function ResourceCard({ resource, searchQuery = "", priority = false }) {
  if (!resource) return null;
  const { docId, id, title, category, thumbnail_url, author, download_count, description, version, tags, dateModified } = resource;

  const validId = docId || id;
  if (!validId) return null;

  const isWhitelisted = SEO_WHITELIST_SET.has(Number(validId));

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarked = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
    setIsBookmarked(bookmarked.some((item) => item.docId === validId));
  }, [validId]);

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    // Defer blocking localStorage operations to macro-task
    setTimeout(() => {
      try {
        const bookmarked = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
        let updated;
        if (!nextState) {
          updated = bookmarked.filter((item) => item.docId !== validId);
        } else {
          if (!bookmarked.some((item) => item.docId === validId)) {
            updated = [...bookmarked, { docId: validId, title, category, author, thumbnail_url }];
          } else {
            updated = bookmarked;
          }
        }
        localStorage.setItem("creevoxx_mc_bookmarks", JSON.stringify(updated));
        window.dispatchEvent(new Event("creevoxx_bookmarks_updated"));
      } catch (err) {
        console.warn("Bookmark save failed:", err);
      }
    }, 0);
  };

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryIcon = CATEGORY_ICONS[category] || "📦";
  const formattedDownloads = formatCardDownloads(download_count || 0);

  const formattedDate = dateModified ? formatCardDate(dateModified) : "Jun 20, 26";
  const displayTags = tags && tags.length > 0
    ? tags
    : (category === "shaders" ? ["Shaders"] : category === "textures" ? ["Textures"] : ["API And Library"]);

  // Extract primary version for mobile display (e.g. "1.16.x - 1.21.x" -> "1.21")
  const primaryVersion = (() => {
    if (!version) return "1.21";
    const matches = version.match(/1\.\d+/g);
    if (matches && matches.length > 0) {
      return matches[matches.length - 1];
    }
    return version;
  })();

  const cardIntros = [
    ` Explore this amazing Minecraft ${categoryLabel.toLowerCase()} created by ${author || "creator"} for version ${version || "1.21"}.`,
    ` Learn how to install this top-rated ${categoryLabel.toLowerCase()} project by ${author || "its author"} on Minecraft ${version || "1.21"}.`,
    ` Check out the latest features of this ${categoryLabel.toLowerCase()} modpack/addon designed by ${author || "creator"}.`
  ];
  const cardHash = title ? title.length % 3 : 0;
  // For whitelisted cards, omit templated suffix — real description stands alone.
  // For non-whitelisted cards (noindexed anyway), keep the filler.
  const suffix = isWhitelisted ? "" : cardIntros[cardHash];

  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/resource/${validId}`}
      className="resource-card"
      data-category={category}
      aria-label={`View details for ${title}`}
      prefetch={false}
      scroll={true}
      {...(!isWhitelisted ? { rel: "nofollow" } : {})}
    >
      {/* -- Mobile UI (matches mhcard) -- */}
      <div className="resource-card-mobile-layout">
        {thumbnail_url && !imgError ? (
          <Image
            src={thumbnail_url}
            alt={`${title} for Minecraft ${version || "1.21"} — ${categoryLabel} screenshot`}
            className="mhcard-img"
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: "cover" }}
            loading={priority ? "eager" : "lazy"}
            unoptimized={true}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="mhcard-img-fallback">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m9 9 6 6M15 9l-6 6" />
            </svg>
          </div>
        )}
        {/* Top Left: Heart Save Button */}
        <button
          className={`mhcard-save-btn${isBookmarked ? " mhcard-save-btn--saved" : ""}`}
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark resource"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isBookmarked ? "#ef4444" : "none"}
            stroke={isBookmarked ? "#ef4444" : "rgba(255,255,255,0.85)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <div className="mhcard-top-right">
          {(download_count || 0) > 0 && (
            <span className="mhcard-dl-chip">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              {formatCardDownloads(download_count)}
            </span>
          )}
        </div>
        <div className="mhcard-overlay" />
        <div className="mhcard-info">
          <p className="mhcard-title">{title}</p>
          <div className="mhcard-meta">
            <p className="mhcard-author">{author || "creator"}</p>
            <button className="mhcard-get" onClick={(e) => e.preventDefault()} aria-label={`Get ${title}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Get
            </button>
          </div>
        </div>
      </div>

      {/* -- Desktop UI -- */}
      <div className="resource-card-desktop-layout">
        {/* -- Thumbnail wrapper */}
        <div className="resource-card__thumb-wrap">
          {thumbnail_url && !imgError ? (
            <Image
              src={thumbnail_url}
              alt={`${title} for Minecraft ${version || "1.21"} — ${categoryLabel} screenshot`}
              className="resource-card__thumb"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: "cover" }}
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              unoptimized={true}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="resource-card__thumb-placeholder">
              <span>{categoryIcon}</span>
            </div>
          )}

          {/* -- Category cross badge — top-left of image (desktop) or card (mobile) */}
          <span className={`resource-card__cat-badge resource-card__cat-badge--${category}`}>
            {categoryLabel}
          </span>

          {/* -- Version badge — bottom-left of image (desktop) or card (mobile) */}
          {version && (
            <div className="resource-card__version-badge">
              <span className="desktop-version">{version}</span>
              <span className="mobile-version">{primaryVersion}</span>
            </div>
          )}

          <div className="resource-card__hover-download" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </div>

      {/* -- Card body */}
      <div className="resource-card__body">
        <div className="resource-card__top-row">
          <h3 className="resource-card__title" title={title}>
            {highlightText(title, searchQuery)}
          </h3>
          {/* Bookmark button — desktop only inside body */}
          <button
            type="button"
            className={`resource-card__bookmark-btn ${isBookmarked ? "resource-card__bookmark-btn--active" : ""}`}
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark resource"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </div>

        <p className="resource-card__author">
          By {highlightText(author || "creator", searchQuery)}
        </p>

        <p className="resource-card__description">
          {description
            ? description.replace(/\s+/g, " ").trim()
            : "No description available."}
          {suffix}
        </p>

        <div className="editors-take-container" style={{
          marginTop: "10px",
          marginBottom: "10px",
          padding: "8px 12px",
          background: "rgba(16, 185, 129, 0.08)",
          borderLeft: "3px solid var(--color-accent)",
          borderRadius: "4px"
        }}>
          <p style={{
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
            margin: 0,
            lineHeight: "1.4"
          }}>{getEditorsTake(resource)}</p>
        </div>

        {/* -- Mobile-only mini meta: downloads + date below description */}
        <div className="resource-card__mobile-meta">
          <span className="resource-card__mobile-meta-dl">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {formattedDownloads}
          </span>
          <span className="resource-card__mobile-meta-sep">·</span>
          <span className="resource-card__mobile-meta-date" suppressHydrationWarning>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formattedDate}
          </span>
        </div>

        {/* -- Desktop footer (version + tags + downloads + date) */}
        <div className="resource-card__footer">
          <span className="resource-card__version-info">
            Version: {version || "1.21"}
          </span>
          <div className="resource-card__tags">
            {displayTags.slice(0, 1).map((t, idx) => (
              <span key={idx} className="resource-card__tag">{t}</span>
            ))}
            {displayTags.length > 1 && (
              <span className="resource-card__tag-more">+{displayTags.length - 1}</span>
            )}
          </div>
          <span className="resource-card__downloads">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="resource-card__download-icon"
              style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="desktop-downloads-label" itemProp="downloadCount" suppressHydrationWarning>{(download_count || 0).toLocaleString()} downloads</span>
            <span className="mobile-downloads-label" suppressHydrationWarning>{formattedDownloads}</span>
          </span>
          <span className="resource-card__date" suppressHydrationWarning>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="resource-card__date-icon"
              style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </div>
      </div>
    </Link>
  );
}

