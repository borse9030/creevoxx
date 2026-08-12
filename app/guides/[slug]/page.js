import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../data";

export async function generateMetadata({ params }) {
  // Fix Next.js 15: params is a promise
  const resolvedParams = await params;
  const article = ARTICLES.find((a) => a.slug === resolvedParams.slug);

  if (!article) return { title: "Not Found" };

  // Convert human-readable date (e.g. "June 24, 2026") to ISO 8601
  const publishedDate = new Date(article.date);
  const publishedIso = !isNaN(publishedDate.getTime()) ? publishedDate.toISOString() : undefined;

  return {
    title: `${article.title} | Creevoxx MC Mods`,
    description: article.excerpt,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.creevoxx.dev/guides/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${article.title} | Creevoxx MC Mods`,
      description: article.excerpt,
      type: "article",
      url: `https://www.creevoxx.dev/guides/${resolvedParams.slug}`,
      publishedTime: publishedIso,
      authors: ["https://www.creevoxx.dev"],
      images: [
        {
          url: "https://www.creevoxx.dev/og-default.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Creevoxx MC Mods`,
      description: article.excerpt,
      images: ["https://www.creevoxx.dev/og-default.png"],
    },
  };
}

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function GuidePage({ params }) {
  // Fix Next.js 15: params is a promise
  const resolvedParams = await params;
  const article = ARTICLES.find((a) => a.slug === resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // BreadcrumbList JSON-LD structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.creevoxx.dev/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: "https://www.creevoxx.dev/guides",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://www.creevoxx.dev/guides/${article.slug}`,
      },
    ],
  };

  // Article JSON-LD structured data
  // datePublished MUST be ISO 8601 — Google ignores human-readable dates.
  const publishedDateIso = (() => {
    const d = new Date(article.date);
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  })();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    ...(publishedDateIso ? { datePublished: publishedDateIso, dateModified: publishedDateIso } : {}),
    author: {
      "@type": "Organization",
      name: "Creevoxx MC Mods",
      url: "https://www.creevoxx.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "Creevoxx MC Mods",
      url: "https://www.creevoxx.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://www.creevoxx.dev/og-default.png",
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.creevoxx.dev/guides/${article.slug}`,
    },
    image: {
      "@type": "ImageObject",
      url: "https://www.creevoxx.dev/og-default.png",
      width: 1200,
      height: 630,
    },
  };

  return (
    <div className="container" style={{ maxWidth: "800px", padding: "64px 24px", margin: "0 auto" }}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* --- Breadcrumb Navigation --------------------------- */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "32px",
          fontSize: "0.875rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          aria-label="Go to home page"
        >
          Home
        </Link>
        <span style={{ color: "var(--color-text-dim)", userSelect: "none" }} aria-hidden="true">
          /
        </span>
        <Link
          href="/guides"
          style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          aria-label="Go to guides hub"
        >
          Guides
        </Link>
        <span style={{ color: "var(--color-text-dim)", userSelect: "none" }} aria-hidden="true">
          /
        </span>
        <span style={{ color: "var(--color-accent)" }} aria-current="page">
          {article.title}
        </span>
      </nav>

      <div
        style={{
          background: "rgba(18, 26, 21, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-card)",
          lineHeight: "1.8",
        }}
      >
        <h1 style={{ color: "var(--color-accent)", fontSize: "2.2rem", marginBottom: "20px", fontFamily: "var(--font-heading)" }}>
          {article.title}
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "32px", fontSize: "0.9rem" }}>
          Published:{" "}
          <time dateTime={new Date(article.date).toISOString().split("T")[0]}>
            {article.date}
          </time>
          {" "}· {article.readTime}
        </p>

        <div className="guide-content" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Back link at bottom */}
        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
          <Link
            href="/guides"
            style={{
              color: "var(--color-accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            ← Back to Guides Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
