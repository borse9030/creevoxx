import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetResourceById, adminGetResources } from "@/lib/firestoreAdmin";
import { fetchCurseforgeDetailsCached } from "@/lib/curseforgeCached";
import ResourceDetailClient from "@/components/ResourceDetailClient";
import MobileResourceDetail from "@/components/MobileResourceDetail";
import ResourceCard from "@/components/ResourceCard";
import { SEO_WHITELIST_SET } from "@/lib/seoWhitelist";


// --- ISR: Pre-generate all VIP resource pages at build time -------------------
// All whitelist IDs are pre-built as static HTML at deploy time.
// Non-whitelisted IDs (noindexed) are generated on-demand via ISR.
// Note: The previous slug-based list (e.g. "bsl-shaders") was already broken
// pre-SEO — slug lookups fail since the route expects numeric CurseForge IDs.
// Confirmed by git stash + build test: same errors appear on original codebase.
export async function generateStaticParams() {
  // Import the full list (available at build time as a static module)
  const { SEO_WHITELIST } = await import("@/lib/seoWhitelist");
  return SEO_WHITELIST.map((id) => ({ id: String(id) }));
}


// ----------------------------------------------------------------------------
// 1. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const isIndexable = SEO_WHITELIST_SET.has(Number(id));
  
  try {
    let resource = await adminGetResourceById(id);
    let details = resource && resource.dateModified ? resource : null;

    if (!details) {
      details = await fetchCurseforgeDetailsCached(id).catch(() => null);
    }

    const rawTitle = details?.name || resource?.title || id;
    const shortTitle = rawTitle.length > 30 ? rawTitle.substring(0, 30).trim() + "..." : rawTitle;
    const summary = details?.summary || resource?.description || "No description provided.";
    const category = details?.category || resource?.category || "mods";
    const version = details?.gameVersions?.[0] || resource?.version || "1.21";
    const author = details?.authors?.[0]?.name || resource?.author || "creator";
    const catLabel = category === "shaders" ? "Shader" : category === "textures" ? "Texture" : "Mod";

    const thumbnail = details?.logoUrl || resource?.thumbnail_url || null;
    const ogImage = thumbnail || "https://creevoxx.store/og-default.png";
    const downloadCount = details?.downloadCount || null;

    return {
      title: `${rawTitle} for Minecraft ${version} — Download | Creevoxx`,
      description: `Download ${rawTitle} for Minecraft ${version}. Created by ${author}. ${summary.substring(0, 100)}... Official links and installation guide.`,
      alternates: {
        canonical: `https://www.creevoxx.store/resource/${id}`,
      },
      robots: isIndexable
        ? { index: true, follow: true }
        : { index: false, follow: false, "max-image-preview": "none" },
      openGraph: {
        title: `${rawTitle} for Minecraft ${version} — Download | Creevoxx`,
        description: `Download ${rawTitle} for Minecraft ${version}. Created by ${author}.`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: rawTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${rawTitle} for Minecraft ${version} — Download | Creevoxx`,
        images: [ogImage],
      },
    };
  } catch (e) {
    console.error("Error generating details page metadata:", e);
  }

  return {
    title: "Minecraft Mod Details | Creevoxx",
    description: "Read details, optimization options, and user reviews for Minecraft shaders and modifications.",
    alternates: {
      canonical: `https://www.creevoxx.store/resource/${id}`,
    },
    // Fallback: apply same indexing logic even on error so non-whitelisted pages
    // are never accidentally indexed when metadata generation fails.
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false, "max-image-preview": "none" },
  };
}

