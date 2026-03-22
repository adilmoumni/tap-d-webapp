"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

const THEMES = [
  { id: "white",      bg: "#ffffff", btn: "#f0eeea", text: "#1a1a2e", accent: "#e8b86d" },
  { id: "dark",       bg: "#0a0a0f", btn: "#1a1a2e", text: "#ffffff", accent: "#e8b86d" },
  { id: "lavender",   bg: "#eeedfe", btn: "#ddd6f3", text: "#1a1a2e", accent: "#9333ea" },
  { id: "gold-light", bg: "#faeeda", btn: "#f5e6d3", text: "#1a1a2e", accent: "#b8860b" },
  { id: "mint-light", bg: "#e1f5ee", btn: "#c3ebd8", text: "#1a1a2e", accent: "#22c55e" },
  { id: "sand-light", bg: "#f5e6d3", btn: "#eddcc8", text: "#1a1a2e", accent: "#b8860b" },
  { id: "blue-light", bg: "#e8f0fc", btn: "#d0e2f7", text: "#1a1a2e", accent: "#4a90e2" },
  { id: "warm-gray",  bg: "#f5f3f0", btn: "#e8e6e2", text: "#1a1a2e", accent: "#e8b86d" },
];

export function DesignTheme() {
  const { data, updateTheme } = useBioEditor();

  const handleTheme = (theme: typeof THEMES[number]) => {
    updateTheme("backgroundColor", theme.bg);
    updateTheme("buttonColor", theme.btn);
    updateTheme("textColor", theme.text);
    updateTheme("buttonTextColor", theme.text);
    updateTheme("accentColor", theme.accent);
  };

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Theme</h2>

      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Choose a theme</label>
      <div className="grid grid-cols-4 gap-3">
        {THEMES.map((theme) => {
          const isActive = data.theme.backgroundColor === theme.bg;
          return (
            <button
              key={theme.id}
              onClick={() => handleTheme(theme)}
              className={cn(
                "w-full aspect-[4/5] rounded-[12px] border-2 transition-all p-1",
                isActive ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
              )}
            >
              <div
                className="w-full h-full rounded-[8px] border border-[#e8e6e2]"
                style={{ backgroundColor: theme.bg }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
