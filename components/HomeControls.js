"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CategoryTabs, { DeviceTabs } from "./CategoryTabs";
import FilterSidebar from "./FilterSidebar";

export function CategoryTabsUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "shaders";

  const handleChange = (category) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    params.delete("page");
    window.dispatchEvent(new Event("creevoxx_loading_started"));
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return <CategoryTabs active={active} onChange={handleChange} />;
}

export function DeviceTabsUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("device") || "all";

  const handleChange = (device) => {
    const params = new URLSearchParams(searchParams.toString());
    if (device === "all") {
      params.delete("device");
    } else {
      params.set("device", device);
    }
    params.delete("page");
    window.dispatchEvent(new Event("creevoxx_loading_started"));
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return <DeviceTabs active={active} onChange={handleChange} />;
}

export function EditionSelectorUrl({ defaultEdition = "pocket" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const edition = searchParams.get("edition") || defaultEdition;

  const setEdition = (ed) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("edition") === ed) {
      params.delete("edition");
    } else {
      params.set("edition", ed);
    }
    params.delete("page");
    window.dispatchEvent(new Event("creevoxx_loading_started"));
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="edition-selector" aria-label="Minecraft Edition">
      <button
        className={`edition-btn ${edition === "pocket" ? "edition-btn--active" : ""}`}
        onClick={() => setEdition("pocket")}
        aria-pressed={edition === "pocket"}
      >
        <span>📱</span> Pocket (MCPE)
      </button>
      <button
        className={`edition-btn ${edition === "bedrock" ? "edition-btn--active" : ""}`}
        onClick={() => setEdition("bedrock")}
        aria-pressed={edition === "bedrock"}
      >
        <span>🪨</span> Bedrock
      </button>
      <button
        className={`edition-btn ${edition === "java" ? "edition-btn--active" : ""}`}
        onClick={() => setEdition("java")}
        aria-pressed={edition === "java"}
      >
        <span>☕</span> Java
      </button>
    </div>
  );
}

export function SearchInputUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debounceRef = useRef(null);
  // Tracks if the user is currently typing so we don't overwrite their input
  // when the URL updates from a previous debounced navigation.
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    // Only sync value from URL when the user is NOT actively typing
    if (!isTypingRef.current) {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    // Mark as typing — block URL→input sync
    isTypingRef.current = true;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    // Consider "stopped typing" after 800ms of no input
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 800);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val.trim()) {
        params.set("q", val);
        params.delete("category");
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/?${params.toString()}`, { scroll: false });
    }, 1500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isTypingRef.current = false;
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
      params.delete("category");
    } else {
      params.delete("q");
    }
    params.delete("page");
    const newUrl = `/?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;
    // Only show loader + navigate if the URL is actually changing
    if (newUrl !== currentUrl) {
      window.dispatchEvent(new Event("creevoxx_loading_started"));
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <form className="search-wrap" role="search" onSubmit={handleSearch}>
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        id="resource-search"
        className="search-input"
        placeholder="Search resources..."
        value={searchQuery}
        onChange={handleChange}
        aria-label="Search resources"
      />
      <button type="submit" className="search-submit-btn" aria-label="Search">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </form>
  );
}

export function FilterSidebarUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedVersions = searchParams.get("version") 
    ? searchParams.get("version").split(",") 
    : [];

  const sortOrder = searchParams.get("sort") || "downloads";

  const handleVersionToggle = (v) => {
    const params = new URLSearchParams(searchParams.toString());
    let nextVersions = [...selectedVersions];
    if (nextVersions.includes(v)) {
      nextVersions = nextVersions.filter((x) => x !== v);
    } else {
      nextVersions.push(v);
    }
    
    if (nextVersions.length > 0) {
      params.set("version", nextVersions.join(","));
    } else {
      params.delete("version");
    }
    params.delete("page");
    window.dispatchEvent(new Event("creevoxx_loading_started"));
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    window.dispatchEvent(new Event("creevoxx_loading_started"));
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <FilterSidebar
      selectedVersions={selectedVersions}
      onVersionToggle={handleVersionToggle}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
    />
  );
}

export function PaginationUrl({ totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const getPageHref = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `/?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== "..." &&
        pages.length > 0
      ) {
        pages.push("...");
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="cf-pagination" aria-label="Pagination Navigation">
      {currentPage === 1 ? (
        <button
          className="cf-pagination-btn"
          disabled
          aria-label="Go to previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
      ) : (
        <Link
          href={getPageHref(currentPage - 1)}
          className="cf-pagination-btn"
          aria-label="Go to previous page"
          onClick={() => window.dispatchEvent(new Event("creevoxx_loading_started"))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Link>
      )}

      {getPageNumbers().map((page, idx) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${idx}`} className="cf-pagination-ellipsis" aria-hidden="true">
              ...
            </span>
          );
        }

        if (currentPage === page) {
          return (
            <button
              key={`page-${page}`}
              className="cf-pagination-btn cf-pagination-btn--active"
              aria-current="page"
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        }

        return (
          <Link
            key={`page-${page}`}
            href={getPageHref(page)}
            className="cf-pagination-btn"
            aria-label={`Go to page ${page}`}
            onClick={() => window.dispatchEvent(new Event("creevoxx_loading_started"))}
          >
            {page}
          </Link>
        );
      })}

      {currentPage === totalPages ? (
        <button
          className="cf-pagination-btn"
          disabled
          aria-label="Go to next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
      ) : (
        <Link
          href={getPageHref(currentPage + 1)}
          className="cf-pagination-btn"
          aria-label="Go to next page"
          onClick={() => window.dispatchEvent(new Event("creevoxx_loading_started"))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Link>
      )}
    </nav>
  );
}
