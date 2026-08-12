"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const safetyTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const startLoading = () => {
    setLoading(true);
    setProgress(10);

    // Animate progress bar up to ~85% — it completes to 100% when pathname changes
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(progressIntervalRef.current); return 85; }
        // Slow down as it approaches 85% (feels realistic)
        return prev + Math.random() * (prev < 40 ? 8 : prev < 65 ? 4 : 1);
      });
    }, 200);

    // Safety: clear after 15s if navigation somehow never completes
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current);
      setProgress(100);
      setTimeout(() => { setLoading(false); setProgress(0); }, 300);
    }, 15000);
  };

  const stopLoading = () => {
    clearInterval(progressIntervalRef.current);
    clearTimeout(safetyTimerRef.current);
    setProgress(100);
    setTimeout(() => { setLoading(false); setProgress(0); }, 300);
  };

  useEffect(() => {
    // Route resolved — finish the bar
    stopLoading();
  }, [pathname, searchParams]); // eslint-disable-line

  useEffect(() => {
    const handleAnchorClick = (e) => {
      // If a child element already called preventDefault() (e.g. a button inside a Link),
      // Next.js will skip navigation — so we must skip the loader too, otherwise it loads forever.
      if (e.defaultPrevented) return;

      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        href &&
        (href.startsWith("/") || href.startsWith(window.location.origin)) &&
        !href.includes("#") &&
        targetAttr !== "_blank"
      ) {
        const urlPath = href.startsWith("/") ? href : href.slice(window.location.origin.length);
        const currentUrl = window.location.pathname + window.location.search;
        if (urlPath !== currentUrl) {
          startLoading();
        }
      }
    };

    const handleCustomLoading = () => startLoading();

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("creevoxx_loading_started", handleCustomLoading);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("creevoxx_loading_started", handleCustomLoading);
      clearTimeout(safetyTimerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, []); // eslint-disable-line

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 99999,
        background: "rgba(16,185,129,0.15)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #10b981, #34d399)",
          transition: "width 0.2s ease, opacity 0.3s ease",
          boxShadow: "0 0 8px #10b981",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderContent />
    </Suspense>
  );
}
