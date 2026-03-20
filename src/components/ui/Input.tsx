"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Input – styled input with label, prefix slot, and focus ring.
   Matches the lavender light/border pattern from the design system.
   Supports:
   • prefix   – prepend a string (e.g. "tap-d.link /")
   • mono     – JetBrains Mono for URL inputs
   • label + helperText
------------------------------------------------------------------ */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: string;
  /** Use mono font for URL / slug inputs */
  mono?: boolean;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, helperText, errorText, prefix, mono, wrapperClassName, className, id, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(errorText);

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-text-primary leading-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex items-center rounded-xl border bg-surface",
            "transition-all duration-200",
            "focus-within:border-lavender focus-within:bg-lavender-light/30 focus-within:ring-2 focus-within:ring-lavender/30",
            hasError
              ? "border-error/60 focus-within:ring-error/20"
              : "border-border hover:border-lavender"
          )}
        >
          {prefix && (
            <span className="pl-3.5 pr-1 text-sm font-medium text-text-muted whitespace-nowrap font-mono select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted",
              "outline-none border-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              prefix && "pl-1",
              mono && "font-mono",
              className
            )}
            {...props}
          />
        </div>

        {(helperText || errorText) && (
          <p
            className={cn(
              "text-xs leading-snug",
              hasError ? "text-error" : "text-text-muted"
            )}
          >
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
