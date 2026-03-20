"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Card variants:
   • default  — white bg, border, hover lift (landing sections)
   • pastel   — colored bg for feature cards (.f-card pattern)
   • dark     — dark bg for pricing featured card + dashboard
   • glass    — frosted glass (navbar pill + overlay cards)
------------------------------------------------------------------ */

type CardVariant = "default" | "pastel" | "dark" | "glass";
type PastelColor = "lavender" | "pink" | "mint" | "peach" | "blue" | "lilac";

const pastelMap: Record<PastelColor, string> = {
  lavender: "bg-[#e8e3f5] hover:bg-[#ddd6f3]",
  pink:     "bg-[#fce8f0] hover:bg-[#f8d4e4]",
  mint:     "bg-[#e0f5ec] hover:bg-[#c8eddd]",
  peach:    "bg-[#fef0e0] hover:bg-[#fce4c8]",
  blue:     "bg-[#e0ecf8] hover:bg-[#c8ddf2]",
  lilac:    "bg-[#ede8fc] hover:bg-[#dbd4f0]",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Only used when variant="pastel" */
  color?: PastelColor;
  /** Disable the hover lift animation */
  noHover?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  color = "lavender",
  noHover = false,
  className,
  children,
  ...props
}: CardProps) {
  const base = "rounded-xl transition-all duration-350";

  const variantClasses: Record<CardVariant, string> = {
    default: cn(
      "bg-surface border border-border shadow-card",
      !noHover && "hover:-translate-y-1 hover:shadow-md"
    ),
    pastel: cn(
      pastelMap[color],
      !noHover && "hover:-translate-y-1"
    ),
    dark: cn(
      "bg-dark-card border border-white/[0.07] text-text-on-dark",
      !noHover && "hover:-translate-y-1"
    ),
    glass: cn(
      "bg-white/65 backdrop-blur-[20px] saturate-180 border border-border/50",
      !noHover && "hover:-translate-y-0.5"
    ),
  };

  return (
    <div className={cn(base, variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   CardContent / CardHeader sub-components for composability
------------------------------------------------------------------ */
export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
