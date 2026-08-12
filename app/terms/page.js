import React from "react";

export const metadata = {
  title: "Terms & Conditions | Creevoxx MC Mods",
  description:
    "Read the full terms of service for Creevoxx MC Mods, covering site usage, copyright compliance, advertising disclosure, prohibited uses, governing law, and dispute resolution.",
};

export default function TermsPage() {
  return (
    <div className="container" style={{ maxWidth: "800px", padding: "64px 24px", margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(18, 26, 21, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <h1
          style={{
            color: "var(--color-accent)",
            fontSize: "2.5rem",
            marginBottom: "24px",
            fontFamily: "var(--font-heading)",
          }}
        >
          Terms &amp; Conditions
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Last Updated: July 12, 2026
        </p>

        {/* 1. Acceptance */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            By accessing and using Creevoxx MC Mods (&quot;the Site&quot;), you agree to be bound by these Terms &amp; Conditions.
            If you do not agree with any part of these terms, you must stop using the Site immediately. We reserve
            the right to update these terms at any time; continued use of the Site after a change constitutes
            acceptance of the revised terms.
          </p>
        </section>

        {/* 2. Intellectual Property & Copyright */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            2. Intellectual Property &amp; Copyright Compliance
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Creevoxx MC Mods operates as an informational directory and curation hub for Minecraft shaders, texture
            packs, and mods.
          </p>
          <p
            style={{ marginBottom: "16px", lineHeight: "1.8", color: "var(--color-accent)" }}
          >
            <strong>Important — file hosting:</strong> We do NOT host, store, copy, redistribute, or distribute any
            game files, mods, or visual assets on our servers. All resources listed on this Site redirect visitors
            to the official project pages on creator-authorized platforms such as CurseForge.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            We respect the intellectual property rights of all mod developers, texture pack designers, and shader
            creators. If you are a creator and believe your work is listed in error, inaccurately attributed, or
            needs updated information, contact us at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span> and we will address your
            request promptly.
          </p>
        </section>

        {/* 3. Advertising Disclosure */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            3. Advertising Disclosure
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            This Site displays advertisements served by Google AdSense. As a Google AdSense publisher, we receive
            revenue when visitors view or interact with ads displayed on our pages. We are disclosing this
            relationship in full compliance with the Federal Trade Commission&apos;s guidelines on endorsements and
            testimonials (16 CFR § 255) and Google AdSense program policies.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            The ads displayed on this Site are chosen and served by Google based on the content of our pages and/or
            your browsing history. We do not choose individual ad creatives or advertisers. The presence of an
            advertisement on this Site does not constitute an endorsement of the advertised product or service by
            Creevoxx MC Mods.
          </p>
          <p style={{ lineHeight: "1.8" }}>
            You can opt out of interest-based advertising from Google at any time via{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)", textDecoration: "underline" }}
            >
              Google Ads Settings
            </a>
            . See our Privacy Policy for full details on how advertising data is handled.
          </p>
        </section>

        {/* 4. Disclaimer of Affiliation */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            4. Disclaimer of Affiliation
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Creevoxx MC Mods is an independent community project. We are not affiliated, associated, authorized,
            endorsed by, or in any way officially connected with Mojang Studios, Microsoft, CurseForge/Overwolf, or
            any of their subsidiaries or affiliates. &quot;Minecraft&quot; is a registered trademark of Mojang Synergies AB.
            All original mod, shader, and texture pack assets remain the intellectual property of their respective
            creators.
          </p>
        </section>

        {/* 5. Prohibited Uses */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            5. Prohibited Uses
          </h2>
          <p style={{ marginBottom: "12px", lineHeight: "1.8" }}>
            When using this Site, you agree not to:
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "24px",
              color: "var(--color-text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Use any automated scraper, bot, or crawler to systematically extract data from the Site without our
              prior written permission.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Attempt to manipulate ad clicks, impressions, or engagement metrics — including clicking your own ads
              or encouraging others to do so — which violates Google AdSense policies and may result in legal action.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Use the Site to distribute malware, phishing content, or any material designed to harm other users or
              their systems.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Reproduce, republish, or redistribute our editorial content (guides, curated collection descriptions,
              original articles) without attribution and a link back to the original page on creevoxx.store.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Interfere with the proper functioning of the Site, its servers, or any connected networks.
            </li>
          </ul>
        </section>

        {/* 6. Limitation of Liability */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            6. Limitation of Liability
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            The content on this Site is provided for informational and convenience purposes only. While we verify
            that resource links direct to legitimate project pages, any files downloaded from third-party domains
            (such as CurseForge) are subject to those platforms&apos; own terms, conditions, and security practices. We
            are not responsible for any issues — including malware, data loss, or account problems — arising from
            files downloaded from third-party sites.
          </p>
          <p style={{ lineHeight: "1.8" }}>
            To the maximum extent permitted by applicable law, Creevoxx MC Mods and its operators shall not be liable
            for any direct, indirect, incidental, special, or consequential damages arising from your use of this
            Site or any content linked from it.
          </p>
        </section>

        {/* 7. Changes to These Terms */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            7. Changes to These Terms
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            We may update these Terms &amp; Conditions from time to time to reflect changes in our practices, applicable
            law, or the services we offer. When we make material changes, we will update the &quot;Last Updated&quot; date at
            the top of this page. We encourage you to review this page periodically. Changes take effect immediately
            upon posting unless otherwise stated. Your continued use of the Site after changes are posted constitutes
            your acceptance of the revised terms.
          </p>
        </section>

        {/* 8. Governing Law */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            8. Governing Law &amp; Jurisdiction
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            These Terms &amp; Conditions are governed by and construed in accordance with applicable laws. We operate
            this Site as an independent project, and any disputes arising from or relating to the use of this Site
            will be handled in good faith through direct communication first. We ask that users contact us at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span> before initiating any formal
            legal proceedings, so we have the opportunity to resolve the matter informally and promptly.
          </p>
        </section>

        {/* 9. Dispute Resolution */}
        <section>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            9. Dispute Resolution
          </h2>
          <p style={{ lineHeight: "1.8" }}>
            If you have a concern or dispute relating to this Site — whether about content accuracy, intellectual
            property, privacy, or advertising — please contact us first at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>. We commit to acknowledging
            all formal disputes within 5 business days and resolving legitimate complaints within 30 days wherever
            reasonably possible. For DMCA or copyright-specific takedown requests, see our{" "}
            <a href="/disclaimer" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              Disclaimer page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
