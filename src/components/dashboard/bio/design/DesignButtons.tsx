"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { ColorRow } from "./DesignColors";
import type { BioTheme } from "@/types/bio";

/* ── Style options ── */

const STYLES: { id: BioTheme["buttonFill"]; label: string }[] = [
  { id: "solid",   label: "Solid" },
  { id: "glass",   label: "Glass" },
  { id: "outline", label: "Outline" },
];

/* ── Corner roundness ── */

const CORNERS: { id: BioTheme["buttonStyle"]; label: string; radius: string }[] = [
  { id: "square",  label: "Square",  radius: "4px" },
  { id: "round",   label: "Round",   radius: "10px" },
  { id: "rounder", label: "Rounder", radius: "18px" },
  { id: "full",    label: "Full",    radius: "9999px" },
];

/* ── Shadow options ── */

const SHADOWS: { id: NonNullable<BioTheme["buttonShadow"]>; label: string }[] = [
  { id: "none",   label: "None" },
  { id: "soft",   label: "Soft" },
  { id: "strong", label: "Strong" },
  { id: "hard",   label: "Hard" },
];

/* ── Color presets ── */

const BTN_COLORS = ["#f5f3f0", "#ffffff", "#1a1a2e", "#e8b86d", "#a3e8c8", "#e8a0bf", "#a0c4e8", "#0a0a0f"];
const BTN_TEXT_COLORS = ["#0a0a0f", "#ffffff", "#8a8a9a", "#b8860b", "#4a90e2", "#e8a0bf", "#22c55e", "#9333ea"];

export function DesignButtons() {
  const { data, updateTheme } = useBioEditor();
  const activeFill = data.theme.buttonFill;
  const activeCorner = data.theme.buttonStyle;
  const activeShadow = data.theme.buttonShadow ?? "none";

  const showShadow = activeFill === "solid" || activeFill === "outline";
  const showButtonColor = activeFill === "solid";

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Buttons</h2>

      {/* Button style */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Style</label>
        <div className="grid grid-cols-3 gap-3">
          {STYLES.map((s) => {
            const isSolid = s.id === "solid";
            const isGlass = s.id === "glass";
            return (
              <button
                key={s.id}
                onClick={() => updateTheme("buttonFill", s.id)}
                className={cn(
                  "p-3 rounded-[12px] border transition-all flex flex-col items-center",
                  activeFill === s.id
                    ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]"
                    : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
                )}
              >
                <div
                  className="w-full h-8 rounded-[8px] mb-3"
                  style={{
                    background: isSolid
                      ? "#1a1a2e"
                      : isGlass
                        ? "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))"
                        : "transparent",
                    border: isSolid ? "none" : isGlass ? "1px solid rgba(255,255,255,0.3)" : "1.5px solid #1a1a2e",
                    backdropFilter: isGlass ? "blur(8px)" : undefined,
                    boxShadow: isGlass ? "inset 0 1px 0 rgba(255,255,255,0.2)" : undefined,
                  }}
                />
                <div className="text-[11px] font-medium text-[#8a8a9a]">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corner roundness */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Corner roundness</label>
        <div className="grid grid-cols-4 gap-2">
          {CORNERS.map((c) => (
            <button
              key={c.id}
              onClick={() => updateTheme("buttonStyle", c.id)}
              className={cn(
                "p-2.5 rounded-[12px] border transition-all flex flex-col items-center",
                activeCorner === c.id
                  ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]"
                  : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
              )}
            >
              <div
                className="w-full h-7 bg-[#1a1a2e] mb-2"
                style={{ borderRadius: c.radius }}
              />
              <div className="text-[9px] font-medium text-[#8a8a9a]">{c.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Shadow — visible for solid & outline only */}
      {showShadow && (
        <div className="mb-8">
          <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Shadow</label>
          <div className="grid grid-cols-4 gap-2">
            {SHADOWS.map((s) => (
              <button
                key={s.id}
                onClick={() => updateTheme("buttonShadow", s.id)}
                className={cn(
                  "p-2.5 rounded-[12px] border transition-all flex flex-col items-center",
                  activeShadow === s.id
                    ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]"
                    : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
                )}
              >
                <div
                  className="w-full h-7 bg-[#1a1a2e] rounded-[8px] mb-2"
                  style={{
                    boxShadow:
                      s.id === "soft"   ? "0 2px 8px rgba(0,0,0,0.15)" :
                      s.id === "strong" ? "0 4px 16px rgba(0,0,0,0.3)" :
                      s.id === "hard"   ? "3px 3px 0 #1a1a2e" :
                      "none",
                  }}
                />
                <div className="text-[9px] font-medium text-[#8a8a9a]">{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button color — visible for solid only */}
      {showButtonColor && (
        <ColorRow
          label="Button color"
          presets={BTN_COLORS}
          value={data.theme.buttonColor}
          onChange={(c) => updateTheme("buttonColor", c)}
        />
      )}

      {/* Button text color — always visible */}
      <ColorRow
        label="Button text color"
        presets={BTN_TEXT_COLORS}
        value={data.theme.buttonTextColor}
        onChange={(c) => updateTheme("buttonTextColor", c)}
      />
    </div>
  );
}
