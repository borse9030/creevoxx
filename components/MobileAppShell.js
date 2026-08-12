"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileBottomDock from "./MobileBottomDock";
import { usePathname } from "next/navigation";
import PlayStoreBadge from "./PlayStoreBadge";

/* --- Vector SVG Icons for Filters & Collections --------- */
const SVG_ICONS = {
  zap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  sparkles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  palette: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.42-.16-.81-.43-1.12-.27-.31-.43-.72-.43-1.21 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/>
    </svg>
  ),
  swords: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/>
      <polyline points="9.5 6.5 21 18 21 21 18 21 6.5 9.5"/><line x1="5" x2="11" y1="5" y2="11"/>
    </svg>
  ),
  armchair: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
      <path d="M5 18v3"/><path d="M19 18v3"/>
    </svg>
  ),
  castle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M18 11V4l-2 2-2-2-2 2-2-2-2 2-2-2v7"/>
    </svg>
  ),
  leaf: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 9 0 5-4 9-10 9Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  ),
  wrench: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  tent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 20 10 4 1 20h18z"/><path d="m10 4 9 16"/><path d="M6 13h8"/>
    </svg>
  ),
  map: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>
    </svg>
  ),
  box: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>
    </svg>
  ),
  dragon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 4 4-4 4 4 4-4 4"/><path d="M4 12h16"/>
    </svg>
  ),
  monitor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  ),
  globe: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
};

/* --- Filter Options per category ----------------------- */
const FILTER_OPTIONS = {
  shaders: [
    { id: "render-dragon", label: "RenderDragon Shaders", iconName: "dragon", categoryId: 6939, query: "" },
    { id: "vibrant-visuals", label: "Vibrant Visuals", iconName: "sparkles", categoryId: 6939, query: "vibrant" },
    { id: "classic-non-rd", label: "Classic / Non-RenderDragon", iconName: "castle", categoryId: 6939, query: "classic" },
    { id: "vanilla-plus", label: "Vanilla+ Default", iconName: "leaf", categoryId: 6939, query: "vanilla" },
    { id: "low-end", label: "Low End Lite", iconName: "zap", categoryId: 6939, query: "lite" },
    { id: "high-end", label: "High End RTX", iconName: "monitor", categoryId: 6939, query: "rtx" },
  ],
  textures: [
    { id: "pvp", label: "PvP Packs", iconName: "swords", categoryId: 6931, query: "" },
    { id: "32x", label: "32x HD", iconName: "grid", categoryId: 6936, query: "" },
    { id: "64x", label: "64x HD", iconName: "grid", categoryId: 6937, query: "" },
    { id: "barebones", label: "Bare Bones", iconName: "palette", categoryId: 6933, query: "" },
    { id: "realistic", label: "Realistic", iconName: "leaf", categoryId: 6932, query: "" },
    { id: "gui", label: "GUI & Interface", iconName: "monitor", categoryId: 10747, query: "" },
  ],
  mods: [
    { id: "weapons", label: "Guns & Weapons", iconName: "swords", categoryId: 8834, query: "" },
    { id: "furniture", label: "Furniture & Tech", iconName: "armchair", categoryId: 8826, query: "" },
    { id: "performance", label: "Performance", iconName: "zap", categoryId: 8837, query: "" },
    { id: "survival", label: "Survival Addons", iconName: "tent", categoryId: 8831, query: "" },
    { id: "horror", label: "Horror Addons", iconName: "ghost", categoryId: 8833, query: "" },
    { id: "magic", label: "Magic & Fantasy", iconName: "sparkles", categoryId: 8829, query: "" },
  ],
  maps: [
    { id: "survival", label: "Survival Maps", iconName: "tent", categoryId: 6924, query: "" },
    { id: "parkour", label: "Parkour Courses", iconName: "zap", categoryId: 6919, query: "" },
    { id: "adventure", label: "Adventure RPG", iconName: "map", categoryId: 6914, query: "" },
    { id: "pvp", label: "PvP Maps", iconName: "swords", categoryId: 6921, query: "" },
    { id: "minigames", label: "Minigames", iconName: "box", categoryId: 6918, query: "" },
  ],
  skins: [
    { id: "skin-packs", label: "Skin Packs", iconName: "sparkles", categoryId: 6928, query: "" },
    { id: "individual", label: "Individual Skins", iconName: "phone", categoryId: 6927, query: "" },
    { id: "character", label: "Character Packs", iconName: "grid", categoryId: 6926, query: "" },
  ],
};

/* --- Quick Subcategory Capsules (Rendered below main category tabs) --- */
const SUBCATEGORIES = {
  shaders: [
    { id: "all",          label: "🌟 All Shaders",       categoryId: 6939, query: "" },
    { id: "render-dragon",label: "🐲 RenderDragon",      categoryId: 6939, query: "render dragon" },
    { id: "vibrant",      label: "✨ Vibrant Visuals",   categoryId: 6939, query: "vibrant" },
    { id: "classic-non-rd",label:"🏛️ Classic / Non-RD",categoryId: 6939, query: "classic" },
    { id: "vanilla-plus", label: "🍃 Vanilla+",          categoryId: 6939, query: "vanilla" },
    { id: "low-end",      label: "⚡ Low End",           categoryId: 6939, query: "lite" },
    { id: "rtx",          label: "🌟 RTX",               categoryId: 6939, query: "rtx" },
  ],
  textures: [
    { id: "all",       label: "🌟 All Textures", categoryId: 6929, query: "" },
    { id: "pvp",       label: "⚔️ PvP Packs",    categoryId: 6931, query: "" },
    { id: "32x",       label: "📦 32x HD",        categoryId: 6936, query: "" },
    { id: "64x",       label: "📦 64x HD",        categoryId: 6937, query: "" },
    { id: "barebones", label: "🎨 Bare Bones",    categoryId: 6933, query: "" },
    { id: "realistic", label: "🌿 Realistic",      categoryId: 6932, query: "" },
    { id: "gui",       label: "🖥️ GUI & UI",       categoryId: 10747, query: "" },
  ],
  mods: [
    { id: "all",        label: "🌟 All Addons",        categoryId: 4984, query: "" },
    { id: "weapons",    label: "⚔️ Guns & Weapons",    categoryId: 8834, query: "" },
    { id: "furniture",  label: "🛋️ Furniture & Tech",  categoryId: 8826, query: "" },
    { id: "performance",label: "⚡ Performance",       categoryId: 8837, query: "" },
    { id: "survival",   label: "🏕️ Survival",          categoryId: 8831, query: "" },
    { id: "horror",     label: "👻 Horror",             categoryId: 8833, query: "" },
    { id: "magic",      label: "🧙 Magic & Fantasy",   categoryId: 8829, query: "" },
  ],
  maps: [
    { id: "all",       label: "🌟 All Maps",       categoryId: 6913, query: "" },
    { id: "survival",  label: "🏕️ Survival Maps",  categoryId: 6924, query: "" },
    { id: "parkour",   label: "🏃 Parkour",         categoryId: 6919, query: "" },
    { id: "adventure", label: "🗺️ Adventure RPG",   categoryId: 6914, query: "" },
    { id: "pvp",       label: "⚔️ PvP Maps",        categoryId: 6921, query: "" },
    { id: "minigames", label: "🕹️ Minigames",       categoryId: 6918, query: "" },
  ],
  skins: [
    // 6925 is the parent classId for ALL Bedrock skins — use it for the "All" tab
    { id: "all",       label: "🌟 All Skins",     categoryId: 6925, query: "" },
    { id: "packs",     label: "📦 Skin Packs",     categoryId: 6928, query: "" },
    { id: "individual",label: "👤 Individual",     categoryId: 6927, query: "" },
    { id: "character", label: "🎭 Character Packs",categoryId: 6926, query: "" },
  ],
};

