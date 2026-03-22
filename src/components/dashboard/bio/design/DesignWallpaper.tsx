"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

export function DesignWallpaper() {
  const { data, updateTheme } = useBioEditor();
  const activeWall = data.theme.wallpaper;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Wallpaper</h2>

      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Background</label>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => updateTheme("wallpaper", "flat")}
          className={cn(
            "relative p-3 rounded-[12px] border text-center transition-all",
            activeWall === "flat" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
          )}
        >
          <div className="w-full h-16 rounded-[8px] bg-[#f5f3f0] mb-2" />
          <div className="text-[12px] font-medium text-[#1a1a2e]">Flat</div>
        </button>

        <button
          onClick={() => updateTheme("wallpaper", "image")}
          className={cn(
            "relative p-3 rounded-[12px] border text-center transition-all",
            activeWall === "image" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
          )}
        >
          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[7px] font-bold uppercase tracking-wide">
            Pro
          </span>
          <div className="w-full h-16 rounded-[8px] bg-[#e8e6e2] border-[1.5px] border-dashed border-[#8a8a9a] text-[10px] text-[#8a8a9a] flex items-center justify-center mb-2">
            Img
          </div>
          <div className="text-[12px] font-medium text-[#1a1a2e]">Image</div>
        </button>

        <button
          onClick={() => updateTheme("wallpaper", "gradient")}
          className={cn(
            "relative p-3 rounded-[12px] border text-center transition-all",
            activeWall === "gradient" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
          )}
        >
          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[7px] font-bold uppercase tracking-wide">
            Pro
          </span>
          <div className="w-full h-16 rounded-[8px] bg-gradient-to-br from-[#eeedfe] to-[#e1f5ee] mb-2" />
          <div className="text-[12px] font-medium text-[#1a1a2e]">Gradient</div>
        </button>
      </div>
    </div>
  );
}
