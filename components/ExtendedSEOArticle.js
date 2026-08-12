import React from "react";

export default function ExtendedSEOArticle({ resource, title, category, authorName, version }) {
  const catName = category ? category.replace(/s$/, "") : "resource";
  const desc = resource?.description || `an essential addition to your game`;
  const downloads = resource?.download_count ? resource.download_count.toLocaleString() : "thousands of";
  const isPerformance = desc.toLowerCase().includes("fps") || desc.toLowerCase().includes("performance") || desc.toLowerCase().includes("optimization");

  return (
    <div className="extended-seo-article" style={{ marginTop: "40px", color: "var(--color-text)", lineHeight: "1.8", fontSize: "1.05rem" }}>
      <h2 style={{ color: "var(--color-accent)", marginBottom: "16px", fontSize: "1.8rem" }}>The Ultimate Guide to {title}</h2>
      <p style={{ marginBottom: "16px" }}>If you are exploring the vast world of Minecraft modifications, <strong>{title}</strong> by <em>{authorName}</em> is a standout {catName} that deserves your attention. With over {downloads} downloads, it has become a staple for players looking to enhance their experience. As the creator describes it, this project is "{desc}". Whether you are a veteran builder constructing massive cities, or simply a casual player looking to upgrade your survival world, this guide will provide you with all the essential details on how {title} alters the game.</p>

      <h3 style={{ color: "var(--color-text)", marginTop: "32px", marginBottom: "12px", fontSize: "1.4rem" }}>What Makes It Special?</h3>
      <p style={{ marginBottom: "16px" }}>Unlike standard {category} that simply alter superficial elements, {title} {isPerformance ? "digs deep into the game's engine to provide a cohesive, performance-focused experience." : "introduces a wide array of visual and mechanical features designed to seamlessly blend into the vanilla aesthetic."} {authorName} has clearly spent significant time refining the project to ensure that every aspect feels polished and responsive for version {version}.</p>

      <h3 style={{ color: "var(--color-text)", marginTop: "32px", marginBottom: "12px", fontSize: "1.4rem" }}>Installation Guide</h3>
      <p style={{ marginBottom: "16px" }}>Getting <strong>{title}</strong> up and running is straightforward. Follow these step-by-step instructions:</p>
      <ol style={{ paddingLeft: "24px", marginBottom: "20px" }}>
        <li style={{ marginBottom: "10px" }}><strong>Verify Your Version:</strong> Ensure your Minecraft launcher is set to version <strong>{version}</strong>.</li>
        <li style={{ marginBottom: "10px" }}><strong>Install Mod Loader (if required):</strong> If this is a mod, download the compatible loader (Forge, Fabric, NeoForge).</li>
        <li style={{ marginBottom: "10px" }}><strong>Download the File:</strong> Click the secure download button above to retrieve the official file from CurseForge.</li>
        <li style={{ marginBottom: "10px" }}><strong>Move the File:</strong> Place the downloaded file into your `mods`, `shaderpacks`, or `resourcepacks` folder depending on the {catName} type.</li>
        <li style={{ marginBottom: "10px" }}><strong>Launch and Enjoy:</strong> Open Minecraft, navigate to the respective settings menu, and activate {title}.</li>
      </ol>

      <h3 style={{ color: "var(--color-text)", marginTop: "32px", marginBottom: "12px", fontSize: "1.4rem" }}>Compatibility & Performance</h3>
      <p style={{ marginBottom: "16px" }}>Compatibility is robust. {title} is designed specifically for version <strong>{version}</strong>, taking full advantage of the latest engine optimizations. {isPerformance ? "Since this is heavily focused on optimization, you can expect significant frame rate improvements on both low-end and high-end hardware." : "During typical gameplay, this addition maintains a stable frame rate, though lower-end laptops might experience slight stuttering. We recommend pairing this with performance boosters like Sodium or Iris to guarantee a silky-smooth experience."}</p>
    </div>
  );
}
