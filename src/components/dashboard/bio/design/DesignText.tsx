"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { ColorRow } from "./DesignColors";
import type { BioTheme } from "@/types/bio";

/* ── Font options ── */

const FONTS: {
  id: BioTheme["fontFamily"];
  label: string;
  preview: string;
}[] = [
  { id: "inter",        label: "Inter",          preview: "var(--font-inter), Inter, sans-serif" },
  { id: "poppins",      label: "Poppins",        preview: "var(--font-poppins), Poppins, sans-serif" },
  { id: "dmsans",       label: "DM Sans",        preview: "var(--font-dmsans), 'DM Sans', sans-serif" },
  { id: "spacegrotesk", label: "Space Grotesk",  preview: "var(--font-spacegrotesk), 'Space Grotesk', sans-serif" },
  { id: "sora",         label: "Sora",           preview: "var(--font-sora), Sora, sans-serif" },
  { id: "serif",        label: "Playfair",       preview: "var(--font-serif), 'Playfair Display', Georgia, serif" },
  { id: "lora",         label: "Lora",           preview: "var(--font-lora), Lora, Georgia, serif" },
  { id: "mono",         label: "JetBrains",      preview: "var(--font-jetbrains), 'JetBrains Mono', monospace" },
];

/* ── Color presets ── */

const TEXT_COLORS = ["#0a0a0f", "#ffffff", "#8a8a9a", "#b8860b", "#4a90e2", "#e8a0bf", "#22c55e", "#9333ea"];

export function DesignText() {
  const { data, updateTheme } = useBioEditor();
  const activeFont = data.theme.fontFamily;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Text</h2>

      {/* Font picker */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Font</label>
        <div className="grid grid-cols-4 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => updateTheme("fontFamily", f.id)}
              className={cn(
                "p-2.5 rounded-[10px] border text-center transition-all",
                activeFont === f.id
                  ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]"
                  : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
              )}
            >
              <div
                className="text-[17px] mb-1 text-[#1a1a2e] font-semibold leading-none"
                style={{ fontFamily: f.preview }}
              >
                Aa
              </div>
              <div className="text-[9px] font-medium text-[#8a8a9a] truncate">
                {f.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text color — with full picker */}
      <ColorRow
        label="Text color"
        presets={TEXT_COLORS}
        value={data.theme.textColor}
        onChange={(c) => {
          updateTheme("textColor", c);
          updateTheme("buttonTextColor", c);
        }}
      />
    </div>
  );
}
