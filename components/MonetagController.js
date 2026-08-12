"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_GENERAL_ADS = 2;   // Max popunders from anywhere on the page
const MAX_DOWNLOAD_ADS = 1;  // Max popunders specifically from download button clicks

// Helper: open the Monetag smartlink as a true pseudo-popunder
function firePopunder() {
  try {
    const adWin = window.open("https://omg10.com/4/11384572", "_blank");
    if (adWin) {
      adWin.blur();    // push ad tab to background
      window.focus();  // snap focus back to the current page
    }
  } catch (err) {
    console.error("Ad blocked by browser:", err);
  }
}

export default function MonetagController() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return;

    // Disable ads in development mode (npm run dev)
    if (process.env.NODE_ENV === "development") {
      return;
    }

    // Disable ads on the sponsor page
    if (pathname && pathname.startsWith('/sponsor')) {
      return;
    }

    // --- Handler 1: Download button clicks (separate counter, max 1 ad) ---
    const handleDownloadClick = (e) => {
      const isDownloadBtn =
        e.target.closest(".cf-download-btn") ||
        e.target.closest(".mob-detail-download-btn");

      if (!isDownloadBtn) return;

      const dlAdCount = parseInt(
        sessionStorage.getItem("creevoxx_dl_ad_count") || "0",
        10
      );
      if (dlAdCount >= MAX_DOWNLOAD_ADS) return;

      sessionStorage.setItem("creevoxx_dl_ad_count", (dlAdCount + 1).toString());
      firePopunder();
    };

    // --- Handler 2: General page clicks (excludes download button, max 2 ads) ---
    const handleGeneralClick = (e) => {
      // Skip download button clicks — they are handled separately above
      if (
        e.target.closest(".cf-download-btn") ||
        e.target.closest(".mob-detail-download-btn")
      ) {
        return;
      }

      const adCount = parseInt(
        sessionStorage.getItem("creevoxx_ad_count") || "0",
        10
      );
      if (adCount >= MAX_GENERAL_ADS) return;

      sessionStorage.setItem("creevoxx_ad_count", (adCount + 1).toString());
      firePopunder();
    };

    document.addEventListener("click", handleDownloadClick);
    document.addEventListener("click", handleGeneralClick);

    return () => {
      document.removeEventListener("click", handleDownloadClick);
      document.removeEventListener("click", handleGeneralClick);
    };
  }, []);

  return null;
}