/* --- Official MCPE Category Grid Cards ------------------- */
const MCPE_CATEGORY_GRID = [
  {
    id: "shaders",
    title: "✨ MCPE Shaders Hub",
    badge: "900+ Shaders",
    categoryId: 6939,
    description: "RenderDragon shaders, classic non-RenderDragon packs, Vanilla+ lighting, and RTX graphics for MCPE.",
    accentColor: "#10b981",
    imgUrl: "https://media.forgecdn.net/avatars/875/481/638298072734336144.png",
    categoryPath: "/resource/category/shaders/1?edition=pocket",
    quickPills: [
      { label: "RenderDragon", categoryId: 6939, query: "" },
      { label: "Classic / Non-RD", categoryId: 6939, query: "classic" },
      { label: "Vanilla+", categoryId: 6939, query: "vanilla" }
    ]
  },
  {
    id: "textures",
    title: "🎨 MCPE Texture & PvP Packs",
    badge: "4,600+ Packs",
    categoryId: 6929,
    description: "Smooth 1,300+ PvP resource packs, Bare Bones textures, medieval packs, and photorealistic 64x HD Bedrock textures.",
    accentColor: "#f59e0b",
    imgUrl: "https://media.forgecdn.net/avatars/663/771/638072535036987483.png",
    categoryPath: "/resource/category/textures/1?edition=pocket",
    quickPills: [
      { label: "PvP Packs (1,300+)", categoryId: 6931, query: "" },
      { label: "32x Faithful", categoryId: 6936, query: "" },
      { label: "Bare Bones", categoryId: 6933, query: "" }
    ]
  },
  {
    id: "mods",
    title: "🧩 MCPE Addons & Mods",
    badge: "1,600+ Addons",
    categoryId: 4984,
    description: "Custom Bedrock addons with working furniture, sports cars, 1,600+ weapons, magic spells, and FPS performance tweaks.",
    accentColor: "#3b82f6",
    imgUrl: "https://media.forgecdn.net/avatars/305/737/637389279585640321.png",
    categoryPath: "/resource/category/mods/1?edition=pocket",
    quickPills: [
      { label: "Weapons (1,600+)", categoryId: 8834, query: "" },
      { label: "Furniture & Tech", categoryId: 8826, query: "" },
      { label: "Performance (400+)", categoryId: 8837, query: "" }
    ]
  },
  {
    id: "maps",
    title: "🗺️ MCPE Custom Maps & Worlds",
    badge: "1,200+ Maps",
    categoryId: 6913,
    description: "Hand-crafted survival spawn islands, 350+ parkour courses, adventure RPG maps, and custom Bedrock terrain.",
    accentColor: "#8b5cf6",
    imgUrl: "https://media.forgecdn.net/avatars/220/861/637012586716075936.png",
    categoryPath: "/resource/category/maps/1?edition=pocket",
    quickPills: [
      { label: "Survival Maps (800+)", categoryId: 6924, query: "" },
      { label: "Parkour (350+)", categoryId: 6919, query: "" },
      { label: "Adventure RPG", categoryId: 6914, query: "" }
    ]
  }
];

