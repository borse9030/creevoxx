"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

function formatDownloads(n) {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function MobileResourceDetail({ resource, details, relatedResources, category: activeCategory }) {
  const router = useRouter();
  const title = details.name || resource.title || "Unknown Resource";
  const author = details.authors?.[0]?.name || resource.author || "creator";
  const logo = details.logoUrl || resource.thumbnail_url || resource.logoUrl || null;
  const version = details.gameVersions?.[0] || resource.version || "1.21";
  const supportedVersions = details.gameVersions && details.gameVersions.length > 0
    ? details.gameVersions.slice(0, 6).join(", ")
    : "Minecraft 1.21+";
  const description = details.summary || resource.description || "No description provided.";
  const category = (details.category || resource.category || "mods").toUpperCase();
  const catType = (details.category || resource.category || "mods").toLowerCase();
  const downloadsFormatted = formatDownloads(details.downloadCount || resource.download_count || resource.downloadCount || 0);
  const fileSizeStr = details.fileSize || "N/A";

  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      return saved.some((s) => s.docId === String(resource.docId || resource.id));
    }
    return false;
  });

  const toggleSave = () => {
    const docId = String(resource.docId || resource.id);
    const saved = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
    let updated;
    if (isSaved) {
      updated = saved.filter((s) => s.docId !== docId);
      setIsSaved(false);
    } else {
      updated = [...saved, { docId, title, author, thumbnail_url: logo }];
      setIsSaved(true);
    }
    localStorage.setItem("creevoxx_mc_bookmarks", JSON.stringify(updated));
    window.dispatchEvent(new Event("creevoxx_bookmarks_updated"));
  };

  const [downloadTimer, setDownloadTimer] = useState({
    isOpen: false,
    timeLeft: 10,
    url: "",
  });

  // Countdown logic for mobile download modal
  useEffect(() => {
    let interval;
    if (downloadTimer.isOpen && downloadTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setDownloadTimer((prev) => {
          if (prev.timeLeft <= 1) {
            clearInterval(interval);
            if (prev.url) {
              try {
                // Use same-tab navigation — browser treats file URLs as downloads
                // and does NOT navigate away from the page
                window.location.href = prev.url;
              } catch (e) {}
            }
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [downloadTimer.isOpen, downloadTimer.timeLeft]);

  const handleDownload = () => {
    const targetUrl = details.downloadUrl || resource.curseforge_url;
    if (targetUrl) {
      setDownloadTimer({ isOpen: true, timeLeft: 10, url: targetUrl });
    }
  };

  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);

  const frameRef = useRef(null);
  const handleScroll = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = window.innerWidth * 0.83;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setActiveIdx((prev) => (prev === newIndex ? prev : newIndex));
    });
  };

  return (
    <div className="mob-detail-app">
      {/* -- Top App Bar (Clean header with no redundant top-right save button) -- */}
      <div className="mob-detail-topbar">
        <button className="mob-detail-back" onClick={() => router.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="mob-detail-header-title">{title}</h1>
      </div>

      <div className="mob-detail-scroll">
        {/* -- Image Gallery (Horizontal Scroll) -- */}
        <div className="mob-detail-gallery">
          {(logo ? [{ thumbnailUrl: logo, url: logo }] : []).concat(
            (details.screenshots || []).filter(s => s && (s.thumbnailUrl || s.url))
          ).length > 0 ? (
            (logo ? [{ thumbnailUrl: logo, url: logo }] : []).concat(
              (details.screenshots || []).filter(s => s && (s.thumbnailUrl || s.url))
            ).map((screen, idx) => (
              <div key={idx} className="mob-detail-gallery-item">
                <Image
                  src={screen.thumbnailUrl || screen.url}
                  alt={`Screenshot ${idx}`}
                  width={800}
                  height={450}
                  className="mob-detail-img"
                  loading={idx === 0 ? "eager" : "lazy"}
                  unoptimized={true}
                />
              </div>
            ))
          ) : (
            <div className="mob-detail-gallery-item">
              {logo ? (
                <Image src={logo} alt={title} width={800} height={450} className="mob-detail-img" loading="lazy" unoptimized={true} />
              ) : (
                <div className="mob-detail-img-fallback">No Image</div>
              )}
            </div>
          )}
        </div>

        {/* -- Author & Action Section -- */}
        <div className="mob-detail-author-section">
          <div className="mob-detail-author-info">
            <div className="mob-detail-avatar">
              {author.charAt(0).toUpperCase()}
            </div>
            <div className="mob-detail-author-text">
              <div className="mob-detail-author-name">
                {author}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" style={{ marginLeft: "4px" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" stroke="#081410" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className="mob-detail-author-role">{category} CREATOR</div>
            </div>
          </div>
          <div className="mob-detail-author-actions">
            <button className="mob-detail-action-btn" aria-label="Share" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title,
                  url: window.location.href,
                });
              }
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <button className="mob-detail-action-btn" aria-label={isSaved ? "Unsave" : "Save"} onClick={toggleSave}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isSaved ? "#ef4444" : "none"}
                stroke={isSaved ? "#ef4444" : "currentColor"}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ overflow: "visible" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* -- Quick Resource Specs Grid -- */}
        <div className="mob-detail-specs-grid">
          <div className="mob-detail-spec-card">
            <span className="mob-detail-spec-label">Downloads</span>
            <span className="mob-detail-spec-val">{downloadsFormatted || "—"}</span>
          </div>
          <div className="mob-detail-spec-card">
            <span className="mob-detail-spec-label">Version</span>
            <span className="mob-detail-spec-val">{version}</span>
          </div>
          <div className="mob-detail-spec-card">
            <span className="mob-detail-spec-label">Type</span>
            <span className="mob-detail-spec-val">{category}</span>
          </div>
          <div className="mob-detail-spec-card">
            <span className="mob-detail-spec-label">File Size</span>
            <span className="mob-detail-spec-val">{fileSizeStr}</span>
          </div>
        </div>

        {/* -- Full Detailed Description & Features Section -- */}
        <div className="mob-detail-desc-section">
          <h3 className="mob-detail-section-title">About This {category.toLowerCase()}</h3>
          <p className="mob-detail-desc-text" style={{ marginBottom: "16px" }}>{description}</p>

          {/* Render Full Rich HTML details if available */}
          {details.descriptionHtml ? (
            <div
              className="mob-detail-html-content"
              dangerouslySetInnerHTML={{ __html: details.descriptionHtml }}
            />
          ) : null}
        </div>

        {/* -- Compatibility Box -- */}
        <div className="mob-detail-compat-box">
          <span className="mob-detail-pin">📌</span>
          <span className="mob-detail-compat-text">
            <strong>Supported Minecraft Versions:</strong> {supportedVersions}
          </span>
        </div>

        {/* -- How to Install Guide -- */}
        <div className="mob-detail-desc-section" style={{ paddingTop: 0 }}>
          <h3 className="mob-detail-section-title">How to Install</h3>
          <div className="mob-detail-spec-card" style={{ gap: "8px", padding: "14px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
              {catType === "shaders" ? (
                "1. Download Iris Shader Mod or OptiFine for Minecraft 1.21+.\n2. Open Minecraft and go to Options > Video Settings > Shader Packs.\n3. Tap 'Open Shader Folder' and place the downloaded .zip file inside."
              ) : catType === "textures" ? (
                "1. Download the resource pack .zip file.\n2. Open Minecraft and go to Options > Resource Packs.\n3. Drag and drop the downloaded file into the list and activate it."
              ) : (
                "1. Make sure Minecraft Fabric or Forge launcher is installed.\n2. Place the downloaded .jar or .mcpack file into your Minecraft mods folder.\n3. Launch Minecraft and enjoy!"
              )}
            </p>
          </div>
        </div>

        {/* -- Similar Shaders (Related Section) -- */}
        {relatedResources && relatedResources.length > 0 && (
          <div className="mob-detail-related">
            <h3 className="mob-detail-section-title" style={{ padding: "0 20px" }}>
              Similar {activeCategory === "shaders" ? "Shaders" : activeCategory === "textures" ? "Texture Packs" : "Mods"}
            </h3>
            <div className="mob-detail-similar-scroll" ref={scrollRef} onScroll={handleScroll}>
              {relatedResources.map((r, i) => {
                const rName = r.name || r.title || "Unknown";
                const rAuthor = r.authorNames?.[0] || r.authors?.[0]?.name || r.author || "";
                const rLogo = r.thumbnail_url || r.logoUrl || r.thumbnailUrl || r.logo || null;
                const rSlug = r.docId || r.id || "";
                
                const dist = Math.abs(i - activeIdx);
                const scale = dist === 0 ? 1.02 : 0.93;
                const opacity = dist === 0 ? 1 : 0.78;

                return (
                  <div key={r.docId || r.id || i} className="mhs-item" style={{ transform: `scale(${scale})`, opacity: opacity, transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}>
                    <Link href={`/resource/${rSlug}`} className="mhcard">
                      {rLogo ? (
                        <Image src={rLogo} alt={rName} width={400} height={225} className="mhcard-img" loading="lazy" />
                      ) : (
                        <div className="mhcard-img-fallback"></div>
                      )}
                      <div className="mhcard-top-right">
                        {(r.download_count || r.downloadCount || 0) > 0 && (
                          <span className="mhcard-dl-chip">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            {(r.download_count || r.downloadCount || 0) >= 1000000
                              ? `${((r.download_count || r.downloadCount) / 1000000).toFixed(1)}M`
                              : (r.download_count || r.downloadCount || 0) >= 1000
                              ? `${Math.round((r.download_count || r.downloadCount) / 1000)}K`
                              : String(r.download_count || r.downloadCount)}
                          </span>
                        )}
                      </div>
                      <div className="mhcard-overlay" />
                      <div className="mhcard-info">
                        <h3 className="mhcard-title">{rName}</h3>
                        <div className="mhcard-meta">
                          <div className="mhcard-author">{rAuthor}</div>
                          <button className="mhcard-get">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            Get
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* -- Fixed Download Button -- */}
      <div className="mob-detail-bottom-bar">
        <button className="mob-detail-download-btn" onClick={handleDownload}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
      </div>

      {/* Floating Capsule Timer — top-left, above Vignette ad X button */}
      {downloadTimer.isOpen && downloadTimer.timeLeft > 0 && (
        <div className="dl-corner-timer" aria-label={`Download in ${downloadTimer.timeLeft} seconds`}>
          {/* Ring with number */}
          <div className="dl-corner-ring-wrap">
            <svg className="dl-corner-ring" viewBox="0 0 48 48">
              <circle className="dl-corner-ring-bg" cx="24" cy="24" r="20" />
              <circle
                className="dl-corner-ring-fill"
                cx="24"
                cy="24"
                r="20"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * (10 - downloadTimer.timeLeft)) / 10}
              />
            </svg>
            <div className="dl-corner-content">
              <span className="dl-corner-num">{downloadTimer.timeLeft}</span>
              <span className="dl-corner-label">sec</span>
            </div>
          </div>
          {/* Text info */}
          <div className="dl-corner-info">
            <span className="dl-corner-text">⬇ Downloading</span>
            <span className="dl-corner-name">{title}</span>
          </div>
        </div>
      )}

      {/* ── Mobile Download Timer Modal ── */}
      {downloadTimer.isOpen && (
        <div className="mob-download-overlay">
          <div className="mob-download-sheet">
            <div className="mob-download-drag-bar" />
            <button
              className="mob-download-close"
              onClick={() => setDownloadTimer({ isOpen: false, timeLeft: 10, url: "" })}
              aria-label="Cancel"
            >
              ✕
            </button>

            {downloadTimer.timeLeft === 0 ? (
              <>
                <div className="mob-download-icon">✅</div>
                <h3 className="mob-download-title">Download is Ready!</h3>
                <p className="mob-download-subtitle">
                  Your file for <strong style={{ color: "#10b981" }}>{title}</strong> is ready. If it didn&apos;t start, tap below:
                </p>
                <a
                  href={downloadTimer.url}
                  target="_self"
                  className="mob-download-now-btn"
                  onClick={() => setDownloadTimer({ isOpen: false, timeLeft: 10, url: "" })}
                >
                  Download Now
                </a>
                <button
                  className="mob-download-cancel-btn"
                  onClick={() => setDownloadTimer({ isOpen: false, timeLeft: 10, url: "" })}
                  style={{ marginTop: "12px" }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div className="mob-download-icon">📦</div>
                <h3 className="mob-download-title">Preparing your download</h3>
                <p className="mob-download-subtitle">
                  Your file for <strong style={{ color: "#10b981" }}>{title}</strong> will start shortly. Please wait for the ad.
                </p>

                <div className="mob-download-progress-bar" style={{ marginTop: "24px" }}>
                  <div
                    className="mob-download-progress-fill"
                    style={{ width: `${((10 - downloadTimer.timeLeft) / 10) * 100}%` }}
                  />
                </div>
                <button
                  className="mob-download-cancel-btn"
                  onClick={() => setDownloadTimer({ isOpen: false, timeLeft: 10, url: "" })}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
