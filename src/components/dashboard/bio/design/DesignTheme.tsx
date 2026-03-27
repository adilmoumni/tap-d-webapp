"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { THEME_PRESETS } from "@/config/theme-presets";
import type { ThemePreset } from "@/config/theme-presets";
import { DEFAULT_THEME } from "@/types/bio";
import type { BioTheme } from "@/types/bio";

const PREVIEW_FONTS: Record<BioTheme["fontFamily"], string> = {
  inter: "var(--font-inter), 'Inter', sans-serif",
  poppins: "var(--font-poppins), 'Poppins', sans-serif",
  dmsans: "var(--font-dmsans), 'DM Sans', sans-serif",
  spacegrotesk: "var(--font-spacegrotesk), 'Space Grotesk', sans-serif",
  sora: "var(--font-sora), 'Sora', sans-serif",
  serif: "var(--font-serif), 'Playfair Display', Georgia, serif",
  lora: "var(--font-lora), 'Lora', Georgia, serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', monospace",
};

/* ─────────────────────────────────────────────
   DesignTheme — rich theme preset picker.
   Cards show a fast-loading preview of each
   theme with font sample and button bar.
───────────────────────────────────────────── */

function PresetCard({
  preset,
  isActive,
  onClick,
}: {
  preset: ThemePreset;
  isActive: boolean;
  onClick: () => void;
}) {
  const t = { ...DEFAULT_THEME, ...preset.theme };
  const isOutline = t.buttonFill === "outline";
  const radius =
    t.buttonStyle === "full" ? "9999px" : t.buttonStyle === "square" ? "3px" : t.buttonStyle === "rounder" ? "12px" : "6px";

  // Use the full backgroundCss for the preview to show gradients / marble
  const bg = t.backgroundCss || t.backgroundColor;
  const isMarble = bg.includes("/themes/");

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border-2 transition-all",
        isActive
          ? "border-[#0a0a0f] ring-2 ring-[#0a0a0f]/20 scale-[1.02]"
          : "border-[#e8e6e2] hover:border-[#b8b5b0] hover:scale-[1.01]"
      )}
    >
      {/* Background preview */}
      <div
        className="relative w-full aspect-[4/5] flex flex-col items-center justify-center gap-[6px] px-3"
        style={{ background: bg }}
      >
        {/* Pro badge for marble themes */}
        {isMarble && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
        )}

        {/* Font sample */}
        <span
          className="font-semibold leading-none"
          style={{
            color: t.textColor,
            fontSize: "18px",
            fontFamily: PREVIEW_FONTS[t.fontFamily] ?? "'Inter', sans-serif",
          }}
        >
          Aa
        </span>

        {/* Mini button preview */}
        <div
          className="w-[70%] h-[14px]"
          style={{
            borderRadius: radius,
            background: isOutline ? "transparent" : t.buttonColor,
            border: isOutline
              ? `1.5px solid ${t.buttonTextColor}`
              : "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              t.buttonShadow === "hard"
                ? `2px 2px 0 ${t.buttonTextColor}`
                : t.buttonShadow === "strong"
                  ? "0 4px 16px rgba(0,0,0,0.24)"
                  : t.buttonShadow === "soft"
                    ? "0 2px 8px rgba(0,0,0,0.12)"
                    : "none",
          }}
        />
      </div>

      {/* Label */}
      <div className="w-full py-2 px-1 bg-white text-center">
        <span className="text-[11px] font-medium text-[#1a1a2e]">{preset.name}</span>
      </div>
    </button>
  );
}

export function DesignTheme() {
  const { data, updateTheme } = useBioEditor();

  const handlePreset = (preset: ThemePreset) => {
    const t = preset.theme;

    if (t.backgroundColor) updateTheme("backgroundColor", t.backgroundColor);
    if (t.buttonColor) updateTheme("buttonColor", t.buttonColor);
    if (t.buttonTextColor) updateTheme("buttonTextColor", t.buttonTextColor);
    if (t.textColor) updateTheme("textColor", t.textColor);
    if (t.accentColor) updateTheme("accentColor", t.accentColor);
    if (t.fontFamily) updateTheme("fontFamily", t.fontFamily);
    if (t.buttonStyle) updateTheme("buttonStyle", t.buttonStyle);
    if (t.buttonFill) updateTheme("buttonFill", t.buttonFill);
    if (t.buttonShadow) updateTheme("buttonShadow", t.buttonShadow);

    // Set background CSS (or clear it for simple themes)
    updateTheme("backgroundCss", t.backgroundCss ?? "");

    // Reset wallpaper to flat when applying a preset
    updateTheme("wallpaper", "flat");
  };

  // Match active preset
  const activeId = THEME_PRESETS.find((p) => {
    const t = p.theme;
    return (
      t.backgroundColor === data.theme.backgroundColor &&
      (t.backgroundCss ?? "") === (data.theme.backgroundCss ?? "")
    );
  })?.id;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Theme</h2>

      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">
        Choose a theme
      </label>
      <div className="grid grid-cols-4 gap-2.5">
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={activeId === preset.id}
            onClick={() => handlePreset(preset)}
          />
        ))}
      </div>
    </div>
  );
}
