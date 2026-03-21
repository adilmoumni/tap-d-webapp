"use client";

import { Share2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

const mockLinks = [
  { icon: "♫", label: "Spotify playlist", iconBg: "bg-[#faeeda]", smart: true },
  { icon: "🎨", label: "ColorPal app",     iconBg: "bg-[#e1f5ee]", smart: true },
  { icon: "▶",  label: "Design course",    iconBg: "bg-[#eeedfe]", smart: false },
  { icon: "📸", label: "Instagram",        iconBg: "bg-[#fbeaf0]", smart: false },
  { icon: "▶",  label: "YouTube",          iconBg: "bg-[#e3f2fd]", smart: false },
];

const socials = ["ig", "tw", "yt", "tk"];

export function PhonePreview() {
  const { activeSection } = useDashboard();

  if (activeSection !== "bio") return null;

  return (
    <aside className="w-[360px] flex-shrink-0 bg-[#f5f3f0] border-l border-[#e8e6e2] flex flex-col items-center px-4 py-5 overflow-y-auto">
      {/* URL bar */}
      <div className="flex items-center gap-2 w-full px-3.5 py-[7px] bg-white border border-[#e8e6e2] rounded-full text-[11px] text-[#8a8a9a] mb-4">
        <span className="font-medium text-[#1a1a2e]">tap-d.link/@emma</span>
        <Share2 size={14} className="ml-auto opacity-30 cursor-pointer flex-shrink-0" />
      </div>

      {/* Phone frame */}
      <div className="w-[260px] bg-white rounded-[30px] p-3.5 border border-[#e8e6e2]" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
        {/* Notch */}
        <div className="w-[70px] h-[5px] bg-[#f5f3f0] rounded-full mx-auto mb-3.5" />

        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#f5f3f0] mx-auto mb-2 flex items-center justify-center text-lg text-[#8a8a9a]">
          E
        </div>

        {/* Name */}
        <p className="text-center text-[14px] font-semibold text-[#1a1a2e] mb-0.5">
          @emma.creates
        </p>

        {/* Bio text */}
        <p className="text-center text-[10px] text-[#8a8a9a] leading-relaxed mb-3 px-1.5">
          Designer &amp; creator. Building ColorPal.
        </p>

        {/* Social icons */}
        <div className="flex gap-1.5 justify-center mb-3.5">
          {socials.map((s) => (
            <div
              key={s}
              className="w-[26px] h-[26px] rounded-full bg-[#f5f3f0] flex items-center justify-center text-[10px] text-[#8a8a9a] font-medium"
            >
              {s[0].toUpperCase()}
            </div>
          ))}
        </div>

        {/* Link items */}
        <div className="flex flex-col gap-1.5">
          {mockLinks.map((link) => (
            <div
              key={link.label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[#f5f3f0] text-[11px] font-medium text-[#1a1a2e]"
            >
              <div
                className={cn(
                  "w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[10px] flex-shrink-0",
                  link.iconBg
                )}
              >
                {link.icon}
              </div>
              <span className="flex-1 truncate">{link.label}</span>
              {link.smart ? (
                <span className="px-1.5 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[7px] font-bold uppercase tracking-wide flex-shrink-0">
                  Smart
                </span>
              ) : (
                <span className="text-[#8a8a9a] text-[10px] flex-shrink-0">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 mt-4 text-[9px] text-[#8a8a9a]">
          <span className="w-1 h-1 rounded-full bg-[#e8b86d]" />
          tap-d.link
        </div>
      </div>
    </aside>
  );
}
