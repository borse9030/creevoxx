"use client";

const CATEGORIES = [
  { value: "all", label: "⚡ All Resources", emoji: "⚡" },
  { value: "shaders", label: "✨ Shaders", emoji: "✨" },
  { value: "textures", label: "🎨 Textures", emoji: "🎨" },
  { value: "mods", label: "🔧 Mods", emoji: "🔧" },
];

const DEVICES = [
  { value: "all", label: "🎮 All Devices", emoji: "🎮" },
  { value: "low-end", label: "📱 Low-End Devices", emoji: "📱" },
  { value: "high-end", label: "🖥️ High-End Devices", emoji: "🖥️" },
];

export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="category-tabs" aria-label="Resource categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          aria-pressed={active === cat.value}
          className={`category-tab ${active === cat.value ? "category-tab--active" : ""}`}
          onClick={() => onChange(cat.value)}
          id={`tab-${cat.value}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export function DeviceTabs({ active, onChange }) {
  return (
    <div className="category-tabs" aria-label="Device compatibility filters" style={{ marginTop: "4px" }}>
      {DEVICES.map((dev) => (
        <button
          key={dev.value}
          aria-pressed={active === dev.value}
          className={`category-tab ${active === dev.value ? "category-tab--active" : ""}`}
          onClick={() => onChange(dev.value)}
          id={`tab-device-${dev.value}`}
        >
          {dev.label}
        </button>
      ))}
    </div>
  );
}
