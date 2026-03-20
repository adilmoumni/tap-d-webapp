"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Button variants extracted from the landing page HTML template:
   • primary  → hero style: dark bg, white text, pink dot, pill shape
   • secondary → white/border style (nav-cta / p-btn pattern)
   • accent   → accent-pink bg (hero-cta pattern)
   • ghost    → transparent with subtle hover
   • danger   → red tones for destructive actions
------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-dark text-text-on-dark border border-transparent " +
    "hover:bg-dark-elevated hover:-translate-y-0.5 hover:shadow-md",
  secondary:
    "bg-surface text-text-primary border border-border " +
    "hover:bg-lavender-light hover:-translate-y-0.5",
  accent:
    "bg-accent-pink text-dark border border-transparent " +
    "hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-110",
  ghost:
    "bg-transparent text-text-secondary border border-transparent " +
    "hover:bg-lavender-light hover:text-text-primary",
  danger:
    "bg-error text-white border border-transparent " +
    "hover:brightness-110 hover:-translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3.5 text-[0.95rem] gap-2.5",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Show the pink dot decoration (primary / accent buttons) */
  dot?: boolean;
  /** Full width */
  full?: boolean;
  /** Render as a child element (e.g. inside a Next.js <Link>) */
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  dot = false,
  full = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-full " +
    "transition-all duration-250 cursor-pointer select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender " +
    "disabled:opacity-50 disabled:pointer-events-none font-sans";

  const classes = cn(base, variantClasses[variant], sizeClasses[size], full && "w-full", className);

  if (asChild) {
    // When used as a wrapper for <Link>, clone and forward classes
    const child = React.Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement>
    >;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      ...props,
    });
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {dot && (
        <span
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "accent" ? "bg-dark opacity-40" : "bg-accent-pink"
          )}
        />
      )}
      {children}
    </button>
  );
}
