"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "creevoxx_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user has not already dismissed the banner
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // If localStorage is blocked (e.g. private browsing with strict settings), show the banner
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // If localStorage is unavailable, the banner won't persist — acceptable fallback
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and advertising consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(10, 20, 15, 0.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(16, 185, 129, 0.3)",
        padding: "20px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "16px",
        justifyContent: "space-between",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Icon + Text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: "1 1 300px", minWidth: 0 }}>
        <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>🍪</span>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.6" }}>
          This site uses cookies and displays ads served by{" "}
          <strong style={{ color: "#fff" }}>Google AdSense</strong> to keep it free. By continuing to
          browse, you consent to the use of cookies for analytics and personalized advertising. You
          can opt out of ad personalization at any time via{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-accent)", textDecoration: "underline" }}
          >
            Google Ads Settings
          </a>
          . See our{" "}
          <Link href="/privacy" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
            Privacy Policy
          </Link>{" "}
          for full details.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
        <button
          id="cookie-consent-accept"
          onClick={handleAccept}
          style={{
            background: "var(--color-accent, #10b981)",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.875rem",
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
