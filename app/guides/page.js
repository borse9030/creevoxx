import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Minecraft Guides & Installation Hub | Creevoxx MC Mods",
  description: "Learn how to optimize your Minecraft graphics, install shaders with Fabric/Iris, and configure your settings for maximum FPS.",
};

import { ARTICLES } from "./data.js";

export default function GuidesHubPage() {
  return (
    <div className="container" style={{ maxWidth: "1000px", padding: "64px 24px", margin: "0 auto" }}>
      <h1 style={{ 
        color: "var(--color-accent)", 
        fontSize: "2.5rem", 
        marginBottom: "16px", 
        fontFamily: "var(--font-heading)",
        textAlign: "center"
      }}>
        Guides &amp; Installation Hub
      </h1>
      <p style={{ 
        color: "var(--color-text-muted)", 
        textAlign: "center", 
        maxWidth: "600px", 
        margin: "0 auto 48px auto",
        lineHeight: "1.6"
      }}>
        Get the most out of your Minecraft graphics. Read our step-by-step guides written by modding experts to install shaders, resource packs, and improve your performance.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {ARTICLES.map((art) => (
          <div key={art.slug} style={{
            background: "rgba(18, 26, 21, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-card)",
            transition: "transform var(--transition-base), border-color var(--transition-base)"
          }}>
            <span style={{ fontSize: "2rem", marginBottom: "16px", display: "inline-block" }}>{art.icon}</span>
            <h2 style={{ fontSize: "1.25rem", color: "var(--color-text)", marginBottom: "12px", fontFamily: "var(--font-heading)", minHeight: "60px" }}>
              {art.title}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }}>
              {art.excerpt}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "16px", fontSize: "0.8rem", color: "var(--color-text-dim)" }}>
              <span>{art.date}</span>
              <span>{art.readTime}</span>
            </div>
            <Link 
              href={`/guides/${art.slug}`}
              style={{
                display: "block",
                textAlign: "center",
                background: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
                padding: "10px",
                borderRadius: "var(--radius-sm)",
                marginTop: "16px",
                fontWeight: "bold",
                transition: "background var(--transition-fast)"
              }}
            >
              Read Article
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
