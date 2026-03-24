"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SmartLink, SocialLink } from "@/types";

/* ------------------------------------------------------------------
   BioPhonePreview — live phone-frame preview of the public bio page.
   All props are live-bound to the editor form state.
------------------------------------------------------------------ */

type Theme = "default" | "dark" | "minimal";

interface BioPhonePreviewProps {
  displayName: string;
  username: string;
  bio: string;
  theme: Theme;
  links: SmartLink[];
  selectedIds: string[];
  socialLinks?: SocialLink[];
}

const THEME = {
  default: {
    screen: "bg-gradient-to-b from-white to-lavender-light/40",
    card:   "bg-lavender-light/70 hover:bg-lavender-light",
    name:   "text-text-primary",
    sub:    "text-text-muted",
    badge:  "bg-white/70 text-[#8e44ad] border border-[#8e44ad]/20",
    branding: "text-text-primary/30",
    socialBg: "bg-black/5",
    socialColor: "#666",
  },
  dark: {
    screen: "bg-gradient-to-b from-dark to-dark-elevated",
    card:   "bg-dark-elevated/80 hover:bg-dark-card border border-white/10",
    name:   "text-white",
    sub:    "text-white/50",
    badge:  "bg-white/10 text-white/70 border border-white/20",
    branding: "text-white/20",
    socialBg: "bg-white/10",
    socialColor: "#fff",
  },
  minimal: {
    screen: "bg-white",
    card:   "bg-white border border-gray-200 hover:border-gray-300",
    name:   "text-gray-900",
    sub:    "text-gray-400",
    badge:  "bg-gray-100 text-gray-500 border border-gray-200",
    branding: "text-gray-300",
    socialBg: "bg-gray-100",
    socialColor: "#555",
  },
} satisfies Record<Theme, Record<string, string>>;

const PASTEL_COLORS = [
  "bg-[#f8f0fc]",
  "bg-[#fce8f0]",
  "bg-[#e8fcf0]",
  "bg-[#e8f0fc]",
  "bg-[#fcf0e8]",
];

/* Platform abbreviation for the tiny preview dots */
const PLATFORM_INITIAL: Record<string, string> = {
  instagram: "IG",
  tiktok:    "TK",
  youtube:   "YT",
  twitter:   "X",
  linkedin:  "in",
  github:    "GH",
  facebook:  "FB",
  twitch:    "TV",
  discord:   "DC",
  telegram:  "TG",
  snapchat:  "SC",
  pinterest: "P",
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "#e1306c",
  tiktok:    "#000",
  youtube:   "#ff0000",
  twitter:   "#000",
  linkedin:  "#0077b5",
  github:    "#333",
  facebook:  "#1877f2",
  twitch:    "#9146ff",
  discord:   "#5865f2",
  telegram:  "#0088cc",
  snapchat:  "#f5c518",
  pinterest: "#e60023",
};

export function BioPhonePreview({
  displayName,
  username,
  bio,
  theme,
  links,
  selectedIds,
  socialLinks = [],
}: BioPhonePreviewProps) {
  const t = THEME[theme] ?? THEME.default;

  const visibleLinks = selectedIds.length > 0
    ? selectedIds.map((id) => links.find((l) => l.id === id)).filter(Boolean) as SmartLink[]
    : links.slice(0, 5);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const filledSocials = socialLinks.filter((sl) => sl.url.trim());

  return (
    /* Phone shell */
    <div className="relative w-[248px] flex-shrink-0 mx-auto">
      {/* Glow behind phone */}
      <div className="absolute inset-0 scale-110 blur-2xl bg-lavender/30 rounded-[40px] pointer-events-none" />

      <div className="relative w-[248px] bg-dark rounded-[36px] shadow-2xl border-[6px] border-dark overflow-hidden shadow-lavender-dark/30">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-dark rounded-b-[14px] z-10" />

        {/* Screen */}
        <div className={cn("px-4 pt-8 pb-6 min-h-[500px] overflow-hidden", t.screen)}>
          {/* Avatar */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender via-accent-pink to-accent-peach flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold font-serif text-lg">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-lavender text-accent-pink">
                <Sparkles size={9} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Name + username */}
          <div className="text-center mb-1">
            <p className={cn("font-serif text-[0.95rem] font-bold leading-tight", t.name)}>
              {displayName || "Your Name"}
            </p>
            <p className={cn("text-[0.6rem] font-medium mt-0.5 uppercase tracking-wider", t.sub)}>
              {username ? `/${username}` : "/username"}
            </p>
          </div>

          {/* Bio */}
          {bio && (
            <p className={cn("text-[0.6rem] text-center leading-relaxed mt-1.5 mb-2 px-2 opacity-75", t.sub)}>
              {bio.length > 80 ? bio.slice(0, 80) + "…" : bio}
            </p>
          )}

          {/* Social icons row */}
          {filledSocials.length > 0 && (
            <div className="flex justify-center gap-1.5 mb-3 mt-2 flex-wrap">
              {filledSocials.slice(0, 8).map((sl) => {
                const color = PLATFORM_COLOR[sl.platform] ?? "#888";
                const label = PLATFORM_INITIAL[sl.platform] ?? sl.platform.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={sl.platform}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[7px] font-black"
                    style={{
                      background: `${color}18`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                    title={sl.platform}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-col gap-2 mt-1">
            {visibleLinks.length === 0 && (
              <p className={cn("text-center text-[0.6rem] opacity-40 py-2", t.sub)}>
                No links selected
              </p>
            )}
            {visibleLinks.slice(0, 5).map((link, idx) => (
              <div
                key={link.id}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200",
                  theme === "default"
                    ? PASTEL_COLORS[idx % PASTEL_COLORS.length]
                    : t.card,
                  "shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06)]"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[0.65rem] font-bold",
                  theme === "dark" ? "bg-white/10 text-white" : "bg-white text-text-primary shadow-sm"
                )}>
                  {link.title[0]?.toUpperCase()}
                </div>
                <span className={cn("text-[0.72rem] font-bold tracking-tight flex-1 truncate", t.name)}>
                  {link.title}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {link.isSmart && (
                    <span className={cn("text-[0.45rem] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full", t.badge)}>
                      Smart
                    </span>
                  )}
                  <ArrowRight size={10} className={cn("opacity-40", theme === "dark" ? "text-white" : "text-text-muted")} />
                </div>
              </div>
            ))}
            {visibleLinks.length > 5 && (
              <p className={cn("text-center text-[0.55rem] opacity-40", t.sub)}>
                +{visibleLinks.length - 5} more
              </p>
            )}
          </div>

          {/* Branding */}
          <div className="mt-5 text-center">
            <span className={cn("inline-flex items-center gap-1 text-[0.5rem] font-black uppercase tracking-widest", t.branding)}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
              tap-d.link
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