/* --- Curated MCPE Collections Data ------------------------- */
const POPULAR_COLLECTIONS = [
  {
    id: "classic-non-rd",
    title: "🏛️ Classic & Non-RenderDragon Shaders",
    subtitle: "Pre-RenderDragon shaders, Vanilla+ lighting & classic Bedrock graphics for classic fans and older MCPE builds",
    iconName: "castle",
    badge: "Classic & Pre-RD",
    accentColor: "#8b5cf6",
    links: [
      { label: "Classic Bedrock Shaders", query: "classic", category: "shaders", categoryId: 6939 },
      { label: "Vanilla+ Default Shaders", query: "vanilla", category: "shaders", categoryId: 6939 },
    ]
  },
  {
    id: "performance",
    title: "⚡ Low-End FPS Boost Collection",
    subtitle: "High FPS RenderDragon shaders & lightweight performance addons for budget mobile phones",
    iconName: "zap",
    badge: "MCPE FPS Gains",
    accentColor: "#10b981",
    links: [
      { label: "Low-End MCPE Shaders", query: "lite", category: "shaders", categoryId: 6939 },
      { label: "MCPE Performance Addons (400+)", query: "", category: "mods", categoryId: 8837 },
    ]
  },
  {
    id: "rtx",
    title: "✨ Ultra Realism & RTX Lighting",
    subtitle: "Photorealistic lighting, ray tracing shaders & PBR texture packs for Bedrock Edition",
    iconName: "sparkles",
    badge: "RTX & PBR Shaders",
    accentColor: "#f59e0b",
    links: [
      { label: "Realistic RTX Shaders", query: "rtx", category: "shaders", categoryId: 6939 },
      { label: "RTX Texture Packs", query: "rtx", category: "textures", categoryId: 6929 },
    ]
  },
  {
    id: "pvp",
    title: "⚔️ PvP & Bedwars Suite",
    subtitle: "Clean low-fire PvP texture packs, custom short swords & anti-lag packs for servers",
    iconName: "swords",
    badge: "PvP & Competitive",
    accentColor: "#f43f5e",
    links: [
      { label: "Top PvP Resource Packs (1,300+)", query: "", category: "textures", categoryId: 6931 },
      { label: "Custom Weapon Addons (1,600+)", query: "", category: "mods", categoryId: 8834 },
    ]
  },
  {
    id: "furniture",
    title: "🏡 Modern Furniture & Crafting",
    subtitle: "Functional sofas, TVs, cars & decor blocks to build your dream MCPE survival house",
    iconName: "armchair",
    badge: "Furniture & Decor",
    accentColor: "#06b6d4",
    links: [
      { label: "Working Furniture Addons", query: "", category: "mods", categoryId: 8826 },
      { label: "Cars & Vehicles Addons", query: "vehicles", category: "mods", categoryId: 8826 },
    ]
  }
];

