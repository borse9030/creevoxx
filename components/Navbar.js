"use client";
// components/Navbar.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PlayStoreBadge from "./PlayStoreBadge";
export default function Navbar() {
  const router = useRouter();

  const [activeDockTab, setActiveDockTab] = useState("home");
  const [savedItems, setSavedItems] = useState([]);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [showCategoriesDrawer, setShowCategoriesDrawer] = useState(false);

  useEffect(() => {
    // Load initial bookmarks
    const loadBookmarks = () => {
      const stored = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      setSavedItems(stored);
    };
    loadBookmarks();

    // Listen to changes
    window.addEventListener("creevoxx_bookmarks_updated", loadBookmarks);
    return () => window.removeEventListener("creevoxx_bookmarks_updated", loadBookmarks);
  }, []);

  const handleDockClick = (tab) => {
    setActiveDockTab(tab);
    if (tab === "saved") {
      setShowSavedDrawer(true);
      return;
    }
    if (tab === "categories") {
      setShowCategoriesDrawer(true);
      return;
    }

    const isHomePage = window.location.pathname === "/";
    if (isHomePage) {
      if (tab === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (tab === "search") {
        const searchInput = document.getElementById("resource-search");
        if (searchInput) {
          searchInput.focus();
        }
      }
    } else {
      if (tab === "home") {
        router.push("/");
      } else if (tab === "search") {
        router.push("/?focus=search");
      }
    }
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/?category=shaders", label: "Shaders" },
    { href: "/?category=textures", label: "Textures" },
    { href: "/?category=mods", label: "Mods" },
    { href: "/best/shaders-low-end", label: "Low-End Shaders" },
    { href: "/best/realistic-shaders", label: "RTX Shaders" },
    { href: "/saved", label: "Saved" },
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "About" },
  ];



  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo" aria-label="Creevoxx Home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Image 
              src="/logo.png" 
              alt="Creevoxx Logo" 
              width={50} 
              height={50} 
              unoptimized={true}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.4))' }}
            />
            <span className="navbar__logo-text" style={{ fontSize: "1.45rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.01em" }}>
              Creevoxx<span className="navbar__logo-accent" style={{ color: "#10b981" }}>MCMods</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__links" aria-label="Main navigation">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="navbar__link">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth / Socials & App Section */}
          <div className="navbar__auth" style={{ display: "flex", gap: "14px", alignItems: "center", paddingRight: "10px" }}>
            <PlayStoreBadge compact={true} />
            <a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "1.3rem", display: "flex", transition: "color 0.2s" }} aria-label="YouTube">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.1 8.4 2 10.2 2 12s.1 3.6.5 4.9c.4 1.4 1.5 2.5 2.9 2.9C7.8 20 12 20 12 20s4.2 0 6.6-.2c1.4-.4 2.5-1.5 2.9-2.9.4-1.3.5-3.1.5-4.9s-.1-3.6-.5-4.9C21.1 5.7 20 4.6 18.6 4.2 16.2 4 12 4 12 4s-4.2 0-6.6.2C4 4.6 2.9 5.7 2.5 7.1z"/><path d="m10 15 5-3-5-3v6z"/></svg>
            </a>
            <a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "1.3rem", display: "flex", transition: "color 0.2s" }} aria-label="Instagram">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>

        </div>
      </header>



      {/* Mobile Bottom Dock navigation */}
      <nav className="navbar__mobile-dock" aria-label="Mobile navigation dock">
        <button
          className={`mobile-dock__btn ${activeDockTab === "home" ? "mobile-dock__btn--active" : ""}`}
          onClick={() => handleDockClick("home")}
          aria-label="Home"
        >
          <svg aria-hidden="true" className="mobile-dock__svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="mobile-dock__label">Home</span>
        </button>

        <button
          className={`mobile-dock__btn ${activeDockTab === "search" ? "mobile-dock__btn--active" : ""}`}
          onClick={() => handleDockClick("search")}
          aria-label="Search"
        >
          <svg aria-hidden="true" className="mobile-dock__svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="mobile-dock__label">Search</span>
        </button>

        <button
          className={`mobile-dock__btn ${activeDockTab === "categories" ? "mobile-dock__btn--active" : ""}`}
          onClick={() => handleDockClick("categories")}
          aria-label="Categories"
        >
          <svg aria-hidden="true" className="mobile-dock__svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="mobile-dock__label">Categories</span>
        </button>

        <button
          className={`mobile-dock__btn ${activeDockTab === "saved" ? "mobile-dock__btn--active" : ""}`}
          onClick={() => handleDockClick("saved")}
          aria-label={`Saved (${savedItems.length})`}
        >
          <svg aria-hidden="true" className="mobile-dock__svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          <span className="mobile-dock__label">Saved</span>
          {savedItems.length > 0 && (
            <span className="mobile-dock__badge">{savedItems.length}</span>
          )}
        </button>
      </nav>

      {/* Bookmarks Slide-up Sheet */}
      {showSavedDrawer && (
        <div className="saved-drawer-overlay" onClick={() => setShowSavedDrawer(false)}>
          <div className="saved-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="saved-drawer__drag-bar" aria-hidden="true" />
            <div className="saved-drawer__header">
              <h3 className="saved-drawer__title">📑 Bookmarked Resources</h3>
              <button className="saved-drawer__close" onClick={() => setShowSavedDrawer(false)} aria-label="Close bookmarks">✕</button>
            </div>

            <div className="saved-drawer__body">
              {savedItems.length === 0 ? (
                <div className="saved-drawer__empty">
                  <span style={{ fontSize: "2rem" }}>🔖</span>
                  <p style={{ fontWeight: 600, color: "var(--color-text)", margin: "8px 0 4px" }}>No bookmarked resources yet</p>
                  <p className="saved-drawer__empty-hint" style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Click the bookmark icon on any card to save it here.</p>
                </div>
              ) : (
                <div className="saved-drawer__list">
                  {savedItems.map((item) => (
                    <Link
                      key={item.docId}
                      href={`/resource/${item.docId}`}
                      className="saved-drawer__item"
                      onClick={() => setShowSavedDrawer(false)}
                    >
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={`${item.title || "Resource"} icon`}
                          className="saved-drawer__item-thumb"
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                          unoptimized={true}
                        />
                      ) : (
                        <div className="saved-drawer__item-thumb-placeholder">
                          <Image src="/logo.png" alt="Creevoxx Logo" width={20} height={20} style={{ objectFit: "contain" }} unoptimized={true} />
                        </div>
                      )}
                      <div className="saved-drawer__item-details">
                        <h4 className="saved-drawer__item-title">{item.title}</h4>
                        <p className="saved-drawer__item-meta">
                          <span>{item.category === "shaders" ? "✨ Shaders" : item.category === "textures" ? "🎨 Textures" : "🔧 Mods"}</span>
                          {item.author && <span> • By {item.author}</span>}
                        </p>
                      </div>
                      <span className="saved-drawer__item-arrow">➔</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Categories Slide-up Sheet */}
      {showCategoriesDrawer && (
        <div className="saved-drawer-overlay" onClick={() => setShowCategoriesDrawer(false)}>
          <div className="saved-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="saved-drawer__drag-bar" aria-hidden="true" />
            <div className="saved-drawer__header">
              <h3 className="saved-drawer__title">🗂 Select Category</h3>
              <button className="saved-drawer__close" onClick={() => setShowCategoriesDrawer(false)} aria-label="Close categories">✕</button>
            </div>

            <div className="saved-drawer__body" style={{ padding: "16px 20px" }}>
              <div className="mobile-categories-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link
                  href="/"
                  className="mobile-category-item"
                  onClick={() => {
                    setShowCategoriesDrawer(false);
                    handleDockClick("home");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🏡</span> All Resources
                </Link>
                <Link
                  href="/?category=shaders"
                  className="mobile-category-item"
                  onClick={() => {
                    setShowCategoriesDrawer(false);
                    handleDockClick("categories");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>✨</span> Shaders
                </Link>
                <Link
                  href="/?category=textures"
                  className="mobile-category-item"
                  onClick={() => {
                    setShowCategoriesDrawer(false);
                    handleDockClick("categories");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🎨</span> Texture Packs
                </Link>
                <Link
                  href="/?category=mods"
                  className="mobile-category-item"
                  onClick={() => {
                    setShowCategoriesDrawer(false);
                    handleDockClick("categories");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🔧</span> Mods
                </Link>
                
                <div style={{ fontSize: "0.85rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "1px", margin: "16px 0 8px", fontWeight: 700 }}>
                  🔥 Popular Collections
                </div>

                <Link
                  href="/best/shaders-low-end"
                  className="mobile-category-item"
                  onClick={() => setShowCategoriesDrawer(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>📱</span> Low-End Shaders
                </Link>
                <Link
                  href="/best/realistic-shaders"
                  className="mobile-category-item"
                  onClick={() => setShowCategoriesDrawer(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>✨</span> Realistic Shaders
                </Link>
                <Link
                  href="/best/rtx-texture-packs"
                  className="mobile-category-item"
                  onClick={() => setShowCategoriesDrawer(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🎨</span> RTX Texture Packs
                </Link>
                <Link
                  href="/best/pvp-texture-packs"
                  className="mobile-category-item"
                  onClick={() => setShowCategoriesDrawer(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>⚔️</span> PvP Resource Packs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





