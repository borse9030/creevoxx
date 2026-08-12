"use client";
// components/LiveStatsClient.js
// Fetches live stats from /api/stats after hydration (client-side only).
// This keeps the homepage SSR fast — no getLiveStats() blocking the server render.
// Stats are shown immediately as zeros/loading, then updated once the fetch resolves.

import { useEffect, useState } from "react";

// Format a raw count into a display string like "9.4K", "1.2M", "10K+"
function formatHeroStat(n) {
  if (!n || n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Renders the hero stats block (Total Resources, Shader Packs, Texture Packs,
 * Mods & Addons) and populates the numbers client-side after the page loads.
 *
 * Props:
 *  - initialStats: optional fallback object { total, shaders, textures, mods }
 *    passed from the server (e.g. from searchData.counts).
 */
export default function LiveStatsClient({ initialStats = null }) {
  const [stats, setStats] = useState(initialStats || null);

  useEffect(() => {
    // Fetch from the edge-cached stats endpoint.
    // If the response is already cached in the CDN this completes in <50 ms.
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.total > 0 || data.shaders > 0)) {
          setStats(data);
        }
      })
      .catch(() => {
        // Non-fatal: keep whatever initialStats we have
      });
  }, []);

  // While loading, show placeholders so layout doesn't shift
  const s = stats || { total: 0, shaders: 0, textures: 0, mods: 0 };

  return (
    <div className="hero__stats" role="list" aria-label="Resource statistics">
      <div className="hero__stat" role="listitem">
        <span className="hero__stat-num">{formatHeroStat(s.total)}</span>
        <span className="hero__stat-label">Total Resources</span>
      </div>
      <div className="hero__stat" role="listitem">
        <span className="hero__stat-num">{formatHeroStat(s.shaders)}</span>
        <span className="hero__stat-label">Shader Packs</span>
      </div>
      <div className="hero__stat" role="listitem">
        <span className="hero__stat-num">{formatHeroStat(s.textures)}</span>
        <span className="hero__stat-label">Texture Packs</span>
      </div>
      <div className="hero__stat" role="listitem">
        <span className="hero__stat-num">{formatHeroStat(s.mods)}</span>
        <span className="hero__stat-label">Mods &amp; Addons</span>
      </div>
    </div>
  );
}
