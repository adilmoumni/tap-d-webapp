"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Skeleton – animated loading placeholder with lavender-light pulse.
   Used in dashboard link cards and analytics charts while loading.
------------------------------------------------------------------ */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Explicit width (Tailwind class or inline) */
  width?: string;
  /** Explicit height (Tailwind class or inline) */
  height?: string;
  /** Make it a circle (for avatars) */
  circle?: boolean;
}

export function Skeleton({ width, height, circle, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-lavender-light rounded-lg",
        circle && "rounded-full",
        width,
        height,
        className
      )}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ------------------------------------------------------------------
   SkeletonCard – a pre-built skeleton for a link card row
------------------------------------------------------------------ */
export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface">
      <Skeleton circle width="w-10" height="h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-1/3" height="h-3.5" />
        <Skeleton width="w-1/2" height="h-3" />
      </div>
      <Skeleton width="w-16" height="h-7" className="rounded-full" />
    </div>
  );
}
