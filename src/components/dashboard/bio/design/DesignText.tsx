"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TEXT_COLORS = [
  { id: "dark", bg: "#0a0a0f" },
  { id: "white", bg: "#ffffff" },
  { id: "gray", bg: "#8a8a9a" },
  { id: "gold", bg: "#b8860b" },
  { id: "blue", bg: "#4a90e2" },
  { id: "pink", bg: "#e8a0bf" },
];

export function DesignText() {
  const [activeFont, setActiveFont] = useState<"inter" | "serif" | "mono">("inter");
  const [activeColor, setActiveColor] = useState("dark");

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Text</h2>

      {/* Font */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Font</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setActiveFont("inter")}
            className={cn(
              "p-3 rounded-[10px] border text-center transition-all",
              activeFont === "inter" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="text-[18px] mb-1 text-[#1a1a2e]" style={{ fontFamily: "Inter, sans-serif" }}>Aa</div>
            <div className="text-[11px] font-medium text-[#8a8a9a]">Inter</div>
          </button>
          <button
            onClick={() => setActiveFont("serif")}
            className={cn(
              "p-3 rounded-[10px] border text-center transition-all",
              activeFont === "serif" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="text-[18px] mb-1 text-[#1a1a2e]" style={{ fontFamily: "Georgia, serif" }}>Aa</div>
            <div className="text-[11px] font-medium text-[#8a8a9a]">Serif</div>
          </button>
          <button
            onClick={() => setActiveFont("mono")}
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
              key={color.id}
              onClick={() => setActiveColor(color.id)}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all p-[2px]",
                activeColor === color.id ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
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
