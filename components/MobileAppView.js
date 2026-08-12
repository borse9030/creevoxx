// Server Component — pre-fetches all horizontal section data for SEO (100% MCPE / Bedrock focused)
import { fetchCurseforgeSearchCached } from "@/lib/curseforgeCached";
import MobileAppShell from "./MobileAppShell";

const SHADER_SECTIONS = [
  { title: "RenderDragon MCPE Shaders", query: "", categoryId: 6939 },
  { title: "Vibrant Visual Shaders", query: "vibrant", categoryId: 6939 },
  { title: "Low End Lite Shaders",   query: "lite", categoryId: 6939 },
  { title: "High End RTX Shaders",  query: "rtx", categoryId: 6939 },
  { title: "Classic / Non-RenderDragon", query: "classic", categoryId: 6939 },
];

const TEXTURE_SECTIONS = [
  { title: "PvP Resource Packs", query: "", categoryId: 6931 },
  { title: "32x HD Faithful Textures", query: "", categoryId: 6936 },
  { title: "64x HD Realism Textures", query: "", categoryId: 6937 },
  { title: "Bare Bones & Simplistic", query: "", categoryId: 6933 },
  { title: "Realistic Texture Packs", query: "", categoryId: 6932 },
];

const MOD_SECTIONS = [
  { title: "Guns & Weapons Addons", query: "", categoryId: 8834 },
  { title: "Furniture & Decor Addons", query: "", categoryId: 8826 },
  { title: "Performance Addons", query: "", categoryId: 8837 },
  { title: "Survival Addons", query: "", categoryId: 8831 },
  { title: "Horror & Spooky Addons", query: "", categoryId: 8833 },
];

const MAP_SECTIONS = [
  { title: "Survival Spawn Maps", query: "", categoryId: 6924 },
  { title: "Parkour Challenge Maps", query: "", categoryId: 6919 },
  { title: "Adventure & RPG Maps", query: "", categoryId: 6914 },
  { title: "PvP Arena Maps", query: "", categoryId: 6921 },
];

const SKIN_SECTIONS = [
  { title: "Skin Packs",           query: "", categoryId: 6928 },
  { title: "Individual Skins",     query: "", categoryId: 6927 },
  // 3rd section = New Arrivals, sorted by date — each card gets "NEW" badge in the UI
  { title: "🆕 New Skin Arrivals", query: "", categoryId: 6928, sortField: "1", isNew: true },
  { title: "Character Skin Packs", query: "", categoryId: 6926 },
];

async function fetchSection(section, category) {
  try {
    const result = await fetchCurseforgeSearchCached({
      query: section.query || "",
      category,
      categoryId: section.categoryId,
      pageSize: 8,
      sortField: section.sortField ?? "6",
      sortOrder: "desc",
      edition: "pocket", // 100% MCPE / Bedrock focused for Mobile!
    });
    const resources = result?.data || [];
    return {
      title: section.title,
      query: section.query || "",
      categoryId: section.categoryId,
      sortField: section.sortField,
      isNew: section.isNew ?? false,
      resources,
    };
  } catch {
    return { title: section.title, query: section.query || "", categoryId: section.categoryId, sortField: section.sortField, isNew: section.isNew ?? false, resources: [] };
  }
}

export default async function MobileAppView({ stats }) {
  // Pre-fetch all MCPE sections in parallel on the server.
  // getLiveStats() has been removed from this component — stats are now fetched
  // client-side via LiveStatsClient → /api/stats (edge-cached) to save CPU.
  const [shaderSections, textureSections, modSections, mapSections, skinSections] = await Promise.all([
    Promise.all(SHADER_SECTIONS.map((s) => fetchSection(s, "shaders"))),
    Promise.all(TEXTURE_SECTIONS.map((s) => fetchSection(s, "textures"))),
    Promise.all(MOD_SECTIONS.map((s) => fetchSection(s, "mods"))),
    Promise.all(MAP_SECTIONS.map((s) => fetchSection(s, "maps"))),
    Promise.all(SKIN_SECTIONS.map((s) => fetchSection(s, "skins"))),
  ]);

  const initialData = {
    shaders:  shaderSections,
    textures: textureSections,
    mods:     modSections,
    maps:     mapSections,
    skins:    skinSections,
  };

  // Use the stats prop passed from page.js (populated by LiveStatsClient).
  const finalStats = stats || {};

  return <MobileAppShell initialData={initialData} stats={finalStats} />;
}
