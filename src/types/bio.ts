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
  clicks: number;
  order: number;
  thumbnailUrl?: string;
  lockType?: "none" | "code" | "password" | "sensitive";
  lockCode?: string;
  lockPassword?: string;
  scheduledAt?: Timestamp | null;
  createdAt: Timestamp;
}

/* ── Bio page document ── */

export interface BioPageData {
  username: string;
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
