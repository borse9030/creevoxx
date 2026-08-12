"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DownloadButtons from "@/components/DownloadButtons";
import AdPlaceholder from "@/components/AdPlaceholder";
import AdCard from "@/components/AdCard";
import MinecraftRunner from "@/components/MinecraftRunner";
import ExtendedSEOArticle from "@/components/ExtendedSEOArticle";

const CATEGORY_ICONS = {
  shaders: "✨",
  textures: "🎨",
  mods: "🔧",
};

export default function ResourceDetailClient({ resource, details, id, factTable, seoSummary, relatedSection }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      const bookmarked = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
      setIsBookmarked(bookmarked.some((item) => item.docId === id));
      
      const liked = JSON.parse(localStorage.getItem("creevoxx_mc_liked") || "[]");
      setIsLiked(liked.includes(id));
    }
  }, [id]);

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    if (!resource) return;
    const docId = id;
    const bookmarked = JSON.parse(localStorage.getItem("creevoxx_mc_bookmarks") || "[]");
    const isSaved = bookmarked.some((item) => item.docId === docId);
    let updated;
    if (isSaved) {
      updated = bookmarked.filter((item) => item.docId !== docId);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarked, { 
        docId, 
        title: details.name || resource.title || docId, 
        category: resource.category, 
        author: details.authors[0]?.name || resource.author || "creator", 
        thumbnail_url: details.logoUrl || resource.thumbnail_url 
      }];
      setIsBookmarked(true);
    }
    localStorage.setItem("creevoxx_mc_bookmarks", JSON.stringify(updated));
    window.dispatchEvent(new Event("creevoxx_bookmarks_updated"));
  };

  const handleLikeToggle = (e) => {
    e.preventDefault();
    const docId = id;
    const liked = JSON.parse(localStorage.getItem("creevoxx_mc_liked") || "[]");
    const isPresent = liked.includes(docId);
    let updated;
    if (isPresent) {
      updated = liked.filter((item) => item !== docId);
      setIsLiked(false);
    } else {
      updated = [...liked, docId];
      setIsLiked(true);
    }
    localStorage.setItem("creevoxx_mc_liked", JSON.stringify(updated));
  };

  // Download modal state
  const [downloadModal, setDownloadModal] = useState({
    isOpen: false,
    timeLeft: 10,
    url: "",
  });
  const [showGame, setShowGame] = useState(false);

  // Countdown timer for download modal
  useEffect(() => {
    let timer;
    if (downloadModal.isOpen && downloadModal.timeLeft > 0) {
      timer = setInterval(() => {
        setDownloadModal((prev) => {
          if (prev.timeLeft <= 1) {
            clearInterval(timer);
            if (prev.url) {
              try {
                // Same-tab download — browser handles file URLs as download
                // without navigating away from the page
                window.location.href = prev.url;
              } catch (e) {
                console.error("Auto download failed", e);
              }
            }
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [downloadModal.isOpen, downloadModal.timeLeft]);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Slideshow state
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  // Fetch comments from Firestore subcollection resources/{id}/comments
  useEffect(() => {
    if (activeTab !== "comments") return;
    
    let cancelled = false;
    async function loadComments() {
      try {
        setCommentsLoading(true);
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebaseConfig");
        
        const commentsRef = collection(db, "resources", id, "comments");
        const q = query(commentsRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (!cancelled) {
          const list = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));
          setComments(list);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => { cancelled = true; };
  }, [id, activeTab]);

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;
      
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;
      
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
      
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;
      
      return "just now";
    } catch {
      return dateStr;
    }
  }

  function formatDownloads(count) {
    if (count === null || count === undefined) return "0";
    return count.toLocaleString();
  }

  function handleCopyId(cfId) {
    if (!cfId) return;
    navigator.clipboard.writeText(cfId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const { title, description, category, version, thumbnail_url, curseforge_url } = resource;
  const icon = CATEGORY_ICONS[category] || "📦";
  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  const authorName = details.authors[0]?.name || "creator";
  const displayLogo = details.logoUrl || thumbnail_url;
  const displayBanner = details.screenshots && details.screenshots.length > 0
    ? details.screenshots[0].url
    : displayLogo;

  const uniqueIntro = (() => {
    const name = details.name || title || id;
    const creator = details.authors?.[0]?.name || authorName || "its creator";
    const cat = categoryLabel ? categoryLabel.toLowerCase() : "minecraft";
    const ver = version || "1.21";

    const intros = [
      `If you want to elevate your Minecraft gameplay, ${name} is a fantastic choice. Developed by ${creator}, this ${cat} offers a fresh way to customize your virtual world. It is fully compatible with Minecraft ${ver} and is highly rated by the community.`,
      `Discover new possibilities in your world with ${name}, a premium ${cat} project created by ${creator}. Designed to run smoothly on Minecraft ${ver}, this addition brings both quality improvements and immersive elements to your setup.`,
      `Looking for the best ${cat} updates? ${name} by ${creator} provides excellent features tailored for Minecraft ${ver} players. It stands out in the ${cat} category for its stability and beautiful execution.`
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % intros.length;
    return intros[index];
  })();

  return (
    <div className="cf-detail-container">
      {/* Horizontal Ad at the very top */}
      <div style={{ marginBottom: "20px", width: "100%" }}>
        <AdCard index={3} layout="horizontal" />
      </div>

      {/* -- BANNER HEADER BLOCK -- */}
      <div className="cf-banner-header">
        <div className="cf-banner-header__bg" style={{ backgroundImage: `url(${displayBanner})` }} />
        <div className="cf-banner-header__inner">
          {/* Top Row with Back Button and Breadcrumbs */}
          <div className="cf-header-top-row">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="cf-back-link"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cf-back-link__icon"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
            <nav className="cf-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Minecraft</Link>
              <span className="cf-breadcrumb__sep">&gt;</span>
              <Link href={`/?category=${category}`}>{categoryLabel}</Link>
              <span className="cf-breadcrumb__sep">&gt;</span>
              <span>{title}</span>
            </nav>
          </div>

          {/* Info row */}
          <div className="cf-header-info">
            {/* Logo */}
            <div className="cf-header-logo">
              {displayLogo && !imgError ? (
                <Image
                  src={displayLogo}
                  alt={`${title} logo`}
                  width={128}
                  height={128}
                  className="cf-header-logo__img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="cf-header-logo__placeholder">{icon}</span>
              )}
            </div>

            {/* Titles & Creator */}
            <div className="cf-header-titles">
              <h1 className="cf-header-title">{details.name || title}</h1>
              <div className="cf-header-author">
                <span>By</span>
                <span className="cf-author-badge">
                  <span className="cf-author-badge__icon">👤</span>
                  {authorName}
                </span>
              </div>
            </div>
          </div>

          {/* Short summary description */}
          <p className="cf-header-summary">{details.summary || description}</p>

          {/* Action Row for Mobile View */}
          <div className="cf-mobile-header-actions">
            <button 
              onClick={(e) => {
                e.preventDefault();
                
                const targetUrl = details.downloadUrl || curseforge_url || "#";
                setDownloadModal({
                  isOpen: true,
                  timeLeft: 10,
                  url: targetUrl
                });
                setShowGame(false);
              }}
              className="cf-download-btn"
              style={{ border: "none", cursor: "pointer", display: "inline-flex", justifyContent: "center", alignItems: "center" }}
            >
              Download
            </button>
            <button 
              className={`cf-action-btn cf-action-btn--star ${isBookmarked ? "cf-action-btn--active" : ""}`}
              onClick={handleBookmarkToggle}
              aria-label="Favorite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button 
              className={`cf-action-btn cf-action-btn--heart ${isLiked ? "cf-action-btn--active" : ""}`}
              onClick={handleLikeToggle}
              aria-label="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          {/* Tabs bar */}
          <div className="cf-header-tabs">
            <button
              className={`cf-tab-btn ${activeTab === "description" ? "cf-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`cf-tab-btn ${activeTab === "comments" ? "cf-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("comments")}
            >
              Comments ({comments.length})
            </button>
            <button
              className={`cf-tab-btn ${activeTab === "gallery" ? "cf-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              Gallery
            </button>
          </div>
        </div>
      </div>

      {/* -- DETAILS MAIN CONTENT GRID -- */}
      <div className="cf-content-grid">
        {/* Left column */}
        <div className="cf-main-content">
          {activeTab === "description" && (
            <div className="cf-description-wrapper">
              {seoSummary}
              {factTable}
              {/* Interactive Screenshots Slideshow Carousel */}
              {details.screenshots && details.screenshots.length > 0 && (
                <div className="cf-slideshow-container">
                  {/* Large main display viewport */}
                  <div className="cf-slideshow-main">
                    <a
                      href={details.screenshots[activeScreenIndex]?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cf-slideshow-main-link"
                    >
                      <Image
                        src={details.screenshots[activeScreenIndex]?.url || ""}
                        alt={`${title} screenshot active`}
                        width={800}
                        height={450}
                        className="cf-slideshow-main__img"
                        unoptimized={true}
                      />
                    </a>
                  </div>

                  {/* Slideshow controls and thumbnails */}
                  <div className="cf-slideshow-controls">
                    {/* Previous Button */}
                    <button
                      type="button"
                      className="cf-slideshow-btn cf-slideshow-btn--prev"
                      onClick={() =>
                        setActiveScreenIndex((prev) =>
                          prev === 0 ? details.screenshots.length - 1 : prev - 1
                        )
                      }
                      aria-label="Previous screenshot"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    {/* Horizontal scrollable thumbnails strip */}
                    <div className="cf-slideshow-thumbnails">
                      {details.screenshots.map((screen, idx) => (
                        <button
                          key={screen.id}
                          type="button"
                          className={`cf-slideshow-thumbnail ${
                            activeScreenIndex === idx ? "cf-slideshow-thumbnail--active" : ""
                          }`}
                          onClick={() => setActiveScreenIndex(idx)}
                          aria-label={`View screenshot ${idx + 1}`}
                        >
                          <Image
                            src={screen.url}
                            alt={`${title} thumbnail ${idx}`}
                            width={160}
                            height={90}
                            className="cf-slideshow-thumbnail__img"
                            unoptimized={true}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      className="cf-slideshow-btn cf-slideshow-btn--next"
                      onClick={() =>
                        setActiveScreenIndex((prev) =>
                          prev === details.screenshots.length - 1 ? 0 : prev + 1
                        )
                      }
                      aria-label="Next screenshot"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic unique intro block for Google AdSense compliance */}
              <div 
                className="cf-description-intro"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.7",
                  color: "#e2e8f0",
                  marginBottom: "24px",
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderLeft: "4px solid var(--color-accent)",
                  borderRadius: "8px"
                }}
              >
                {uniqueIntro}
              </div>

              {details.descriptionHtml ? (
                <div
                  className="cf-description-html"
                  dangerouslySetInnerHTML={{ __html: details.descriptionHtml }}
                />
              ) : (
                <div className="cf-description-fallback">
                  <p className="cf-description-fallback__text">{description}</p>
                </div>
              )}
              <ExtendedSEOArticle 
                resource={resource}
                title={details.name || title} 
                category={category} 
                authorName={authorName} 
                version={version} 
              />
            </div>
          )}

          {activeTab === "comments" && (
            <div className="cf-comments-wrapper">
              <h2 className="cf-section-title">Comments ({comments.length})</h2>

              {/* Comments list */}
              {commentsLoading ? (
                <div style={{ display: "flex", alignItems: "center", padding: "20px 0" }}>
                  <span className="auth-spinner" style={{ marginRight: 8 }} />
                  <span>Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="cf-comments-list">
                  {comments.map((c) => (
                    <div key={c.id} className="cf-comment-item">
                      <div className="cf-comment-header">
                        <div className="cf-comment-user">
                          {c.userPhoto ? (
                            <Image src={c.userPhoto} alt={c.userName} width={40} height={40} className="cf-comment-avatar" />
                          ) : (
                            <div className="cf-comment-avatar-placeholder">
                              {c.userName[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="cf-comment-username">{c.userName}</span>
                        </div>
                        <span className="cf-comment-date">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <p className="cf-comment-text">{c.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cf-comments-empty">No comments yet. Be the first to write one!</p>
              )}
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="cf-gallery-wrapper">
              <h2 className="cf-section-title">Screenshots & Gallery</h2>
              {details.screenshots && details.screenshots.length > 0 ? (
                <div className="cf-gallery-grid">
                  {details.screenshots.map((screen) => (
                    <div key={screen.id} className="cf-gallery-card">
                      <a href={screen.url} target="_blank" rel="noopener noreferrer" className="cf-gallery-link">
                        <Image
                          src={screen.url}
                          alt={screen.title || `${title} screenshot`}
                          width={800}
                          height={450}
                          className="cf-gallery-img"
                          loading="lazy"
                          unoptimized={true}
                        />
                      </a>
                      {screen.title && <span className="cf-gallery-title">{screen.title}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cf-gallery-empty">
                  <span>📷</span>
                  <p>No screenshots available for this project.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="cf-sidebar">
          <div className="cf-sidebar-actions">
            <button 
              onClick={(e) => {
                e.preventDefault();
                
                const targetUrl = details.downloadUrl || curseforge_url || "#";
                setDownloadModal({
                  isOpen: true,
                  timeLeft: 10,
                  url: targetUrl
                });
                setShowGame(false);
              }}
              className="cf-download-btn"
              style={{ border: "none", cursor: "pointer", display: "inline-flex", justifyContent: "center", alignItems: "center" }}
            >
              Download
            </button>
            <button 
              className={`cf-action-btn cf-action-btn--star ${isBookmarked ? "cf-action-btn--active" : ""}`}
              onClick={handleBookmarkToggle}
              aria-label="Favorite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button 
              className={`cf-action-btn cf-action-btn--heart ${isLiked ? "cf-action-btn--active" : ""}`}
              onClick={handleLikeToggle}
              aria-label="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div className="cf-sidebar-card">
            <h2 className="cf-sidebar-card__title">Details</h2>
            
            <div className="cf-details-list">
              <div className="cf-details-row">
                <span className="cf-details-label">Downloads:</span>
                <span className="cf-details-value cf-details-value--bold">
                  {formatDownloads(details.downloadCount)}
                </span>
              </div>
              <div className="cf-details-row">
                <span className="cf-details-label">Created:</span>
                <span className="cf-details-value" suppressHydrationWarning>
                  {details.dateCreated ? timeAgo(details.dateCreated) : "Recently"}
                </span>
              </div>
              <div className="cf-details-row">
                <span className="cf-details-label">Updated:</span>
                <span className="cf-details-value" suppressHydrationWarning>
                  {details.dateModified ? timeAgo(details.dateModified) : "Recently"}
                </span>
              </div>
              <div className="cf-details-row">
                <span className="cf-details-label">Project ID:</span>
                <span className="cf-details-value cf-details-value--id">
                  {details.id || resource.curseforge_id || "N/A"}
                  {(details.id || resource.curseforge_id) && (
                    <button 
                      className="cf-copy-btn" 
                      onClick={() => handleCopyId(details.id || resource.curseforge_id)}
                      title="Copy Project ID"
                    >
                      {copied ? (
                        <span className="cf-copied-text" style={{ fontSize: "0.75rem", color: "var(--color-accent)" }}>✓ Copied</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cf-copy-icon">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  )}
                </span>
              </div>
              <div className="cf-details-row">
                <span className="cf-details-label">License:</span>
                <span className="cf-details-value cf-details-value--underline">
                  All Rights Reserved
                </span>
              </div>
              <div className="cf-details-row">
                <span className="cf-details-label">Environment:</span>
                <span className="cf-details-value">
                  {category === "mods" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, display: 'inline-block', verticalAlign: 'middle'}}>
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                      </svg>
                      Server
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, display: 'inline-block', verticalAlign: 'middle'}}>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                      Client
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Game Versions */}
            {details.gameVersions && details.gameVersions.length > 0 && (
              <div className="cf-sidebar-section">
                <h3 className="cf-sidebar-section__title">Game Versions</h3>
                <div className="cf-badge-flex">
                  {details.gameVersions.map((v) => (
                    <span key={v} className="cf-badge cf-badge--version">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mod Loaders */}
            {details.modLoaders && details.modLoaders.length > 0 && (
              <div className="cf-sidebar-section">
                <h3 className="cf-sidebar-section__title">Mod Loaders</h3>
                <div className="cf-badge-flex">
                  {details.modLoaders.map((l) => (
                    <span key={l} className="cf-badge cf-badge--loader">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="cf-sidebar-card" style={{ marginTop: "24px" }}>
            <h2 className="cf-sidebar-card__title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>🤝 Join Community for Support</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
              Need help installing this resource or want to see more showcases? Join our community!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="https://youtube.com/@creevoxx?si=6an4S31derNpahWX" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,0,0,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ff0000" }}><path d="M2.5 7.1C2.1 8.4 2 10.2 2 12s.1 3.6.5 4.9c.4 1.4 1.5 2.5 2.9 2.9C7.8 20 12 20 12 20s4.2 0 6.6-.2c1.4-.4 2.5-1.5 2.9-2.9.4-1.3.5-3.1.5-4.9s-.1-3.6-.5-4.9C21.1 5.7 20 4.6 18.6 4.2 16.2 4 12 4 12 4s-4.2 0-6.6.2C4 4.6 2.9 5.7 2.5 7.1z"/><path d="m10 15 5-3-5-3v6z"/></svg>
                Subscribe on YouTube
              </a>
              <a href="https://www.instagram.com/creevoxx_shorts/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "0.9rem", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(225,48,108,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#e1306c" }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Follow on Instagram
              </a>
            </div>
          </div>

          <div className="cf-sidebar-ad" style={{ border: "none", background: "none", padding: 0 }}>
            <AdCard index={2} />
          </div>
        </div>
      </div>

      {relatedSection}

      {/* Ad unit placeholder bottom */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <AdPlaceholder size="banner" id="ad-cf-bottom" />
      </div>

      {/* Floating Capsule Timer — top-left, above Vignette ad X button */}
      {downloadModal.isOpen && downloadModal.timeLeft > 0 && (
        <div className="dl-corner-timer" aria-label={`Download in ${downloadModal.timeLeft} seconds`}>
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
                strokeDashoffset={125.6 - (125.6 * (10 - downloadModal.timeLeft)) / 10}
              />
            </svg>
            <div className="dl-corner-content">
              <span className="dl-corner-num">{downloadModal.timeLeft}</span>
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

      {/* Download Timer Modal */}
      {downloadModal.isOpen && (
        <>
          {(downloadModal.timeLeft > 2 || !showGame || downloadModal.timeLeft === 0) ? (
            <div className="download-modal-overlay">
              <div className="download-modal-card">
                <div className="download-modal-drag-bar" aria-hidden="true" />
                <button
                  className="download-modal-close"
                  onClick={() => setDownloadModal({ isOpen: false, timeLeft: 10, url: "" })}
                  aria-label="Cancel download"
                >
                  ✕
                </button>
                {downloadModal.timeLeft === 0 ? (
                  <>
                    <div className="download-modal-icon">✅</div>
                    <h3 className="download-modal-title">Download is Ready</h3>
                    <p className="download-modal-subtitle" style={{ marginBottom: "16px" }}>
                      Your file for <strong style={{ color: "var(--color-accent)" }}>{title}</strong> is ready. If the download did not start automatically, click below:
                    </p>
                    <a
                      href={downloadModal.url}
                      className="download-modal-done-btn"
                      target="_self"
                      onClick={() => setDownloadModal({ isOpen: false, timeLeft: 10, url: "" })}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textDecoration: "none",
                        width: "100%",
                        padding: "14px 20px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Download Now
                    </a>
                    <button
                      className="download-modal-cancel-btn"
                      onClick={() => setDownloadModal({ isOpen: false, timeLeft: 10, url: "" })}
                      style={{ marginTop: "12px" }}
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <div className="download-modal-icon">📦</div>
                    <h3 className="download-modal-title">Preparing your download</h3>
                    <p className="download-modal-subtitle">Your file for <strong style={{ color: "var(--color-accent)" }}>{title}</strong> will start downloading shortly. An ad is showing — please wait.</p>

                    <div className="download-modal-progress-bar" style={{ marginTop: "24px" }}>
                      <div
                        className="download-modal-progress-fill"
                        style={{ width: `${((10 - downloadModal.timeLeft) / 10) * 100}%` }}
                      />
                    </div>
                    <button
                      className="download-modal-cancel-btn"
                      onClick={() => setDownloadModal({ isOpen: false, timeLeft: 10, url: "" })}
                    >
                      Cancel
                    </button>
                    <button
                      className="download-modal-play-btn"
                      onClick={() => setShowGame(true)}
                      style={{ marginTop: "12px" }}
                    >
                      Play Game
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Minimized Circular Countdown Timer */}
              <div className="download-minimized-timer">
                <svg className="timer-svg" viewBox="0 0 100 100">
                  <circle className="timer-bg-circle" cx="50" cy="50" r="45" />
                  <circle 
                    className="timer-fill-circle" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    strokeDasharray="283"
                    strokeDashoffset={(283 - (283 * downloadModal.timeLeft) / 5).toString()}
                  />
                </svg>
                <div className="timer-content">
                  <span className="timer-number">{downloadModal.timeLeft}</span>
                  <span className="timer-label">SECS</span>
                </div>
              </div>

              {/* Game Popup Overlay */}
              <div className="game-popup-overlay" style={{ flexDirection: "column", gap: "20px" }}>
                <div className="download-game-banner">
                  <span className="download-game-banner__spinner" />
                  <span>Please wait... Your download will start in <strong style={{ color: "var(--color-accent)" }}>{downloadModal.timeLeft}s</strong></span>
                </div>
                <MinecraftRunner 
                  onClose={() => setShowGame(false)} 
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
