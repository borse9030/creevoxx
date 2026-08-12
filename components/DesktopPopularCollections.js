"use client";

import React from "react";
import Link from "next/link";

const POPULAR_COLLECTIONS = [
  {
    id: "performance",
    title: "Performance & Low-End Hub",
    subtitle: "High FPS shaders & performance mods for budget PCs & mobile.",
    badge: "1.21+ FPS Gains",
    accentColor: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    links: [
      { label: "Best Low-End Shaders", href: "/best/shaders-low-end" },
      { label: "MCPE Performance Mods", href: "/best/performance-mods-mcpe" },
      { label: "Sodium & Iris Shader Setup", href: "/guides" },
    ],
  },
  {
    id: "rtx",
    title: "Realism & RTX Graphics",
    subtitle: "PBR texture packs & path-traced shaders for high-end rigs.",
    badge: "RTX & PBR",
    accentColor: "#06b6d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    ),
    links: [
      { label: "Realistic RTX Shaders", href: "/best/realistic-shaders" },
      { label: "RTX Texture Packs for Bedrock", href: "/best/rtx-texture-packs" },
      { label: "Cinematic Lighting Packs", href: "/?category=shaders&sort=downloads" },
    ],
  },
  {
    id: "platform",
    title: "Platform Compatibility",
    subtitle: "Tailored shader & texture downloads for MCPE, Android & iOS.",
    badge: "Bedrock & MCPE",
    accentColor: "#8b5cf6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
      </svg>
    ),
    links: [
      { label: "Minecraft PE Shaders 1.21", href: "/best/mcpe-shaders-1-21" },
      { label: "Shaders for Android & iOS", href: "/best/shaders-for-android" },
      { label: "Bedrock Resource Packs", href: "/?category=textures&edition=bedrock" },
    ],
  },
  {
    id: "classic-shaders",
    title: "Classic & Non-RenderDragon Shaders",
    subtitle: "Pre-RenderDragon shaders, Vanilla+ lighting & classic Bedrock graphic packs.",
    badge: "Classic & Vanilla+",
    accentColor: "#a855f7",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M18 11V4l-2 2-2-2-2 2-2-2-2 2-2-2v7"/>
      </svg>
    ),
    links: [
      { label: "Classic Bedrock Shaders", href: "/?category=shaders&q=classic&edition=pocket" },
      { label: "Vanilla+ Default Shaders", href: "/?category=shaders&q=vanilla&edition=pocket" },
      { label: "Lite Non-RenderDragon Shaders", href: "/?category=shaders&q=lite&edition=pocket" },
    ],
  },
  {
    id: "gameplay",
    title: "Gameplay & Vibe",
    subtitle: "Clean PvP packs, medieval textures & fantasy world mods.",
    badge: "PvP & Fantasy",
    accentColor: "#f59e0b",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/>
        <polyline points="9.5 6.5 21 18 21 21 18 21 6.5 9.5"/><line x1="5" x2="11" y1="5" y2="11"/>
      </svg>
    ),
    links: [
      { label: "Top PvP Texture Packs", href: "/best/pvp-texture-packs" },
      { label: "Medieval Texture Packs", href: "/best/medieval-texture-packs" },
      { label: "Adventure & RPG Mods", href: "/?category=mods" },
    ],
  },
];

export default function DesktopPopularCollections() {
  return (
    <section className="desktop-collections-section">
      <div className="desk-col-header">
        <div className="desk-col-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span>CURATED HUB</span>
        </div>
        <h2 className="desk-col-title">Popular Collections &amp; Categories</h2>
        <p className="desk-col-sub">Hand-picked Minecraft resource collections categorized by FPS gains, graphics, and playstyle.</p>
      </div>

      <div className="desk-col-grid">
        {POPULAR_COLLECTIONS.map((col) => (
          <div key={col.id} className="desk-col-card" style={{ "--desk-col-accent": col.accentColor }}>
            <div className="desk-col-card-top">
              <div className="desk-col-icon-wrapper">{col.icon}</div>
              <span className="desk-col-pill-badge">{col.badge}</span>
            </div>

            <h3 className="desk-col-card-title">{col.title}</h3>
            <p className="desk-col-card-sub">{col.subtitle}</p>

            <div className="desk-col-links">
              {col.links.map((lnk, idx) => (
                <Link key={idx} href={lnk.href} className="desk-col-link-btn">
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
    </section>
  );
}
