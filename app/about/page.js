import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Creevoxx MC Mods — Our Story & Mission",
  description:
    "Learn how Creevoxx MC Mods was built, why it exists, and what makes it different from just browsing CurseForge directly. Our curation philosophy, testing process, and who we are.",
};

export default function AboutPage() {
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
            marginBottom: "12px",
            fontFamily: "var(--font-heading)",
          }}
        >
          About Creevoxx MC Mods
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "36px", fontSize: "0.95rem", lineHeight: "1.6" }}>
          An independent Minecraft resource hub built by players, for players.
        </p>

        {/* Who We Are */}
        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Who We Are
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Creevoxx MC Mods was started by a group of long-time Minecraft players who kept running into the same problem:
            finding reliable shader and mod recommendations without spending hours sifting through outdated forums,
            broken links, or download sites stuffed with misleading advertising. We wanted a fast, honest directory
            that went straight to the point — here is what this shader does, here is who made it, here is where to get
            it safely.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            The site is run independently with no affiliation to Mojang Studios, Microsoft, or CurseForge. We are a
            small team of enthusiasts — not a corporation. The people writing our guides and building our curated
            collections are the same people who spend their evenings playing Minecraft with shaders on.
          </p>
        </section>

        {/* Why We Exist */}
        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Why This Site Exists
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            CurseForge is an incredible platform, but it is optimized for mod developers, not for players trying to
            discover what to download. Its search results surface popular mods by download count, which means a great
            shader released last month competes poorly against something from 2018 with years of accumulated clicks.
            Filtering by Minecraft version, device type (Java vs Bedrock vs MCPE), and quality simultaneously is
            cumbersome, and there is no editorial voice telling you whether something is actually worth your time.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Creevoxx MC Mods solves that. We pull live data from CurseForge so the library is always current, but we
            layer on top of it: hand-curated collections for specific use cases (low-end hardware, PvP, medieval
            builds, RTX), compatibility-tested groupings, and plainly-written installation guides written by people
            who have actually done the installation steps themselves.
          </p>
        </section>

        {/* What Makes Us Different */}
        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            What Makes Us Different
          </h2>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "24px",
              color: "var(--color-text-muted)",
              lineHeight: "1.8",
            }}
          >
            <li style={{ marginBottom: "12px" }}>
              <strong style={{ color: "var(--color-text)" }}>No hosted downloads.</strong> Every resource link on
              this site redirects to the official project page on CurseForge or the creator&apos;s own site. We do not
              repackage, mirror, or modify any files. This keeps your downloads safe and ensures mod creators receive
              the credit and revenue from their work.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong style={{ color: "var(--color-text)" }}>Practical, honest guides.</strong> Our installation
              guides are written to actually work, including the parts other guides skip (what to do when the mods
              folder doesn&apos;t exist, what Java version you need, why your specific error message happens). We do not
              pad them to hit a word count.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong style={{ color: "var(--color-text)" }}>Platform-specific filtering.</strong> Java Edition and
              Bedrock/MCPE are very different games with incompatible mod systems. We filter resources by platform so
              you do not download a Java-only mod and wonder why it doesn&apos;t work on your Android device.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong style={{ color: "var(--color-text)" }}>Curated collections, not just search.</strong> Our
              Best-of pages (Best Low-End Shaders, Best PvP Texture Packs, etc.) are editorially assembled by
              people who have used the resources, not generated automatically from a database.
            </li>
          </ul>
        </section>

        {/* Our Curation Process */}
        <section style={{ marginBottom: "36px" }}>
          <h2
            style={{
              color: "var(--color-text)",
              fontSize: "1.4rem",
              marginBottom: "16px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            Our Curation Process
          </h2>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            When we add a resource to a curated collection or write a guide featuring it, the following steps happen
            first: we verify it installs correctly on the claimed Minecraft version, we check that the download link
            points to the creator&apos;s legitimate project page, and we confirm the resource does what it claims (a
            &quot;low-end shader&quot; that actually runs on modest hardware, a &quot;PvP texture pack&quot; that actually uses short
            sword models). Resources that fail these checks are not featured.
          </p>
          <p style={{ marginBottom: "16px", lineHeight: "1.8" }}>
            Our library index (the main search grid on the homepage) pulls data directly from the CurseForge API, so
            it includes a much wider range of resources than our curated collections. Not everything in that index
            has been manually tested by us — but every curated collection and guide recommendation has.
          </p>
        </section>

        {/* Contact */}
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
            Get in Touch
          </h2>
          <p style={{ lineHeight: "1.8" }}>
            Questions, corrections, creator inquiries, or feedback? Visit our{" "}
            <Link href="/contact" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              Contact page
            </Link>{" "}
            or email us at{" "}
            <span style={{ color: "var(--color-accent)" }}>realcreevoxx@gmail.com</span>. We are a small team and aim
            to respond within 2 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
