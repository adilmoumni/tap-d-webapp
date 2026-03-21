"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const BG_COLORS = [
  { id: "white", bg: "#ffffff" },
  { id: "warm-gray", bg: "#f5f3f0" },
  { id: "lavender", bg: "#eeedfe" },
  { id: "gold-light", bg: "#faeeda" },
  { id: "mint-light", bg: "#e1f5ee" },
  { id: "pink-light", bg: "#fce8f0" },
];

const BUTTON_COLORS = [
  { id: "warm-gray", bg: "#f5f3f0" },
  { id: "dark", bg: "#1a1a2e" },
  { id: "gold", bg: "#e8b86d" },
  { id: "mint", bg: "#a3e8c8" },
  { id: "pink", bg: "#e8a0bf" },
  { id: "blue", bg: "#a0c4e8" },
];

const ACCENT_COLORS = [
  { id: "gold", bg: "#b8860b" },
  { id: "mint", bg: "#22c55e" },
  { id: "blue", bg: "#4a90e2" },
  { id: "pink", bg: "#e8a0bf" },
  { id: "purple", bg: "#9333ea" },
  { id: "dark", bg: "#1a1a2e" },
];

function ColorRow({ label, colors, activeId, onChange }: { label: string, colors: typeof BG_COLORS, activeId: string, onChange: (id: string) => void }) {
  return (
    <div className="mb-6 last:mb-0">
      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">{label}</label>
      <div className="flex gap-3">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onChange(color.id)}
            className={cn(
              "w-9 h-9 rounded-full border-2 transition-all p-[2px]",
              activeId === color.id ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
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
  const [activeBg, setActiveBg] = useState("white");
  const [activeBtn, setActiveBtn] = useState("dark");
  const [activeAcc, setActiveAcc] = useState("gold");

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Colors</h2>

      <ColorRow label="Background color" colors={BG_COLORS} activeId={activeBg} onChange={setActiveBg} />
      <ColorRow label="Button color" colors={BUTTON_COLORS} activeId={activeBtn} onChange={setActiveBtn} />
      <ColorRow label="Accent color" colors={ACCENT_COLORS} activeId={activeAcc} onChange={setActiveAcc} />
    </div>
  );
}
