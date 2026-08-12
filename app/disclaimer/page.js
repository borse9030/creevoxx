import React from "react";

export const metadata = {
  title: "Disclaimer | Creevoxx MC Mods",
  description: "Read our disclaimer regarding intellectual property rights, non-redistribution, and external download links.",
};

export default function DisclaimerPage() {
  return (
    <div className="container" style={{ maxWidth: "800px", padding: "64px 24px", margin: "0 auto" }}>
      <div style={{
        background: "rgba(18, 26, 21, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "40px",
        boxShadow: "var(--shadow-card)"
      }}>
        <h1 style={{ color: "var(--color-accent)", fontSize: "2.5rem", marginBottom: "24px", fontFamily: "var(--font-heading)" }}>
          Disclaimer
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Last Updated: June 26, 2026
        </p>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "var(--color-text)", fontSize: "1.4rem", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
            Intellectual Property &amp; Non-Redistribution Policy
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Creevoxx MC Mods is a directory site that curates, reviews, and references Minecraft mods, shaders, and texture packs. 
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8", color: "var(--color-accent)", fontWeight: "bold" }}>
            We do NOT host, redistribute, modify, or upload any file/assets directly.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Every resource listed on Creevoxx MC Mods has been verified to point directly to its official source page (e.g., CurseForge, Github, or the creator's official website). We do not host direct download mirrors, repackage ZIP files, or bypass the creators' monetization/download methods.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "var(--color-text)", fontSize: "1.4rem", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
            No Affiliation Statement
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            This website is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Mojang Studios, Microsoft, CurseForge, or any of their partners. "Minecraft" is a registered trademark of Mojang Synergies AB. All original mod, shader, and texture pack assets remain the property of their respective creators.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "var(--color-text)", fontSize: "1.4rem", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
            DMCA &amp; Content Removal
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            If you are the copyright holder of any resource indexed on our website and would like it removed, updated, or credited differently, please contact us immediately at <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>. We will promptly process your request in accordance with intellectual property guidelines within 5 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
