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
  // Platform-specific URLs
  urlIOS?: string;
  urlAndroid?: string;
  urlDesktop: string;             // fallback / main URL
  // UTM params (optional)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Metadata
  active: boolean;
  clickCount: number;
  isSmart: boolean;               // true if has platform-specific URLs
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/* ---- Bio Page ---- */
export interface BioPage {
  id: string;
  uid: string;
  username: string;               // @username, unique across all users
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  // Display order of link ids
  linkIds: string[];
  // Theme
  theme: "default" | "dark" | "minimal";
  accentColor?: string;
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