/* --- Helpers ------------------------------------------- */
function formatDownloads(n) {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/* --- Horizontal CoverFlow Card --------------------------- */
function MobileHCard({ resource, showNewBadge = false }) {
  const name = resource.name || resource.title || "Unknown";
  const author = resource.authorNames?.[0] || resource.authors?.[0]?.name || resource.author || "";
  const logo = resource.thumbnail_url || resource.logoUrl || resource.thumbnailUrl || resource.logo || null;
  const slug = resource.docId || resource.id || "";
  // API returns download_count (snake_case from seed/curseforge.js), downloadCount from details
  const downloads = resource.download_count || resource.downloadCount || resource.downloads || 0;

  const [isSaved, setIsSaved] = useState(false);
  const [imgSrc, setImgSrc] = useState(logo);

  useEffect(() => { setImgSrc(logo); }, [logo]);

  useEffect(() => {
    if (!slug) return;
    const checkSaved = () => {
      const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      setIsSaved(stored.some((item) => String(item.docId || item.id) === String(slug)));
    };
    checkSaved();
    window.addEventListener("creevoxx_bookmarks_updated", checkSaved);
    return () => window.removeEventListener("creevoxx_bookmarks_updated", checkSaved);
  }, [slug]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
    let updated;
    if (isSaved) {
      updated = stored.filter((item) => String(item.docId || item.id) !== String(slug));
    } else {
      const newItem = {
        docId: slug,
        id: slug,
        title: name,
        author,
        thumbnail_url: logo,
        category: resource.category || "shaders",
      };
      updated = [newItem, ...stored];
    }
    localStorage.setItem("creevoxx_mc_bookmarks", JSON.stringify(updated));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event("creevoxx_bookmarks_updated"));
  };

  return (
    <Link href={`/resource/${slug}`} className="mhcard" prefetch={false} scroll={true}>
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={name}
          width={400}
          height={225}
          className="mhcard-img"
          loading="lazy"
          onError={() => setImgSrc("/logo.png")}
        />
      ) : (
        <div className="mhcard-img-fallback">
          <Image src="/logo.png" alt={name} width={48} height={48} style={{ objectFit: "contain" }} unoptimized={true} />
        </div>
      )}

      {/* Top Left: Heart Save Button */}
      <button
        className={`mhcard-save-btn${isSaved ? " mhcard-save-btn--saved" : ""}`}
        onClick={toggleSave}
        aria-label={isSaved ? "Remove bookmark" : "Bookmark resource"}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={isSaved ? "#ef4444" : "none"}
          stroke={isSaved ? "#ef4444" : "rgba(255,255,255,0.85)"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* NEW 3D badge — shown for "New Arrivals" sections */}
      {showNewBadge && (
        <span className="mhcard-new-badge">NEW</span>
      )}

      {/* Top Right: Download count chip */}
      <div className="mhcard-top-right">
        {downloads > 0 && (
          <span className="mhcard-dl-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            {formatDownloads(downloads)}
          </span>
        )}
      </div>
      <div className="mhcard-overlay" />
      <div className="mhcard-info">
        <p className="mhcard-title">{name}</p>
        <div className="mhcard-meta">
          <p className="mhcard-author">{author}</p>
          <button className="mhcard-get" aria-label={`Get ${name}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Get
          </button>
        </div>
      </div>
    </Link>
  );
}

/* --- Skeleton Loading Card (shown while fetching) --- */
function SkeletonCard() {
  return (
    <div className="mob-skeleton-card">
      <div className="mob-skeleton-img" />
      <div className="mob-skeleton-info">
        <div className="mob-skeleton-line mob-skeleton-line--title" />
        <div className="mob-skeleton-line mob-skeleton-line--sub" />
      </div>
    </div>
  );
}

/* --- Horizontal Scrolling Section --------- */
function MobileHSection({ title, resources, onSeeAll, isNew = false }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);
  const frameRef = useRef(null);
  const handleScroll = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const firstChild = el.firstElementChild;
      if (!firstChild) return;
      const itemW = firstChild.offsetWidth + 12;
      if (!itemW) return;
      const idx = Math.round(el.scrollLeft / itemW);
      const nextIdx = Math.min(idx, resources.length - 1);
      setActiveIdx((prev) => (prev === nextIdx ? prev : nextIdx));
    });
  }, [resources.length]);

  if (!resources || resources.length === 0) return null;

  return (
    <section className="mhs">
      <div className="mhs-header">
        <h2 className="mhs-title">{title}</h2>
        <button className="mhs-see-all" onClick={onSeeAll}>See all</button>
      </div>
      <div className="mhs-scroll" ref={scrollRef} onScroll={handleScroll}>
        {resources.map((r, i) => {
          const dist = Math.abs(i - activeIdx);
          const scale = dist === 0 ? 1.02 : 0.93;
          const opacity = dist === 0 ? 1 : 0.78;
          return (
            <div
              key={r.docId || r.id || i}
              className="mhs-item"
              style={{
                transform: `scale(${scale})`,
                opacity,
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
            >
              <MobileHCard resource={r} showNewBadge={isNew} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --- Category Tab Icons ----------------------------------- */
const TAB_ICONS = {
  shaders: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  textures: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>
    </svg>
  ),
  mods: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  ),
  maps: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>
    </svg>
  ),
  skins: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  collections: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  ),
};

/* --- Saved Items Sheet ------------------------------------ */
function SavedSheet({ onClose }) {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const load = () => {
      const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      setSavedItems(stored);
    };
    load();
    window.addEventListener("creevoxx_bookmarks_updated", load);
    return () => window.removeEventListener("creevoxx_bookmarks_updated", load);
  }, []);

  return (
    <div className="mob-saved-overlay" onClick={onClose}>
      <div className="mob-saved-sheet" onClick={(e) => e.stopPropagation()}>
        {/* drag handle */}
        <div className="mob-saved-handle" />
        <div className="mob-saved-header">
          <span className="mob-saved-title">🔖 Saved Resources</span>
          <button className="mob-saved-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="mob-saved-body">
          {savedItems.length === 0 ? (
            <div className="mob-saved-empty">
              <span style={{ fontSize: "2.5rem" }}>🔖</span>
              <p style={{ fontWeight: 700, color: "#fff", margin: "12px 0 6px" }}>No saved resources yet</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Tap the bookmark icon on any card to save it here.
              </p>
            </div>
          ) : (
            <div className="mob-saved-list">
              {savedItems.map((item) => (
                <Link
                  key={item.docId}
                  href={`/resource/${item.docId}`}
                  className="mob-saved-item"
                  onClick={onClose}
                >
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title || "Resource"}
                      className="mob-saved-thumb"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="mob-saved-thumb-ph">
                      <Image src="/logo.png" alt="Creevoxx Logo" width={20} height={20} style={{ objectFit: "contain" }} unoptimized={true} />
                    </div>
                  )}
                  <div className="mob-saved-item-info">
                    <p className="mob-saved-item-title">{item.title}</p>
                    <p className="mob-saved-item-meta">
                      {item.category === "shaders" ? "✨ Shaders" : item.category === "textures" ? "🎨 Textures" : "🔧 Mods"}
                      {item.author ? ` • ${item.author}` : ""}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Filter Sheet Component -------------------------------- */
function FilterSheet({ activeTab, activeFilter, onSelectFilter, onClose }) {
  const options = FILTER_OPTIONS[activeTab] || [];
  return (
    <div className="mob-filter-overlay" onClick={onClose}>
      <div className="mob-filter-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mob-filter-handle" />
        <div className="mob-filter-header">
          <span className="mob-filter-title">
            {activeTab === "shaders" ? "✨ Shader Filters" : activeTab === "textures" ? "🎨 Texture Filters" : activeTab === "maps" ? "🗺️ Map Filters" : activeTab === "skins" ? "👤 Skin Filters" : "🔧 Addon Filters"}
          </span>
          <button className="mob-filter-close" onClick={onClose} aria-label="Close filters">✕</button>
        </div>
        <p className="mob-filter-subtitle">Select a filter to browse {activeTab}</p>
        <div className="mob-filter-chips">
          {/* All option */}
          <button
            className={`mob-filter-chip${!activeFilter ? " mob-filter-chip--active" : ""}`}
            onClick={() => { onSelectFilter(null); onClose(); }}
          >
            <span className="mob-filter-chip-icon">{SVG_ICONS.globe}</span>
            <span>All</span>
          </button>
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`mob-filter-chip${activeFilter?.id === opt.id ? " mob-filter-chip--active" : ""}`}
              onClick={() => { onSelectFilter(opt); onClose(); }}
            >
              <span className="mob-filter-chip-icon">{SVG_ICONS[opt.iconName] || SVG_ICONS.sparkles}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Full-Page Saved Resources View --------------------------- */
function MobileSavedPage({ onNavigateTab }) {
  const [savedItems, setSavedItems] = useState([]);
  const [savedFilter, setSavedFilter] = useState("all");

  const loadSaved = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      setSavedItems(stored);
    }
  }, []);

  useEffect(() => {
    loadSaved();
    window.addEventListener("creevoxx_bookmarks_updated", loadSaved);
    return () => window.removeEventListener("creevoxx_bookmarks_updated", loadSaved);
  }, [loadSaved]);

  const removeItem = (docId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
    const updated = stored.filter((item) => String(item.docId || item.id) !== String(docId));
    localStorage.setItem("creevoxx_mc_bookmarks", JSON.stringify(updated));
    setSavedItems(updated);
    window.dispatchEvent(new Event("creevoxx_bookmarks_updated"));
  };

  const filteredItems = savedFilter === "all"
    ? savedItems
    : savedItems.filter((i) => (i.category || "").toLowerCase() === savedFilter);

  return (
    <div className="mob-saved-page">
      <div className="mob-col-header">
        <div className="mob-col-badge" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.3)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>SAVED LIBRARY</span>
        </div>
        <h2 className="mob-col-title">Saved Resources</h2>
        <p className="mob-col-sub">Your bookmarked Minecraft shaders, texture packs &amp; mods for quick access.</p>
      </div>

      {savedItems.length > 0 && (
        <div className="mob-saved-filter-row">
          {["all", "shaders", "textures", "mods", "maps", "skins"].map((f) => (
            <button
              key={f}
              className={`mob-saved-filter-pill${savedFilter === f ? " mob-saved-filter-pill--active" : ""}`}
              onClick={() => setSavedFilter(f)}
            >
              {f === "all" ? "All Saved" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="mob-saved-empty-card">
          <div className="mob-saved-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3>No Saved Resources Yet</h3>
          <p>Tap the heart icon on any shader or mod card to save it here for instant access.</p>
          <button className="mob-saved-explore-btn" onClick={() => onNavigateTab("shaders")}>
            Explore Shaders →
          </button>
        </div>
      ) : (
        <div className="mob-saved-grid">
          {filteredItems.map((item) => {
            const itemDocId = item.docId || item.id;
            const itemTitle = item.title || item.name || "Resource";
            const itemAuthor = item.author || "creator";
            const itemThumb = item.thumbnail_url || item.logoUrl || null;
            const itemCat = (item.category || "shaders").toLowerCase();

            return (
              <div key={itemDocId} className="mob-saved-card">
                <div className="mob-saved-card-thumb">
                  {itemThumb ? (
                    <Image src={itemThumb} alt={itemTitle} fill style={{ objectFit: "cover" }} unoptimized={true} />
                  ) : (
                    <div className="mob-saved-card-thumb-ph">📦</div>
                  )}
                  <span className="mob-saved-card-cat">{itemCat.toUpperCase()}</span>
                </div>

                <div className="mob-saved-card-info">
                  <h4 className="mob-saved-card-title">{itemTitle}</h4>
                  <p className="mob-saved-card-author">by {itemAuthor}</p>

                  <div className="mob-saved-card-actions">
                    <Link href={`/resource/${itemDocId}`} className="mob-saved-view-btn">
                      View Details →
                    </Link>
                    <button
                      className="mob-saved-remove-btn"
                      onClick={(e) => removeItem(itemDocId, e)}
                      aria-label="Remove from saved"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --- Format stat number for mobile compact display --- */
function formatMobileStat(n) {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)    return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* --- Main Interactive Shell ------------------------------- */
export default function MobileAppShell({ initialData, stats }) {
  const [activeTab, setActiveTab] = useState("shaders");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [fetchError, setFetchError] = useState(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const contentEl = document.querySelector(".mob-content");
    if (!contentEl) return;
    const handleScroll = () => {
      setShowScrollTop(contentEl.scrollTop > 300);
    };
    contentEl.addEventListener("scroll", handleScroll);
    return () => contentEl.removeEventListener("scroll", handleScroll);
  }, []);
  // Tracks when user taps "See All" on a home section
  const [seeAllContext, setSeeAllContext] = useState(null); // { title, categoryId, query, sortField }
  // Sort mode: 'popular' = sortField 6 (downloads), 'newest' = sortField 1 (dateAdded)
  const [sortMode, setSortMode] = useState("popular");

  const debounceRef = useRef(null);

  const currentSections = initialData[activeTab] || [];

  const handleSearch = useCallback((val = "", overrideCategory, page = 1, forceFetch = false, categoryId = undefined, skipSetQuery = false, sortField = undefined, isLoadMore = false) => {
    const searchCat = overrideCategory || activeTab;
    // Only update the visible search bar if NOT in "see all" mode
    if (!skipSetQuery) {
      setSearchQuery(val);
    }
    setCurrentPage(page);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() && !forceFetch && !categoryId) { 
      setSearchResults(null); 
      setTotalResults(0);
      setFetchError(null);
      return; 
    }

    const delay = page === 1 ? 400 : 0;

    debounceRef.current = setTimeout(async () => {
      setIsSearching(!isLoadMore);
      setIsFetchingNextPage(isLoadMore);
      setFetchError(null);
      try {
        const index = (page - 1) * 7;
        // sortField: explicit param > seeAllContext > sortMode state
        const sf = sortField ?? (seeAllContext?.sortField) ?? (sortMode === "newest" ? "1" : "6");
        let searchUrl = `/api/search?q=${encodeURIComponent(val)}&category=${searchCat}&pageSize=7&index=${index}&edition=pocket&sortField=${sf}&sortOrder=desc`;
        if (categoryId) {
          searchUrl += `&categoryId=${categoryId}`;
        }
        const res = await fetch(searchUrl);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("[MobileSearch] API error", res.status, err);
          throw new Error(err.error || `Search failed: ${res.status}`);
        }
        const data = await res.json();
        
        if (isLoadMore) {
          setSearchResults(prev => [...(prev || []), ...(data.data || [])]);
        } else {
          setSearchResults(data.data || []);
        }
        setTotalResults(data.pagination?.totalCount || data.data?.length || 0);
      } catch (err) { 
        if (!isLoadMore) setSearchResults([]);
        setFetchError(err.message || "Failed to fetch results. Please try again.");
      }
      finally { 
        setIsSearching(false);
        setIsFetchingNextPage(false);
      }
    }, delay);
  }, [activeTab, sortMode, seeAllContext]);

  const handleSeeAll = (title, query, categoryId, sortField) => {
    setSearchQuery("");
    setActiveFilter(null);
    setSeeAllContext({ title, categoryId, query: query || "", sortField });
    // Pass skipSetQuery=true so the section's sub-query ("vibrant", "rtx", "lite" etc.)
    // is sent to the API but NEVER appears in the search bar
    handleSearch(query || "", activeTab, 1, true, categoryId, true, sortField);
  };

  const handleCollectionClick = (query = "", category = "shaders", pillFilter = null, categoryId = undefined) => {
    setActiveTab(category);
    setSearchQuery("");
    setSeeAllContext(null);
    if (pillFilter) {
      // pillFilter always has a categoryId now
      setActiveFilter(pillFilter);
      handleSearch(pillFilter.query || "", category, 1, true, pillFilter.categoryId);
    } else {
      // Always resolve to a real categoryId — never fall through to raw query
      const resolvedCatId = categoryId
        || SUBCATEGORIES[category]?.find(s => s.query === query)?.categoryId
        || MCPE_CATEGORY_GRID.find(c => c.id === category)?.categoryId;
      const matchSub = resolvedCatId
        ? SUBCATEGORIES[category]?.find(s => s.categoryId === resolvedCatId && s.query === (query || ""))
        : null;
      setActiveFilter(matchSub || null);
      handleSearch(query || "", category, 1, true, resolvedCatId);
    }
    const contentArea = document.querySelector(".mob-content");
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterSelect = (filterOpt) => {
    setSeeAllContext(null);
    if (filterOpt && filterOpt.id !== "all") {
      setActiveFilter(filterOpt);
      handleSearch(filterOpt.query || "", activeTab, 1, true, filterOpt.categoryId);
    } else {
      setActiveFilter(null);
      const catObj = SUBCATEGORIES[activeTab]?.[0] || MCPE_CATEGORY_GRID.find(c => c.id === activeTab);
      handleSearch("", activeTab, 1, true, catObj?.categoryId);
    }
  };

  const handleSortChange = (newSortMode) => {
    setSortMode(newSortMode);
    const sf = newSortMode === "newest" ? "1" : "6";
    const q = seeAllContext ? seeAllContext.query : (activeFilter ? activeFilter.query : searchQuery);
    const catId = seeAllContext ? seeAllContext.categoryId : activeFilter?.categoryId;
    const skip = !!seeAllContext;
    handleSearch(q || "", activeTab, 1, true, catId, skip, sf);
  };

  const handleTabChange = (tab) => {
    if (tab === "home") {
      setSearchQuery("");
      setSearchResults(null);
      setTotalResults(0);
      setActiveTab("shaders");
      setShowSaved(false);
      setActiveFilter(null);
      setIsSearchFocused(false);
      setSeeAllContext(null);
    } else if (tab === "search") {
      if (activeTab === "collections" || activeTab === "saved") {
        setActiveTab("shaders");
      }
      setShowSaved(false);
      setSeeAllContext(null);
      setIsSearchFocused(true);
      const contentArea = document.querySelector(".mob-content");
      if (contentArea) contentArea.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const input = document.getElementById("mobile-app-search");
        if (input) input.focus();
      }, 50);
    } else if (tab === "saved") {
      setShowSaved(true);
      setIsSearchFocused(false);
    } else {
      setShowSaved(false);
      setActiveTab(tab);
      setIsSearchFocused(false);
    }
  };

  const showingSections = !searchResults && !isSearching;

  const pathname = usePathname();
  // Hide the home shell entirely when on a resource detail page
  if (pathname && pathname.startsWith("/resource/")) return null;

  return (
    <div className="mob-app">
      {/* -- Content Area — search bar scrolls WITH content --- */}
      <div className="mob-content">

        {activeTab !== "collections" && (
          <>
            {/* Topbar: Left Official Logo + Right Modern Expandable Search */}
            <div className={`mob-topbar${isSearchFocused || searchQuery ? " mob-topbar--search-open" : ""}`}>
              <Link href="/" className="mob-brand" aria-label="Creevoxx Home">
                <Image
                  src="/logo.png"
                  alt="Creevoxx Logo"
                  width={52}
                  height={52}
                  className="mob-brand-logo"
                  unoptimized={true}
                />
                <span className="mob-brand-name">
                  Creevoxx<span className="mob-brand-accent">MCMods</span>
                </span>
              </Link>

              <div className="mob-search-wrapper">
                {!isSearchFocused && !searchQuery ? (
                  <button
                    className="mob-search-trigger"
                    onClick={() => {
                      if (activeTab === "collections" || activeTab === "saved") {
                        setActiveTab("shaders");
                      }
                      setSeeAllContext(null);
                      setIsSearchFocused(true);
                      setTimeout(() => {
                        document.getElementById("mobile-app-search")?.focus();
                      }, 50);
                    }}
                    aria-label="Open search"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                ) : (
                  <div className="mob-search-expanded-pill">
                    <button
                      className="mob-search-back"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults(null);
                        setTotalResults(0);
                        setIsSearchFocused(false);
                      }}
                      aria-label="Close search"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                    </button>
                    <input
                      id="mobile-app-search"
                      className="mob-search-input"
                      placeholder="Search shaders, textures, mods..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => {
                        // Exiting "See All" when user manually searches
                        if (seeAllContext) setSeeAllContext(null);
                      }}
                      onBlur={() => {
                        if (!searchQuery) setIsSearchFocused(false);
                      }}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        className="mob-search-clear"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults(null);
                          setTotalResults(0);
                          setIsSearchFocused(false);
                        }}
                        aria-label="Clear search"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* -- Category Capsule Tabs Row (Full Width) --- */}
            <div className="mob-tabs mob-tabs--scroll">
              {[
                            { id: "shaders", label: "Shaders" },
                { id: "textures", label: "Textures" },
                { id: "mods", label: "Addons" },
                { id: "maps", label: "Maps" },
                { id: "skins", label: "Skins" },
                { id: "collections", label: "Collections" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`mob-tab${activeTab === tab.id ? " mob-tab--active" : ""}`}
                  onClick={(e) => {
                    e.currentTarget?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    if (activeTab === tab.id) {
                      // Tap active tab → scroll content back to top (native app behaviour)
                      document.querySelector(".mob-content")?.scrollTo({ top: 0, behavior: "smooth" });
                      return;
                    }
                    setActiveTab(tab.id);
                    setSearchQuery("");
                    setSearchResults(null);
                    setTotalResults(0);
                    setActiveFilter(null);
                    setSeeAllContext(null);
                  }}
                >
                  <span className="mob-tab-icon">{TAB_ICONS[tab.id]}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Subcategory Capsule Pills — hidden when in "See All" mode */}
            {activeTab !== "collections" && SUBCATEGORIES[activeTab] && !seeAllContext && (
              <div className="mob-subcapsules-row">
                {SUBCATEGORIES[activeTab].map((sub) => {
                  const isActive = activeFilter?.id === sub.id || (!activeFilter && sub.id === "all");
                  return (
                    <button
                      key={sub.id}
                      className={`mob-subcapsule-pill${isActive ? " mob-subcapsule-pill--active" : ""}`}
                      onClick={(e) => {
                        e.currentTarget?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                        if (sub.id === "all") {
                          handleFilterSelect(null);
                        } else {
                          handleFilterSelect(sub);
                        }
                      }}
                    >
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Live stats bar — real counts from API, shown only on home browse (not search/seeAll) */}
            {!searchResults && !seeAllContext && stats && activeTab !== "collections" && (
              <div className="mob-stats-bar">
                {activeTab === "shaders" && formatMobileStat(stats.shaders) && (
                  <span className="mob-stats-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    {formatMobileStat(stats.shaders)} Shaders
                  </span>
                )}
                {activeTab === "textures" && formatMobileStat(stats.textures) && (
                  <span className="mob-stats-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>
                    {formatMobileStat(stats.textures)} Texture Packs
                  </span>
                )}
                {activeTab === "mods" && formatMobileStat(stats.mods) && (
                  <span className="mob-stats-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
                    {formatMobileStat(stats.mods)} Addons
                  </span>
                )}
                {(activeTab === "shaders" || activeTab === "textures" || activeTab === "mods") && formatMobileStat(stats.total) && (
                  <span className="mob-stats-pill mob-stats-pill--total">
                    {formatMobileStat(stats.total)} Total
                  </span>
                )}
              </div>
            )}

            {/* Sort toggle — shown when results are visible */}
            {searchResults && (
              <div className="mob-sort-row">
                <span className="mob-sort-label">Sort:</span>
                <button
                  className={`mob-sort-btn${sortMode === "popular" ? " mob-sort-btn--active" : ""}`}
                  onClick={() => handleSortChange("popular")}
                >🔥 Popular</button>
                <button
                  className={`mob-sort-btn${sortMode === "newest" ? " mob-sort-btn--active" : ""}`}
                  onClick={() => handleSortChange("newest")}
                >🆕 Newest</button>
              </div>
            )}
          </>
        )}



        {isSearching && (
          <div className="mob-loading">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* -- Search Results Grid --- */}
        {searchResults && !isSearching && (
          <div className="mob-search-results">
            {seeAllContext ? (
              <div className="mob-see-all-header">
                <button
                  className="mob-back-btn"
                  onClick={() => {
                    setSeeAllContext(null);
                    setSearchResults(null);
                    setTotalResults(0);
                    setCurrentPage(1);
                    setActiveFilter(null);
                  }}
                  aria-label="Back to browse"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  <span>Back</span>
                </button>
                <div className="mob-see-all-info">
                  <span className="mob-see-all-title">{seeAllContext.title}</span>
                  <span className="mob-see-all-count">{totalResults.toLocaleString()} results</span>
                </div>
              </div>
            ) : (
              <p className="mob-results-count">
                {searchQuery ? `${totalResults.toLocaleString()} results for "${searchQuery}"` : `${totalResults.toLocaleString()} results`}
              </p>
            )}
            {fetchError ? (
              <div className="mob-error-state">
                <span className="mob-empty-icon">⚠️</span>
                <p className="mob-empty-title">Network Error</p>
                <p className="mob-empty-sub">{fetchError}</p>
                <button className="mob-retry-btn" onClick={() => {
                  const q = seeAllContext ? seeAllContext.query : (activeFilter ? activeFilter.query : searchQuery);
                  const catId = seeAllContext ? seeAllContext.categoryId : activeFilter?.categoryId;
                  handleSearch(q || "", activeTab, 1, true, catId, !!seeAllContext);
                }}>Tap to Retry</button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="mob-empty-state">
                <span className="mob-empty-icon">🔍</span>
                <p className="mob-empty-title">No results found</p>
                <p className="mob-empty-sub">
                  {searchQuery ? `Nothing matched "${searchQuery}" — try a different term` : "This category has no results right now"}
                </p>
              </div>
            ) : (
            <div className="mob-search-list">
              {searchResults.map((r, i) => (
                <MobileHCard key={r.docId || r.id || i} resource={r} />
              ))}
            </div>
            )}
            
            {searchResults && searchResults.length > 0 && searchResults.length < totalResults && (
              <div style={{ padding: "24px 16px" }}>
                <button 
                  className="mob-load-more-btn"
                  onClick={() => {
                    const q = seeAllContext ? seeAllContext.query : (activeFilter ? activeFilter.query : searchQuery);
                    const catId = seeAllContext ? seeAllContext.categoryId : activeFilter?.categoryId;
                    handleSearch(q || "", activeTab, currentPage + 1, true, catId, !!seeAllContext, undefined, true);
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading..." : "Load More Results"}
                </button>
              </div>
            )}
          </div>
        )}

        {showingSections && activeTab !== "collections" && currentSections && currentSections.map((section) => (
          <MobileHSection
            key={section.title}
            title={section.title}
            resources={section.resources}
            isNew={section.isNew ?? false}
            onSeeAll={() => handleSeeAll(section.title, section.query, section.categoryId, section.sortField)}
          />
        ))}

        {/* -- Saved Full Page View ------------------------------ */}
        {activeTab === "saved" && (
          <MobileSavedPage onNavigateTab={handleTabChange} />
        )}

        {/* -- Modern Visual Collections Page ------------------------------ */}
        {activeTab === "collections" && (
          <div className="mob-col-page">
            {/* 1. Official Category Grid Cards */}
            <div className="mob-col-header">
              <div className="mob-col-badge">
                {SVG_ICONS.grid}
                <span>MCPE BROWSE HUB</span>
              </div>
              <h2 className="mob-col-title">MCPE Categories</h2>
              <p className="mob-col-sub">Hand-tested Minecraft Pocket Edition (MCPE &amp; Bedrock) resources.</p>
            </div>

            <div className="mob-cat-grid" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {MCPE_CATEGORY_GRID.map((cat) => {
                let displayBadge = cat.badge;
                if (stats) {
                  if (cat.id === "shaders" && stats.shaders) displayBadge = `${formatMobileStat(stats.shaders)}+ Shaders`;
                  if (cat.id === "textures" && stats.textures) displayBadge = `${formatMobileStat(stats.textures)}+ Packs`;
                  if (cat.id === "mods" && stats.mods) displayBadge = `${formatMobileStat(stats.mods)}+ Addons`;
                  if (cat.id === "maps" && stats.maps) displayBadge = `${formatMobileStat(stats.maps)}+ Maps`;
                }
                return (
                <div
                  key={cat.id}
                  className="mob-cat-card"
                  style={{ '--col-accent': cat.accentColor, cursor: "pointer" }}
                  onClick={() => handleCollectionClick("", cat.id)}
                >
                  <div className="mob-cat-card-header">
                    <div style={{ position: "relative", width: "60px", height: "60px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.18)", background: "#0e1e1a", boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }}>
                      <Image src={cat.imgUrl} alt={cat.title} fill style={{ objectFit: "cover" }} unoptimized={true} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "3px" }}>
                        <h3 className="mob-col-card-title" style={{ margin: 0, fontSize: "1.08rem", fontWeight: "800" }}>{cat.title}</h3>
                        <span className="mob-col-pill-badge" style={{ flexShrink: 0, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>{displayBadge}</span>
                      </div>
                      <p className="mob-col-card-sub" style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.35" }}>{cat.description}</p>
                    </div>
                  </div>

                  <div className="mob-cat-card-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="mob-col-link-btn"
                      style={{ flex: "1 1 120px", background: "#10b981", color: "#04140e", border: "none", borderRadius: "18px", padding: "8px 14px", fontWeight: "800", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 3px 10px rgba(16,185,129,0.3)", cursor: "pointer" }}
                      onClick={() => handleCollectionClick("", cat.id)}
                    >
                      <span>Browse All {cat.title.replace(/[^a-zA-Z\s]/g, "").trim()} →</span>
                    </button>
                    {cat.quickPills.map((pill, idx) => (
                      <button
                        key={idx}
                        className="mob-subcapsule-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Always use pill.categoryId — never raw query lookup
                          const matchSub = SUBCATEGORIES[cat.id]?.find(
                            s => s.categoryId === pill.categoryId && s.query === (pill.query || "")
                          );
                          handleCollectionClick(
                            pill.query || "",
                            cat.id,
                            matchSub || { id: `${cat.id}-${idx}`, label: pill.label, query: pill.query || "", categoryId: pill.categoryId },
                            pill.categoryId
                          );
                        }}
                      >
                        <span>{pill.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
              })}
            </div>

            {/* 2. Curated Collections Section */}
            <div className="mob-col-header">
              <div className="mob-col-badge">
                {SVG_ICONS.sparkles}
                <span>CURATED COLLECTIONS</span>
              </div>
              <h2 className="mob-col-title">Popular Collections</h2>
              <p className="mob-col-sub">Hand-picked MCPE packs categorized by FPS gains, graphics &amp; playstyle.</p>
            </div>
            
            <div className="mob-col-grid">
              {POPULAR_COLLECTIONS.map((col) => (
                <div key={col.id} className="mob-col-card" style={{ '--col-accent': col.accentColor }}>
                  <div className="mob-col-card-top">
                    <div className="mob-col-icon-wrapper">
                      {SVG_ICONS[col.iconName]}
                    </div>
                    <span className="mob-col-pill-badge">{col.badge}</span>
                  </div>

                  <h3 className="mob-col-card-title">{col.title}</h3>
                  <p className="mob-col-card-sub">{col.subtitle}</p>

                  <div className="mob-col-links">
                    {col.links.map((lnk, idx) => (
                      <Link
                        key={idx}
                        href={lnk.categoryId ? `/resource/category/${lnk.category}/1?categoryId=${lnk.categoryId}&edition=pocket` : `/resource/category/${lnk.category}/1?q=${encodeURIComponent(lnk.query)}&edition=pocket`}
                        className="mob-col-link-btn"
                        onClick={(e) => {
                          if (window.innerWidth <= 768) {
                            handleCollectionClick(lnk.query, lnk.category, null, lnk.categoryId);
                          }
                        }}
                      >
                        <span>{lnk.label}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -- Mobile Footer ------------------------------ */}
        {activeTab !== "collections" && activeTab !== "saved" && (
          <footer className="mob-footer">
            <div className="mob-footer-main">
              <div className="mob-footer-logo-box">
                <Image src="/logo.png" alt="Creevoxx Logo" width={52} height={52} style={{ objectFit: "contain" }} unoptimized={true} />
              </div>
              <div className="mob-footer-info">
                <div className="mob-footer-title-row">
                  <h3 className="mob-footer-title">Creevoxx<span style={{ color: "#10b981" }}>MCMods</span></h3>
                  <span className="mob-footer-badge">FAN HUB</span>
                </div>
                <p className="mob-footer-sub">Crafted Minecraft shaders, textures &amp; mods in one clean space.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0", flexWrap: "wrap" }}>
              <PlayStoreBadge compact={true} />
              <a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.3)", borderRadius: "10px", padding: "5px 10px", color: "#fff", textDecoration: "none", fontSize: "0.75rem", fontWeight: "700" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>YouTube</span>
              </a>
              <a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(225,48,108,0.1)", border: "1px solid rgba(225,48,108,0.3)", borderRadius: "10px", padding: "5px 10px", color: "#fff", textDecoration: "none", fontSize: "0.75rem", fontWeight: "700" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span>Instagram</span>
              </a>
            </div>

            <div className="mob-footer-pills">
              <Link href="/">Home</Link>
              <Link href="/best/shaders-low-end">Low-End Shaders</Link>
              <Link href="/best/realistic-shaders">RTX Shaders</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/about">About Us</Link>
              <Link href="/sponsor">Sponsor</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>

            <div className="mob-footer-bottom">
              <p className="mob-footer-disclaimer">
                Independent fan site. Not affiliated with Mojang Studios or Microsoft. All resource downloads redirect to <span style={{ color: '#10b981' }}>CurseForge</span>.
              </p>
              <p className="mob-footer-copyright">
                © {new Date().getFullYear()} Creevoxx. All rights reserved.
              </p>
            </div>
          </footer>
        )}
      </div>

      {/* -- Floating Scroll-to-Top Button ---------------- */}
      {showScrollTop && (
        <button
          className="mob-scroll-top-btn"
          onClick={() => document.querySelector(".mob-content")?.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span>Top</span>
        </button>
      )}

      {/* -- Bottom Dock -------------------------------- */}
      <MobileBottomDock
        activeTab={["shaders", "textures", "mods", "maps", "skins"].includes(activeTab) ? "home" : activeTab}
        onTabChange={handleTabChange}
        hidden={showFilter}
      />

      {/* -- Saved Sheet -------------------------------- */}
      {showSaved && <SavedSheet onClose={() => setShowSaved(false)} />}

      {/* -- Filter Sheet -------------------------------- */}
      {showFilter && (
        <FilterSheet
          activeTab={activeTab}
          activeFilter={activeFilter}
          onSelectFilter={handleFilterSelect}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
