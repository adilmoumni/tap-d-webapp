/* ------------------------------------------------------------------
   TypeScript interfaces — single source of truth for all data shapes.
   Imported by lib/, hooks/, and components throughout the app.
------------------------------------------------------------------ */

import type { Timestamp } from "firebase/firestore";
import type { PlanId } from "@/config/plans";

/* ---- User & Auth ---- */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string | null;        // chosen @username for bio page
  activeBioId?: string | null;    // pointer to primary bio doc
  plan: PlanId;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/* ---- Smart Link ---- */
export interface SmartLink {
  id: string;
  uid: string;                    // owner uid
  slug: string;                   // e.g. "my-app"
  title: string;
  description?: string;
  icon?: string;
  thumbnailUrl?: string | null;
  // Platform-specific URLs
  urlIOS?: string;
  urlAndroid?: string;
  urlDesktop: string;             // fallback / main URL
  // UTM params (optional)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Metadata
  isActive: boolean;
  clicks: number;
  isSmart: boolean;               // true if has platform-specific URLs
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/* ---- Social Link ---- */
export interface SocialLink {
  platform: string;   // e.g. "instagram"
  url: string;
}

/* ---- Bio Page ---- */
export interface BioPage {
  id: string;
  ownerId: string;
  slug: string;                   // e.g. "mybio" for @ URL
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  // Display order of link ids
  linkIds: string[];
  // Theme
  theme: "default" | "dark" | "minimal";
  lockPassword?: string;
  accentColor?: string;
  // Link Analytics
  clicks: number;
  iosClicks?: number;
  androidClicks?: number;
  desktopClicks?: number;
  countries?: Record<string, number>;
  // Metadata
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/* ---- Click Event (analytics) ---- */
export interface ClickEvent {
  id: string;
  linkId: string;
  uid: string;                    // owner uid
  device: "ios" | "android" | "desktop";
  country?: string;
  referrer?: string;
  createdAt: Timestamp | Date;
}

/* ---- Daily Analytics Aggregate ---- */
export interface DailyStats {
  date: string;                   // YYYY-MM-DD
  clicks: number;
  iosClicks: number;
  androidClicks: number;
  desktopClicks: number;
  countries: Record<string, number>;   // e.g. { US: 42, GB: 7 }
  referrers: Record<string, number>;   // e.g. { twitter_com: 5 }
}

/* ---- Pricing / Plan ---- */
export interface PricingTier {
  id: PlanId;
  name: string;
  monthly: number;
  annual: number;
  features: string[];
  limits: {
    links: number | "unlimited";
    clicks: number | "unlimited";
  };
}
