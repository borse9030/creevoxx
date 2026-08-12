"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import MobileBottomDock from "@/components/MobileBottomDock";
import { useRouter } from "next/navigation";

export default function SavedPageClient() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

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

  const filteredItems = activeFilter === "all"
    ? savedItems
    : savedItems.filter((i) => (i.category || "").toLowerCase() === activeFilter);

  const handleDockTabChange = (tabId) => {
    if (tabId === "home") {
      router.push("/");
    } else if (tabId === "collections") {
      router.push("/?tab=collections");
    } else if (tabId === "search") {
      router.push("/?focus=search");
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
         DESKTOP VIEW (≥769px)
      ══════════════════════════════════════════════ */}
      <div className="desktop-only-wrapper" style={{ minHeight: "100vh", background: "#050d0a", color: "#fff" }}>
        <Navbar />
        
        <main className="main-layout" style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 80px" }}>
          {/* Header section */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "20px", padding: "6px 14px", color: "#ef4444", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "16px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              SAVED LIBRARY
            </div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              My Saved Resources
            </h1>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: "600px" }}>
              Manage your bookmarked Minecraft shaders, texture packs, and mods in one crafted space.
            </p>
          </div>

          {/* Filter Bar */}
          {savedItems.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
              {["all", "shaders", "textures", "mods"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  style={{
                    background: activeFilter === cat ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${activeFilter === cat ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.1)"}`,
                    color: activeFilter === cat ? "#ef4444" : "rgba(255,255,255,0.75)",
                    padding: "8px 18px",
                    borderRadius: "24px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {cat === "all" ? "All Bookmarks" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Saved Items Grid or Empty State */}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "linear-gradient(145deg, rgba(16, 32, 24, 0.4) 0%, rgba(8, 20, 16, 0.6) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>No Saved Resources Found</h3>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", margin: "0 auto 24px", maxWidth: "420px" }}>
                Tap the heart icon on any shader or mod card to save it here for instant access anytime.
              </p>
              <Link href="/" style={{ display: "inline-block", background: "#10b981", color: "#000", fontWeight: 800, padding: "12px 28px", borderRadius: "30px", textDecoration: "none", fontSize: "0.95rem" }}>
                Browse All Shaders →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredItems.map((item) => {
                const itemDocId = item.docId || item.id;
                const itemTitle = item.title || item.name || "Resource";
                const itemAuthor = item.author || "Creator";
                const itemThumb = item.thumbnail_url || item.logoUrl || null;
                const itemCat = (item.category || "shaders").toLowerCase();

                return (
                  <div key={itemDocId} style={{ background: "linear-gradient(145deg, rgba(14, 30, 24, 0.9) 0%, rgba(8, 20, 16, 0.95) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
                    <div style={{ height: "160px", position: "relative", background: "#081410" }}>
                      {itemThumb ? (
                        <Image src={itemThumb} alt={itemTitle} fill style={{ objectFit: "cover" }} unoptimized={true} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>📦</div>
                      )}
                      <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(8, 20, 16, 0.85)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10b981", fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: "8px", textTransform: "uppercase" }}>
                        {itemCat}
                      </span>
                    </div>

                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{itemTitle}</h4>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>by {itemAuthor}</p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Link href={`/resource/${itemDocId}`} style={{ color: "#10b981", fontWeight: 800, textDecoration: "none", fontSize: "0.9rem" }}>
                          View Details →
                        </Link>
                        <button
                          onClick={(e) => removeItem(itemDocId, e)}
                          aria-label="Remove bookmark"
                          style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════
         MOBILE VIEW (≤768px)
      ══════════════════════════════════════════════ */}
      <div className="mobile-only-wrapper mob-app">
        {/* Top App Bar */}
        <div className="mob-topbar">
          <Link href="/" className="mob-brand">
            <div className="mob-brand-logo-container">
              <Image src="/logo.png" alt="Creevoxx" width={44} height={44} style={{ objectFit: "contain" }} unoptimized={true} />
            </div>
            <div className="mob-brand-text">
              <span className="mob-brand-title">CREEVOXX</span>
              <span className="mob-brand-subtitle">MC MODS</span>
            </div>
          </Link>

          <Link href="/?focus=search" className="mob-icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
        </div>

        {/* Scrollable Content Container */}
        <div className="mob-content" style={{ paddingBottom: "100px" }}>
          <div className="mob-saved-page" style={{ padding: "16px" }}>
          <div className="mob-col-header" style={{ marginBottom: "20px" }}>
            <div className="mob-col-badge" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>SAVED LIBRARY</span>
            </div>
            <h2 className="mob-col-title" style={{ fontSize: "1.6rem", fontWeight: 900, margin: "6px 0" }}>Saved Resources</h2>
            <p className="mob-col-sub" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Your bookmarked Minecraft shaders, texture packs &amp; mods.</p>
          </div>

          {savedItems.length > 0 && (
            <div className="mob-saved-filter-row">
              {["all", "shaders", "textures", "mods"].map((f) => (
                <button
                  key={f}
                  className={`mob-saved-filter-pill${activeFilter === f ? " mob-saved-filter-pill--active" : ""}`}
                  onClick={() => setActiveFilter(f)}
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
              <button className="mob-saved-explore-btn" onClick={() => router.push("/")}>
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
      </div>

        {/* Bottom Dock */}
        <MobileBottomDock activeTab="saved" onTabChange={handleDockTabChange} />
      </div>
    </>
  );
}
