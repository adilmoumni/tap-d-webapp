"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Badge – matches the landing page's .f-tag and .bps-smart patterns
   • plan:     'free' | 'pro' | 'team' (for pricing / feature cards)
   • tag:      'smart' | 'new' | 'soon' (for link items / features)
   • custom:   raw color override
------------------------------------------------------------------ */

type BadgeVariant = "free" | "pro" | "team" | "smart" | "new" | "soon" | "default";

const variantMap: Record<BadgeVariant, string> = {
  // Plan badges — match .f-tag from HTML template
  free: "bg-lavender-light text-text-secondary",
  pro: "bg-accent-lilac/30 text-purple-700",
  team: "bg-accent-blue/30 text-blue-700",
  // Feature / link badges — match .bps-smart / .bio-m-smart
  smart: "bg-lavender-light text-[#6b5b95]",
  new: "bg-accent-mint/30 text-emerald-700",
  soon: "bg-accent-peach/40 text-orange-700",
  default: "bg-surface-muted text-text-muted border border-border",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-[0.05em]",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
