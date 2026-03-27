/* ------------------------------------------------------------------
   Theme presets — complete visual identities for bio pages.
   Each preset overrides BioTheme fields and includes an optional
   backgroundCss for rich backgrounds (CSS gradients or SVG marble).
------------------------------------------------------------------ */

import type { BioTheme } from "@/types/bio";

export interface ThemePreset {
  id: string;
  name: string;
  /** Hex color used for the preview card background (fast render). */
  previewBg: string;
  theme: Partial<BioTheme>;
}

/* ── SVG pattern helpers ── */

const dotPattern = (color: string, size = 1, gap = 20) =>
  `url("data:image/svg+xml,%3Csvg width='${gap}' height='${gap}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${size}' cy='${size}' r='${size}' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`;

const gridPattern = (color: string, gap = 40) =>
  `url("data:image/svg+xml,%3Csvg width='${gap}' height='${gap}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${gap} 0 L 0 0 0 ${gap}' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3C/svg%3E")`;

/** Marble SVG served as a static asset from /public/themes/. */
const marble = (name: string, fallback: string) =>
  `url('/themes/${name}.svg') center/cover no-repeat fixed, ${fallback}`;

/* ================================================================
   Presets
   ================================================================ */

export const THEME_PRESETS: ThemePreset[] = [

  /* ─────────── Marble / Fluid Art ─────────── */

  {
    id: "agate",
    name: "Agate",
    previewBg: "#1a6b5a",
    theme: {
      backgroundColor: "#0a2e22",
      buttonColor: "rgba(255,255,255,0.1)",
      buttonTextColor: "#d1fae5",
      textColor: "#ecfdf5",
      accentColor: "#34d399",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: marble("agate", "#0a2e22"),
    },
  },
  {
    id: "bliss",
    name: "Bliss",
    previewBg: "#8b5068",
    theme: {
      backgroundColor: "#2e1225",
      buttonColor: "rgba(255,255,255,0.1)",
      buttonTextColor: "#fce7f3",
      textColor: "#fdf2f8",
      accentColor: "#f472b6",
      fontFamily: "serif",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: marble("bliss", "#2e1225"),
    },
  },
  {
    id: "groove",
    name: "Groove",
    previewBg: "#4a2080",
    theme: {
      backgroundColor: "#1a0a35",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#e9d5ff",
      textColor: "#f5d0fe",
      accentColor: "#a855f7",
      fontFamily: "mono",
      buttonStyle: "round",
      buttonFill: "outline",
      backgroundCss: marble("groove", "#1a0a35"),
    },
  },
  {
    id: "sweat",
    name: "Sweat",
    previewBg: "#7a2878",
    theme: {
      backgroundColor: "#1a0a1e",
      buttonColor: "rgba(255,255,255,0.1)",
      buttonTextColor: "#fae8ff",
      textColor: "#fdf4ff",
      accentColor: "#e879f9",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: marble("sweat", "#1a0a1e"),
    },
  },
  {
    id: "tress",
    name: "Tress",
    previewBg: "#7a5028",
    theme: {
      backgroundColor: "#1c1208",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#fef3c7",
      textColor: "#fefce8",
      accentColor: "#fbbf24",
      fontFamily: "serif",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: marble("tress", "#1c1208"),
    },
  },
  {
    id: "haven",
    name: "Haven",
    previewBg: "#4a5540",
    theme: {
      backgroundColor: "#1a1f15",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#d9f99d",
      textColor: "#ecfccb",
      accentColor: "#a3e635",
      fontFamily: "inter",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: marble("haven", "#1a1f15"),
    },
  },
  {
    id: "ember-marble",
    name: "Ember",
    previewBg: "#8a3818",
    theme: {
      backgroundColor: "#1c0a04",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#fed7aa",
      textColor: "#fff7ed",
      accentColor: "#fb923c",
      fontFamily: "serif",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: marble("ember", "#1c0a04"),
    },
  },
  {
    id: "storm-marble",
    name: "Storm",
    previewBg: "#2a3548",
    theme: {
      backgroundColor: "#0c1220",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#cbd5e1",
      textColor: "#e2e8f0",
      accentColor: "#94a3b8",
      fontFamily: "inter",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: marble("storm", "#0c1220"),
    },
  },

  /* ─────────── Light & Clean ─────────── */

  {
    id: "air",
    name: "Air",
    previewBg: "#f0f5ff",
    theme: {
      backgroundColor: "#f8fafc",
      buttonColor: "#ffffff",
      buttonTextColor: "#334155",
      textColor: "#1e293b",
      accentColor: "#3b82f6",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "linear-gradient(180deg, #eef2ff 0%, #f8fafc 50%, #f0f5ff 100%)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    previewBg: "#f5f0e8",
    theme: {
      backgroundColor: "#faf9f6",
      buttonColor: "#f5f0e8",
      buttonTextColor: "#3d3929",
      textColor: "#2d2a1e",
      accentColor: "#b8860b",
      fontFamily: "serif",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: `${dotPattern("rgba(180,160,120,0.12)", 1, 24)}, linear-gradient(180deg, #faf9f6 0%, #f5f0e8 100%)`,
    },
  },
  {
    id: "mineral",
    name: "Mineral",
    previewBg: "#f0ece6",
    theme: {
      backgroundColor: "#faf8f5",
      buttonColor: "#f0ece6",
      buttonTextColor: "#44403c",
      textColor: "#292524",
      accentColor: "#a8a29e",
      fontFamily: "inter",
      buttonStyle: "square",
      buttonFill: "outline",
      backgroundCss: "linear-gradient(180deg, #faf8f5 0%, #f5f0eb 100%)",
    },
  },

  /* ─────────── Colorful Light ─────────── */

  {
    id: "lavender",
    name: "Lavender",
    previewBg: "#e9e5ff",
    theme: {
      backgroundColor: "#f5f3ff",
      buttonColor: "#ede9fe",
      buttonTextColor: "#4c1d95",
      textColor: "#2e1065",
      accentColor: "#8b5cf6",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(196,181,253,0.15) 0%, transparent 50%), linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    previewBg: "#ffe0e5",
    theme: {
      backgroundColor: "#fff1f2",
      buttonColor: "#ffe4e6",
      buttonTextColor: "#9f1239",
      textColor: "#881337",
      accentColor: "#f43f5e",
      fontFamily: "serif",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 30% 0%, rgba(251,113,133,0.18) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(253,164,175,0.12) 0%, transparent 50%), linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
    },
  },
  {
    id: "breeze",
    name: "Breeze",
    previewBg: "#dbeffe",
    theme: {
      backgroundColor: "#f0f9ff",
      buttonColor: "#e0f2fe",
      buttonTextColor: "#0c4a6e",
      textColor: "#0c4a6e",
      accentColor: "#0ea5e9",
      fontFamily: "inter",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 100%, rgba(125,211,252,0.1) 0%, transparent 50%), linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
    },
  },
  {
    id: "candy",
    name: "Candy",
    previewBg: "#fce7f3",
    theme: {
      backgroundColor: "#fdf2f8",
      buttonColor: "#fbcfe8",
      buttonTextColor: "#831843",
      textColor: "#701a75",
      accentColor: "#ec4899",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 0% 0%, rgba(249,168,212,0.3) 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, rgba(196,181,253,0.25) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(253,186,116,0.2) 0%, transparent 50%), linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%)",
    },
  },

  /* ─────────── Dark Gradients ─────────── */

  {
    id: "midnight",
    name: "Midnight",
    previewBg: "#18181b",
    theme: {
      backgroundColor: "#09090b",
      buttonColor: "#18181b",
      buttonTextColor: "#e4e4e7",
      textColor: "#fafafa",
      accentColor: "#a1a1aa",
      fontFamily: "inter",
      buttonStyle: "round",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 50% 0%, rgba(63,63,70,0.4) 0%, transparent 50%), linear-gradient(180deg, #18181b 0%, #09090b 100%)",
    },
  },
  {
    id: "void",
    name: "Void",
    previewBg: "#000000",
    theme: {
      backgroundColor: "#000000",
      buttonColor: "rgba(255,255,255,0.06)",
      buttonTextColor: "#d4d4d8",
      textColor: "#ffffff",
      accentColor: "#ffffff",
      fontFamily: "mono",
      buttonStyle: "square",
      buttonFill: "outline",
      backgroundCss: "#000000",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    previewBg: "#a8205a",
    theme: {
      backgroundColor: "#1a0a0e",
      buttonColor: "rgba(255,255,255,0.12)",
      buttonTextColor: "#fce7f3",
      textColor: "#ffffff",
      accentColor: "#fb923c",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "linear-gradient(160deg, #4c1d95 0%, #be123c 40%, #ea580c 100%)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    previewBg: "#0c4a6e",
    theme: {
      backgroundColor: "#0c1222",
      buttonColor: "rgba(255,255,255,0.1)",
      buttonTextColor: "#e0f2fe",
      textColor: "#f0f9ff",
      accentColor: "#38bdf8",
      fontFamily: "inter",
      buttonStyle: "full",
      buttonFill: "solid",
      backgroundCss: "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.3) 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #0c4a6e 50%, #164e63 100%)",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    previewBg: "#0d3028",
    theme: {
      backgroundColor: "#0a0e1a",
      buttonColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#d1fae5",
      textColor: "#ecfdf5",
      accentColor: "#34d399",
      fontFamily: "mono",
      buttonStyle: "round",
      buttonFill: "outline",
      backgroundCss: "radial-gradient(ellipse at 20% 30%, rgba(52,211,153,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(56,189,248,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 10%, rgba(167,139,250,0.2) 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #0a0e1a 50%, #042f2e 100%)",
    },
  },
  {
    id: "gold",
    name: "Gold",
    previewBg: "#2a1f08",
    theme: {
      backgroundColor: "#1a1408",
      buttonColor: "rgba(234,179,8,0.12)",
      buttonTextColor: "#fef3c7",
      textColor: "#fef9c3",
      accentColor: "#eab308",
      fontFamily: "serif",
      buttonStyle: "full",
      buttonFill: "outline",
      backgroundCss: "radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(161,98,7,0.15) 0%, transparent 50%), linear-gradient(180deg, #1c1917 0%, #1a1408 100%)",
    },
  },

  /* ─────────── Textured / Pattern ─────────── */

  {
    id: "grid",
    name: "Grid",
    previewBg: "#f5f5f4",
    theme: {
      backgroundColor: "#fafaf9",
      buttonColor: "#ffffff",
      buttonTextColor: "#1c1917",
      textColor: "#0c0a09",
      accentColor: "#0c0a09",
      fontFamily: "mono",
      buttonStyle: "square",
      buttonFill: "outline",
      backgroundCss: `${gridPattern("rgba(0,0,0,0.06)", 32)}, linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)`,
    },
  },
];
