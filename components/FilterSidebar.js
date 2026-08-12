"use client";
import { useState, useRef, useEffect } from "react";
import AdPlaceholder from "./AdPlaceholder";
import AdCard from "./AdCard";

const VERSIONS = ["1.21", "1.20", "1.19", "1.18", "1.17", "1.16"];
const SORT_OPTIONS = [
  { value: "downloads", label: "🔥 Most Downloaded" },
  { value: "newest", label: "⬆ Newest First" },
  { value: "oldest", label: "⬇ Oldest First" },
  { value: "alpha", label: "🔤 Alphabetical" },
];

export default function FilterSidebar({ selectedVersions, onVersionToggle, sortOrder, onSortChange }) {
  const [sortOpen, setSortOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const dropdownRef = useRef(null);
  const versionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSortOpen(false);
      }
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(event.target)) {
        setVersionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortOrder)?.label || "Sort Options";

  return (
    <aside className="filter-sidebar" aria-label="Filter and sort resources">
      {/* Version Filter */}
      <div className="filter-section filter-section--version" ref={versionDropdownRef}>
        <h3 className="filter-section__title filter-section__title--version-desktop">Minecraft Version</h3>
        
        {/* Desktop Version List */}
        <div className="filter-version-list" role="group" aria-label="Select Minecraft version">
          {VERSIONS.map((v) => {
            const checked = selectedVersions.includes(v);
            return (
              <label key={v} className={`filter-version-item ${checked ? "filter-version-item--checked" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onVersionToggle(v)}
                  aria-label={`Filter by Minecraft ${v}`}
                  className="filter-version-input"
                />
                <span className="filter-version-badge">{v}</span>
                <span className={`filter-version-check ${checked ? "visible" : ""}`}>✓</span>
              </label>
            );
          })}
        </div>

        {/* Mobile Version Selector Trigger Button */}
        <div className="version-dropdown-mobile">
          <button
            type="button"
            className="version-dropdown-mobile__button"
            onClick={() => setVersionOpen(true)}
          >
            <span>Minecraft Version</span>
            <span className="version-dropdown-mobile__arrow">▾</span>
          </button>
        </div>

        {/* Mobile Version Popup Modal */}
        {versionOpen && (
          <div className="version-popup-overlay" onClick={() => setVersionOpen(false)}>
            <div className="version-popup-card" onClick={(e) => e.stopPropagation()}>
              <div className="version-popup-header">
                <h3 className="version-popup-title">Minecraft Version</h3>
                <button
                  type="button"
                  className="version-popup-close"
                  onClick={() => setVersionOpen(false)}
                  aria-label="Close version selector"
                >
                  &times;
                </button>
              </div>
              <ul className="version-popup-list" role="listbox" aria-label="Select Minecraft version">
                {VERSIONS.map((v) => {
                  const checked = selectedVersions.includes(v);
                  return (
                    <li
                      key={v}
                      role="option"
                      aria-selected={checked}
                      className={`version-popup-item ${checked ? "version-popup-item--active" : ""}`}
                      onClick={() => onVersionToggle(v)}
                    >
                      <span>{v}</span>
                      <span className={`version-popup-check ${checked ? "visible" : ""}`}>✓</span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="version-popup-done-btn"
                onClick={() => setVersionOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sort Order */}
      <div className="filter-section filter-section--sort">
        <h3 className="filter-section__title">Sort By</h3>
        <div className="sort-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="sort-dropdown__button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSortOpen((prev) => !prev);
            }}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            {activeSortLabel}
            <span className="sort-dropdown__arrow">▾</span>
          </button>

          {sortOpen && (
            <ul className="sort-dropdown__list" role="listbox" aria-label="Sort options">
              {SORT_OPTIONS.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={sortOrder === opt.value}
                  className={`sort-dropdown__item ${sortOrder === opt.value ? "sort-dropdown__item--active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSortChange(opt.value);
                    setSortOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }
                  }}
                  tabIndex={0}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* -- ADSENSE UNIT 2: Sidebar 300×250 -- */}
      <div className="filter-section filter-section--ad" style={{ border: "none", background: "none", padding: 0 }}>
        <AdCard index={1} />
      </div>
    </aside>
  );
}