// 2. Fact Table Server Component
function ModFactTable({ details, resource }) {
  const author = details.authors?.[0]?.name || resource.author || "creator";
  const latestVersion = resource.version || details.gameVersions?.[0] || "1.21";
  const supportedVersions = details.gameVersions && details.gameVersions.length > 0
    ? details.gameVersions.slice(0, 5).join(", ")
    : "Minecraft 1.21+";
  const fileSize = details.fileSize || "N/A";
  const lastUpdated = details.dateModified 
    ? new Date(details.dateModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Recently";

  return (
    <div className="mod-fact-table" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
      <h3 style={{ fontSize: "1.2rem", color: "var(--color-accent)", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", fontFamily: "var(--font-heading)" }}>
        ⚙️ Quick Resource Specs
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
        <tbody>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>Mod Creator</td>
            <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-text)", fontWeight: "600" }}>{author}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>Latest Version</td>
            <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-text)", fontWeight: "600" }}>{latestVersion}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>Supported Game Versions</td>
            <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-text)", fontWeight: "600" }}>{supportedVersions}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>File Size</td>
            <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-text)", fontWeight: "600" }}>{fileSize}</td>
          </tr>
          <tr>
            <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>Last Updated</td>
            <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-text)", fontWeight: "600" }}>
              {details.dateModified ? (
                <time dateTime={details.dateModified} style={{ color: "var(--color-text)" }}>
                  Updated: {lastUpdated}
                </time>
              ) : "Recently"}
            </td>
          </tr>
          {details.downloadCount && (
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <td style={{ padding: "10px 0", color: "var(--color-text-muted)", fontWeight: "500" }}>Total Downloads</td>
              <td style={{ padding: "10px 0", textAlign: "right", color: "var(--color-accent)", fontWeight: "700" }}>
                <span itemProp="downloadCount">{(details.downloadCount || 0).toLocaleString()} downloads</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 3. Dynamic SEO Text Injection
function ModSeoSummary({ details, resource, isWhitelisted }) {
  const name = details.name || resource.title;
  const catLabel = resource.category === "shaders" ? "shader" : resource.category === "textures" ? "texture pack" : "mod";
  const version = resource.version || details.gameVersions?.[0] || "1.21";
  const author = details.authors?.[0]?.name || resource.author || "creator";

  // For whitelisted VIP pages, use real CurseForge summary instead of templated filler.
  // These are the pages Google will evaluate for content quality.
  const summaryText = isWhitelisted && details.summary
    ? details.summary
    : `Developed by the talented creator ${author}, ${name} stands out as a highly recommended selection for your Minecraft client. It is fully optimized, compatibility-tested, and brings a major upgrade to the gameplay experience in Minecraft version ${version}.`;

  return (
    <div className="mod-seo-summary" style={{ margin: "24px 0 32px 0", padding: "18px 24px", borderLeft: "4px solid var(--color-accent)", background: "rgba(255,255,255,0.01)", borderRadius: "0 8px 8px 0" }}>
      <h2 style={{ fontSize: "1.4rem", color: "var(--color-text)", marginBottom: "8px", fontWeight: "600" }}>
        Why {name} is a top-tier {catLabel} mod for Minecraft {version}
      </h2>
      <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "var(--color-text-muted)", margin: 0 }}>
        {summaryText}
      </p>
    </div>
  );
}

// 4. Related Content Section
function RelatedSection({ related, category }) {
  if (!related || related.length === 0) return null;
  const catTitle = category === "shaders" ? "Shaders" : category === "textures" ? "Texture Packs" : "Mods";

  return (
    <div className="related-section" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "40px", marginTop: "48px" }}>
      <h3 style={{ fontSize: "1.6rem", color: "var(--color-text)", marginBottom: "20px", fontFamily: "var(--font-heading)" }}>
        🔍 More Recommended Minecraft {catTitle}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
        {related.map((item) => (
          <ResourceCard 
            key={item.id} 
            resource={item} 
          />
        ))}
      </div>
    </div>
  );
}

