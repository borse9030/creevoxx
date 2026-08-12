"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function MobileBottomDock({ activeTab, onTabChange, hidden }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "search",
      label: "Search",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      id: "collections",
      label: "Collections",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      id: "saved",
      label: "Saved",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      ),
    },
  ];

  const handleTab = (tab) => {
    if (tab.id === "saved") {
      router.push("/saved");
      return;
    }
    if (pathname === "/saved") {
      if (tab.id === "home") {
        router.push("/");
      } else if (tab.id === "collections") {
        router.push("/?tab=collections");
      } else if (tab.id === "search") {
        router.push("/?focus=search");
      }
      return;
    }
    if (tab.id === "search") {
      const input = document.getElementById("mobile-app-search");
      if (input) input.focus();
    }
    onTabChange(tab.id);
  };

  return (
    <div className={`mob-dock${hidden ? " mob-dock--hidden" : ""}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`mob-dock-btn${isActive ? " mob-dock-btn--active" : ""}`}
            onClick={() => handleTab(tab)}
            aria-label={tab.label}
          >
            <div className="mob-dock-icon">{tab.icon}</div>
            <span className="mob-dock-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
