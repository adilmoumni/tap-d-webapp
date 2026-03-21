"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "white", bg: "#ffffff" },
  { id: "dark", bg: "#0a0a0f" },
  { id: "lavender", bg: "#eeedfe" },
  { id: "gold-light", bg: "#faeeda" },
  { id: "mint-light", bg: "#e1f5ee" },
  { id: "pink-light", bg: "#fce8f0" },
  { id: "blue-light", bg: "#e8f0fc" },
  { id: "warm-gray", bg: "#f5f3f0" },
];

export function DesignTheme() {
  const [activeTheme, setActiveTheme] = useState("white");

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Theme</h2>

      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Choose a theme</label>
      <div className="grid grid-cols-4 gap-3">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
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
          )
        })}
      </div>
    </div>
  );
}
