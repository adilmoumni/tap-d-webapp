"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

const BG_COLORS = [
  { bg: "#ffffff" },
  { bg: "#f5f3f0" },
  { bg: "#eeedfe" },
  { bg: "#faeeda" },
  { bg: "#e1f5ee" },
  { bg: "#f5e6d3" },
];

const BUTTON_COLORS = [
  { bg: "#f5f3f0" },
  { bg: "#1a1a2e" },
  { bg: "#e8b86d" },
  { bg: "#a3e8c8" },
  { bg: "#e8a0bf" },
  { bg: "#a0c4e8" },
];

const ACCENT_COLORS = [
  { bg: "#b8860b" },
  { bg: "#22c55e" },
  { bg: "#4a90e2" },
  { bg: "#e8a0bf" },
  { bg: "#9333ea" },
  { bg: "#1a1a2e" },
];

function ColorRow({
  label,
  colors,
  activeColor,
  onChange,
}: {
  label: string;
  colors: { bg: string }[];
  activeColor: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">{label}</label>
      <div className="flex gap-3">
        {colors.map((color) => (
          <button
            key={color.bg}
            onClick={() => onChange(color.bg)}
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
  );
}

export function DesignColors() {
  const { data, updateTheme } = useBioEditor();

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Colors</h2>

      <ColorRow
        label="Background color"
        colors={BG_COLORS}
        activeColor={data.theme.backgroundColor}
        onChange={(c) => updateTheme("backgroundColor", c)}
      />
      <ColorRow
        label="Button color"
        colors={BUTTON_COLORS}
        activeColor={data.theme.buttonColor}
        onChange={(c) => updateTheme("buttonColor", c)}
      />
      <ColorRow
        label="Accent color"
        colors={ACCENT_COLORS}
        activeColor={data.theme.accentColor}
        onChange={(c) => updateTheme("accentColor", c)}
      />
    </div>
  );
}
