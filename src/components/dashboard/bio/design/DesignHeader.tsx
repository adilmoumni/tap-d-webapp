"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function DesignHeader() {
  const [layout, setLayout] = useState<"classic" | "hero">("classic");

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Header</h2>

      {/* Profile Image */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Profile image</label>
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-[#f5f3f0] flex items-center justify-center text-[24px] text-[#8a8a9a] border border-[#e8e6e2]">
            E
          </div>
          <button className="px-[16px] py-[10px] rounded-full bg-[#0a0a0f] text-white text-[12px] font-semibold hover:bg-[#1a1a2e] transition-colors">
            + Upload
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Layout</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLayout("classic")}
            className={cn(
              "relative p-4 rounded-[12px] border text-left transition-all",
              layout === "classic" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-[#f5f3f0] mb-3" />
            <div className="text-[13px] font-semibold text-[#1a1a2e]">Classic</div>
            <div className="text-[11px] text-[#8a8a9a]">Avatar above text</div>
          </button>

          <button
            onClick={() => setLayout("hero")}
            className={cn(
              "relative p-4 rounded-[12px] border text-left transition-all",
              layout === "hero" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[8px] font-bold uppercase tracking-wide">
              Pro
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-[#f5f3f0] mb-3" />
            <div className="text-[13px] font-semibold text-[#1a1a2e]">Hero</div>
            <div className="text-[11px] text-[#8a8a9a]">Avatar on the left</div>
          </button>
        </div>
      </div>

      {/* Text Info */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-2">Title</label>
        <input
          type="text"
          defaultValue="@emma.creates"
          className="w-full px-[14px] py-[10px] border border-[#e8e6e2] rounded-[10px] text-[13px] text-[#1a1a2e] focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] outline-none transition-all mb-4"
        />

        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-2">Bio</label>
        <textarea
          defaultValue="Designer & creator. Building ColorPal."
          rows={3}
          className="w-full px-[14px] py-[10px] border border-[#e8e6e2] rounded-[10px] text-[13px] text-[#1a1a2e] focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] outline-none transition-all resize-none"
        />
      </div>
    </div>
  );
}
