"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SmartLink } from "@/types";

/* ------------------------------------------------------------------
   LinkCard — flat horizontal row, matches the dashboard mockup.
   Pastel icon box · title + slug · badge · click count
------------------------------------------------------------------ */

/* Cycling pastel icon backgrounds */
const ICO_COLORS = [
  "#faeeda", // amber
  "#e1f5ee", // mint
  "#eeedfe", // lavender
  "#fbeaf0", // pink
];

interface LinkCardProps {
  link: SmartLink;
  onDelete: (id: string) => void;
  index?: number;
}

export function LinkCard({ link, onDelete, index = 0 }: LinkCardProps) {
  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link"}/${link.slug}`;
  const iconBg = ICO_COLORS[index % ICO_COLORS.length];
  const initial = link.title[0]?.toUpperCase() ?? "L";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-[14px] py-3",
        "bg-surface border border-border rounded-xl",
        "hover:border-lavender transition-colors duration-150 cursor-pointer",
        !link.active && "opacity-60"
      )}
    >
      {/* Pastel icon box */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base font-semibold flex-shrink-0"
        style={{ background: iconBg, color: "#5b4a2f" }}
      >
        {initial}
      </div>

      {/* Title + slug */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary truncate">{link.title}</p>
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] text-text-secondary font-mono hover:text-lavender-dark transition-colors"
        >
          /{link.slug}
        </a>
      </div>

      {/* Smart / Regular badge */}
      {link.isSmart ? (
        <span className="px-2 py-[2px] rounded-full text-[10px] font-medium bg-[#faeeda] text-[#854f0b] flex-shrink-0">
          Smart
        </span>
      ) : (
        <span className="px-2 py-[2px] rounded-full text-[10px] font-medium bg-lavender-light text-text-secondary flex-shrink-0">
          Regular
        </span>
      )}

      {/* Click count */}
      <div className="text-right flex-shrink-0 min-w-[50px]">
        <p className="text-[13px] font-medium text-text-primary">
          {link.clickCount.toLocaleString()}
        </p>
        <p className="text-[10px] text-text-secondary">clicks</p>
      </div>

      {/* Edit / Delete — shown on hover via group */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/d/links/${link.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-text-primary hover:bg-lavender-light transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
          className="px-2 py-1 rounded-lg text-[11px] text-text-muted hover:text-error hover:bg-red-50 transition-colors"
        >
          Del
        </button>
      </div>
    </div>
  );
}