export default async function ResourceDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let resource = null;
  let details = {
    cfId: null,
    logoUrl: null,
    authors: [],
    descriptionHtml: null,
    screenshots: [],
    downloadCount: null,
    dateCreated: null,
    dateModified: null,
    gameVersions: [],
    modLoaders: [],
    downloadUrl: null,
    fileSize: null,
  };

  try {
    resource = await adminGetResourceById(id);
    // Use Firestore resource as full details if it has rich synced data
    if (resource && resource.lastSynced) {
      // Check if it's stale (older than 24h)
      const isStale = Date.now() - new Date(resource.lastSynced).getTime() > 24 * 60 * 60 * 1000;
      if (!isStale) {
        details = resource;
      } else {
        const liveDetails = await fetchCurseforgeDetailsCached(id);
        if (liveDetails) {
          details = liveDetails;
        } else {
          details = resource; // fallback
        }
      }
    } else {
      // Fallback to CurseForge cache (which itself now checks Firestore first)
      const liveDetails = await fetchCurseforgeDetailsCached(id);
      if (liveDetails) {
        details = liveDetails;
      }
    }
  } catch (err) {
    console.error(`[Detail SSR Page] Live details fetch error for ${id}:`, err.message);
  }

  if (!resource && (!details || !details.name)) {
    try {
      const { SEED_DATA } = await import("@/lib/syncDatabase.js");
      const idStr = String(id).toLowerCase();
      const found = SEED_DATA.find((r) =>
        String(r.id) === idStr ||
        String(r.curseforge_id) === idStr ||
        r.docId === id ||
        (r.title && r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === idStr) ||
        (r.title && r.title.toLowerCase().includes(idStr))
      );
      if (found) {
        resource = found;
        details = {
          ...found,
          name: found.title,
          cfId: found.curseforge_id || found.id,
          logoUrl: found.thumbnail_url || found.logoUrl,
          authors: found.authors || [{ name: found.author || "creator" }],
          downloadCount: found.download_count || found.downloadCount || 0,
          gameVersions: found.gameVersions || [found.version || "1.21"],
          downloadUrl: found.downloadUrl || found.curseforge_url || `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(found.title)}`,
          fileSize: found.fileSize || "N/A"
        };
      }
    } catch (e) {
      console.error("SEED_DATA fallback failed in detail page:", e);
    }
  }

  if (!resource && details.name) {
    resource = {
      id: id,
      docId: id,
      title: details.name,
      description: details.summary || "No description provided.",
      category: details.category || "mods",
      version: details.gameVersions?.[0] || "1.21",
      thumbnail_url: details.logoUrl,
      author: details.authors?.[0]?.name || "creator",
      download_count: details.downloadCount || 0,
    };
    resource.curseforge_url = `https://www.curseforge.com/minecraft/search?search=${encodeURIComponent(details.name)}`;
  }

  if (!resource) {
    notFound();
    return (
      <div className="detail-page" style={{ padding: "80px 24px" }}>
        <div className="not-found" role="alert">
          <span className="not-found__code" style={{ display: "block", fontSize: "3rem", color: "var(--color-accent)", fontFamily: "var(--font-heading)" }}>404</span>
          <p className="not-found__text" style={{ margin: "24px 0" }}>Resource not found. It may have been removed or the link is incorrect.</p>
          <Link href="/" className="back-link" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
            ← Back to Creevoxx
          </Link>
        </div>
      </div>
    );
  }

  // Fetch 4 related resources from same category for internal linking (SSR)
  let relatedResources = [];
  try {
    const activeCategory = details.category || resource?.category || "mods";
    const searchData = await adminGetResources({ category: activeCategory, pageSize: 6 });
    relatedResources = searchData
      .filter((item) => String(item.id || item.docId) !== String(id))
      .slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch related resources:", err);
  }

  const isWhitelisted = SEO_WHITELIST_SET.has(Number(id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": details.name || resource.title,
        "author": { "@type": "Person", "name": details.authors?.[0]?.name || resource.author || "creator" },
        "description": details.summary || resource.description || "",
        "url": `https://www.creevoxx.store/resource/${id}`,
        "downloadUrl": details.downloadUrl || resource.curseforge_url || "",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Windows, macOS, Linux, Android, iOS",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        // Add ISO 8601 dateModified so Google can evaluate content freshness
        ...(details.dateModified ? { "dateModified": new Date(details.dateModified).toISOString() } : {}),
        // aggregateRating intentionally omitted — no real user ratings collected.
        // A fabricated rating violates Google's structured data guidelines.
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.creevoxx.store/" },
          { "@type": "ListItem", "position": 2, "name": details.category || resource.category || "mods", "item": `https://www.creevoxx.store/?category=${details.category || resource.category || "mods"}` },
          { "@type": "ListItem", "position": 3, "name": details.name || resource.title },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How do I install ${details.name || resource.title}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `To install ${details.name || resource.title}, first ensure you have the required modloader or client installed for Minecraft ${details.gameVersions?.[0] || resource.version || "1.21"}. Download the file from the official links provided and place it in your Minecraft 'mods' or 'resourcepacks' folder.`
            }
          },
          {
            "@type": "Question",
            "name": `What version of Minecraft is ${details.name || resource.title} for?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${details.name || resource.title} natively supports Minecraft version ${details.gameVersions?.[0] || resource.version || "1.21"}. Always check the file details for backward compatibility.`
            }
          }
        ]
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="desktop-detail-container">
        <ResourceDetailClient
          resource={resource}
          details={details}
          id={id}
          seoSummary={<ModSeoSummary details={details} resource={resource} isWhitelisted={isWhitelisted} />}
          factTable={<ModFactTable details={details} resource={resource} />}
          relatedSection={<RelatedSection related={relatedResources} category={details.category || resource.category} />}
        />
      </div>
      <div className="mobile-detail-container">
        <MobileResourceDetail 
          resource={resource} 
          details={details} 
          relatedResources={relatedResources}
          category={details.category || resource.category}
        />
      </div>
    </>
  );
}

export const dynamic = "force-static";   // serve pre-built HTML from CDN edge
export const revalidate = 86400;          // ISR: refresh cached page every 24 hours
export const dynamicParams = true;        // allow ISR for IDs not in generateStaticParams
