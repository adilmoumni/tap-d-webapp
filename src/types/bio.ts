/* ------------------------------------------------------------------
   Bio Page types — Firestore-ready interfaces.
   Used by: lib/db/bio.ts, dashboard editors, public page.
------------------------------------------------------------------ */

import type { Timestamp } from "firebase/firestore";

/* ── Theme ── */

export interface BioTheme {
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: "inter" | "serif" | "mono";
  buttonStyle: "rounded" | "pill" | "square";
  buttonFill: "filled" | "outline" | "shadow";
  wallpaper: "flat" | "image" | "gradient";
  wallpaperImageUrl?: string;
  showBranding: boolean;
  showJoinCta: boolean;
  headerLayout: "classic" | "hero";
  titleSize: "small" | "large";
}

export const DEFAULT_THEME: BioTheme = {
  backgroundColor: "#faf8fc",
  buttonColor: "#f0eeea",
  buttonTextColor: "#1a1a2e",
  accentColor: "#e8b86d",
  textColor: "#1a1a2e",
  fontFamily: "inter",
  buttonStyle: "rounded",
  buttonFill: "filled",
  wallpaper: "flat",
  showBranding: true,
  showJoinCta: true,
  headerLayout: "classic",
  titleSize: "small",
};

/* ── Social link ── */

export interface BioSocialLink {
  platform: string;
  url: string;
  icon: string;
  order: number;
}

/* ── Link ── */

export interface BioLink {
  id: string;
  title: string;
  url: string;
  slug: string;
  icon: string;
  isSmart: boolean;
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl: string;
  isVisible: boolean;
  isActive: boolean;
  clicks: number;
  iosClicks?: number;
  androidClicks?: number;
  desktopClicks?: number;
  countries?: Record<string, number>;
  referrers?: Record<string, number>;
  order: number;
  layout?: "classic" | "featured";
  thumbnailUrl?: string | null;
  lockType?: "none" | "code" | "password" | "sensitive";
  lockCode?: string | null;
  lockPassword?: string | null;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  prioritize?: "none" | "animate" | "redirect";
  animationType?: "buzz" | "wobble" | "pop" | "swipe";
  redirectUntil?: string | null;
  createdAt: Timestamp;
}

/* ── Bio page document ── */

export interface BioPageData {
  ownerId: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: BioSocialLink[];
  links: BioLink[];
  theme: BioTheme;
  isPublic: boolean;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

/* ── Visitor analytics ── */

/** Raw view event stored in views/{viewId} */
export interface BioVisitorDoc {
  id: string;
  bioId: string;
  ownerId: string;
  device: "ios" | "android" | "desktop";
  country: string | null;
  referrer: string;         // hostname or "direct"
  createdAt: string | null; // ISO string after serialization
}

/** Daily aggregate stored in biopages/{bioId}/stats/{date} */
export interface BioVisitStats {
  date: string;             // YYYY-MM-DD
  totalViews: number;
  iosViews: number;
  androidViews: number;
  desktopViews: number;
  countries: Record<string, number>;
  referrers: Record<string, number>;
}
