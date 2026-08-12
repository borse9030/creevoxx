// MobileHero is the entry point used by page.js — now delegates to MobileAppView
import MobileAppView from "./MobileAppView";

export default function MobileHero({ stats }) {
  return <MobileAppView stats={stats} />;
}
