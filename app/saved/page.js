import SavedPageClient from "@/components/SavedPageClient";

export const metadata = {
  title: "Saved Resources & Bookmarks | Creevoxx",
  description: "View and manage your bookmarked Minecraft shaders, texture packs, and mods for quick access.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedPage() {
  return <SavedPageClient />;
}
