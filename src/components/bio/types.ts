/* ─────────────────────────────────────────────
   Shared types for the bio page renderer.
   Used by: public page, phone preview, dashboard preview.
───────────────────────────────────────────── */

export interface BioTheme {
  background: string;
  cardBackground: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  buttonStyle: "filled" | "outline" | "shadow";
  buttonRadius: "rounded" | "pill" | "square";
  font: "inter" | "serif" | "mono";
  headerFont: "inter" | "serif" | "mono";
  showBranding: boolean;
  showUsername: boolean;
}

export interface BioLinkItem {
  id: string;
  title: string;
  slug?: string;
  smart: boolean;
}

export interface BioSocialLink {
  platform: string;
  url: string;
}

export interface BioPageData {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks: BioSocialLink[];
  links: BioLinkItem[];
  theme: BioTheme;
}

export const DEFAULT_BIO_THEME: BioTheme = {
  background: "#faf8fc",
  cardBackground: "#ffffff",
  textColor: "#1a1a2e",
  mutedColor: "#7c7c96",
  accentColor: "#e8b86d",
  buttonStyle: "filled",
  buttonRadius: "rounded",
  font: "inter",
  headerFont: "serif",
  showBranding: true,
  showUsername: true,
};

export const FONT_STACKS: Record<BioTheme["font"], string> = {
  inter:  "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  serif:  "'Playfair Display', Georgia, serif",
  mono:   "'JetBrains Mono', monospace",
};

export const RADIUS_MAP: Record<BioTheme["buttonRadius"], string> = {
  rounded: "14px",
  pill:    "999px",
  square:  "0px",
};
