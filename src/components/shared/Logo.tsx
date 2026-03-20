import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Logo – brand identifier using SVG assets from public/logo/
   
   Props:
   • size: 'sm' | 'md' | 'lg'
   • theme: 'light' (dark text for light bg) | 'dark' (white text for dark bg)
   • tagline: show tagline below (for footer)
   • iconOnly: show only the logo mark without text
------------------------------------------------------------------ */

type LogoSize = "sm" | "md" | "lg";
type LogoTheme = "light" | "dark";

interface LogoProps {
  size?: LogoSize;
  theme?: LogoTheme;
  tagline?: boolean;
  iconOnly?: boolean;
  className?: string;
}

const heightMap: Record<LogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
};

const iconHeightMap: Record<LogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function Logo({ 
  size = "md", 
  theme = "dark", 
  tagline = false, 
  iconOnly = false,
  className 
}: LogoProps) {
  
  // Theme mapping: 
  // 'dark' theme means light text on dark background
  // 'light' theme means dark text on light background
  const logoSrc = iconOnly 
    ? (theme === "dark" ? "/logo/logo-icon-white.svg" : "/logo/logo-icon-dark.svg")
    : (theme === "dark" ? "/logo/logo-full-white-text.svg" : "/logo/logo-full-dark-text.svg");

  const height = iconOnly ? iconHeightMap[size] : heightMap[size];

  return (
    <div className={cn("inline-flex flex-col items-start", className)}>
      <div className="relative flex items-center">
        <Image
          src={logoSrc}
          alt="tap-d.link Logo"
          height={height}
          width={iconOnly ? height : (height * 4)} // Approximation, Image will maintain aspect ratio if one is provided
          className="w-auto"
          style={{ height: `${height}px` }}
          priority
        />
      </div>

      {tagline && !iconOnly && (
        <p
          className={cn(
            "mt-3 font-serif italic font-normal leading-snug text-balance",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
            theme === "dark" ? "text-text-on-dark/70" : "text-text-secondary"
          )}
        >
          The link-in-bio where smart routing
          <br />
          meets real performance
        </p>
      )}
    </div>
  );
}
