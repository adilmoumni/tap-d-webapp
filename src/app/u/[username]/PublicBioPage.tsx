"use client";

import { BioPageRenderer } from "@/components/shared/BioPageRenderer";
import { Logo } from "@/components/shared/Logo";
import type { BioPageData } from "@/types/bio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PublicBioPage({ data }: { data: any }) {
  const theme = data.theme ?? {};
  const bgColor = theme.backgroundColor ?? "#faf8fc";
  const accentColor = theme.accentColor ?? "#e8b86d";
  const textColor = theme.textColor ?? "#1a1a2e";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: `linear-gradient(160deg, ${accentColor}35 0%, ${bgColor} 35%, ${bgColor} 65%, ${accentColor}20 100%)`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Card */}
      <div
        className="w-full max-w-[480px] rounded-[28px] overflow-hidden relative"
        style={{
          background: bgColor,
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header: Logo left, Share right */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <a href="/" className="opacity-50 hover:opacity-80 transition-opacity">
            <Logo size="sm" theme="light" iconOnly />
          </a>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  url: window.location.href,
                  title: data.displayName,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="w-9 h-9 rounded-full border flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
            style={{ borderColor: textColor + "25" }}
            title="Share"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={textColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        {/* Bio content */}
        <div className="px-5 pb-10">
          <BioPageRenderer
            data={data as unknown as BioPageData}
            variant="public"
          />
        </div>

        {/* Powered by footer inside card */}
        <div
          className="flex items-center justify-center gap-1.5 pb-5 opacity-30"
          style={{ fontSize: "11px", color: textColor }}
        >
          <span
            className="rounded-full inline-block"
            style={{
              width: "5px",
              height: "5px",
              background: accentColor,
            }}
          />
          <span className="font-medium">tap-d.link</span>
        </div>
      </div>
    </div>
  );
}
