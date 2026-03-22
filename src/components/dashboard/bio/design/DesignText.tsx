"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

const TEXT_COLORS = [
  { bg: "#0a0a0f" },
  { bg: "#ffffff" },
  { bg: "#8a8a9a" },
  { bg: "#b8860b" },
  { bg: "#4a90e2" },
  { bg: "#e8a0bf" },
];

export function DesignText() {
  const { data, updateTheme } = useBioEditor();
  const activeFont = data.theme.fontFamily;
  const activeColor = data.theme.textColor;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Text</h2>

      {/* Font */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Font</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => updateTheme("fontFamily", "inter")}
            className={cn(
              "p-3 rounded-[10px] border text-center transition-all",
              activeFont === "inter" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="text-[18px] mb-1 text-[#1a1a2e]" style={{ fontFamily: "Inter, sans-serif" }}>Aa</div>
            <div className="text-[11px] font-medium text-[#8a8a9a]">Inter</div>
          </button>
          <button
            onClick={() => updateTheme("fontFamily", "serif")}
            className={cn(
              "p-3 rounded-[10px] border text-center transition-all",
              activeFont === "serif" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="text-[18px] mb-1 text-[#1a1a2e]" style={{ fontFamily: "Georgia, serif" }}>Aa</div>
            <div className="text-[11px] font-medium text-[#8a8a9a]">Serif</div>
          </button>
          <button
            onClick={() => updateTheme("fontFamily", "mono")}
            className={cn(
              "p-3 rounded-[10px] border text-center transition-all",
              activeFont === "mono" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="text-[18px] mb-1 text-[#1a1a2e]" style={{ fontFamily: "monospace" }}>Aa</div>
            <div className="text-[11px] font-medium text-[#8a8a9a]">Mono</div>
          </button>
        </div>
      </div>

      {/* Text color */}
      <div>
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Text color</label>
        <div className="flex gap-3">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.bg}
              onClick={() => {
                updateTheme("textColor", color.bg);
                updateTheme("buttonTextColor", color.bg);
              }}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all p-[2px]",
                activeColor === color.bg ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
              )}
            >
              <div
                className="w-full h-full rounded-full border border-[#e8e6e2]"
                style={{ backgroundColor: color.bg }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
