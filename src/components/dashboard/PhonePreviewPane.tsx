"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

export function PhonePreviewPane() {
  const { activeSection, bioLinks } = useDashboard();

  if (activeSection !== "bio") return null;

  const activeLinks = bioLinks.filter((l) => l.active);

  return (
    <div className="hidden xl:flex w-[360px] bg-dash-bg py-5 px-4 flex-col items-center overflow-y-auto shrink-0 border-l border-dash-border transition-all duration-300 font-inter">
      <div className="flex items-center justify-center gap-2 py-[7px] px-[14px] bg-dash-white border border-dash-border rounded-full text-[11px] text-dash-text-muted mb-4 w-full">
        <span className="font-medium text-dash-text">tap-d.link/@emma</span>
        <Share2 className="ml-auto opacity-30 cursor-pointer w-[14px] h-[14px]" />
      </div>

      <div className="w-[260px] bg-dash-white rounded-[30px] p-[14px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-dash-border flex flex-col items-center">
        <div className="w-[70px] h-[5px] bg-dash-bg rounded-[3px] mx-auto mb-[14px]" />
        
        <div className="w-14 h-14 rounded-full bg-dash-bg mb-2 flex items-center justify-center text-[18px] text-dash-text-muted">E</div>
        <div className="text-center text-[14px] font-semibold mb-[3px]">@emma.creates</div>
        <div className="text-center text-[10px] text-dash-text-muted leading-relaxed mb-3 px-1.5">Digital creator & UI designer.</div>
        
        <div className="flex gap-1.5 justify-center mb-3.5">
          <div className="w-[26px] h-[26px] rounded-full bg-dash-bg flex items-center justify-center text-[10px] text-dash-text-muted">📸</div>
          <div className="w-[26px] h-[26px] rounded-full bg-dash-bg flex items-center justify-center text-[10px] text-dash-text-muted">🎵</div>
          <div className="w-[26px] h-[26px] rounded-full bg-dash-bg flex items-center justify-center text-[10px] text-dash-text-muted">▶</div>
          <div className="w-[26px] h-[26px] rounded-full bg-dash-bg flex items-center justify-center text-[10px] text-dash-text-muted">🐦</div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          {activeLinks.map((link, idx) => {
            const colors = [
              "bg-dash-gold-light",
              "bg-[#eeedfe]",
              "bg-[#e1f5ee]",
              "bg-[#fce8f0]",
              "bg-[#e8f0fc]",
            ];
            const emojis = ["🎵", "✏️", "📞", "📸", "🐦"];
            const colorClass = colors[idx % colors.length];
            const emoji = emojis[idx % emojis.length];

            return (
              <div key={link.id} className="flex items-center gap-2 py-2.5 px-3 rounded-[10px] bg-dash-bg text-[11px] font-medium transition-all">
                <div className={cn("w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[10px] shrink-0", colorClass)}>
                  {emoji}
                </div>
                {link.title}
                {link.smart ? (
                  <span className="ml-auto px-[5px] py-[2px] rounded-full bg-dash-gold-light text-dash-gold-dark text-[7px] font-semibold uppercase">Smart</span>
                ) : (
                  <span className="ml-auto text-dash-text-muted text-[10px]">→</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-4 text-[9px] text-dash-text-muted flex items-center justify-center gap-1">
          <span className="w-1 h-1 rounded-full bg-dash-gold" /> tap-d.link
        </div>
      </div>
    </div>
  );
}
