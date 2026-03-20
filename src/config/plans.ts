/* ------------------------------------------------------------------
   Plans Configuration — single source of truth for pricing data.
   Consumed by Pricing.tsx and any plan-gating logic.
------------------------------------------------------------------ */

export type PlanId = "free" | "pro" | "team";

export interface PlanFeature {
  label: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: PlanFeature[];
  ctaLabel: string;
  featured: boolean;
  limits: {
    links: number | "unlimited";
    clicks: number | "unlimited";
    bioPages: number | "unlimited";
    members: number | "unlimited";
    customDomains: number | "unlimited";
    analyticsRetentionDays: number;
  };
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "For creators just getting started.",
    featured: false,
    ctaLabel: "Get Started Free",
    limits: {
      links: 10,
      clicks: 5000,
      bioPages: 1,
      members: 1,
      customDomains: 0,
      analyticsRetentionDays: 365,
    },
    features: [
      { label: "1 bio page (tap-d.link/@you)" },
      { label: "10 smart links" },
      { label: "5,000 clicks / month" },
      { label: "Analytics (1 year)" },
      { label: "QR codes" },
      { label: "API access" },
      { label: "No ads, ever" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 7, annual: 5 },
    description: "For growing creators and campaigns.",
    featured: true,
    ctaLabel: "Start Pro — 14 days free",
    limits: {
      links: 100,
      clicks: 50000,
      bioPages: "unlimited",
      members: 1,
      customDomains: 0,
      analyticsRetentionDays: 730,
    },
    features: [
      { label: "Unlimited bio pages" },
      { label: "100 smart links" },
      { label: "50,000 clicks / month" },
      { label: "Custom themes" },
      { label: "A/B testing" },
      { label: "Scheduled links" },
      { label: "QR studio + logo" },
      { label: "Remove branding" },
    ],
  },
  {
    id: "team",
    name: "Team",
    price: { monthly: 20, annual: 15 },
    description: "For agencies and teams at scale.",
    featured: false,
    ctaLabel: "Start Team Trial",
    limits: {
      links: "unlimited",
      clicks: 500000,
      bioPages: "unlimited",
      members: 5,
      customDomains: 1,
      analyticsRetentionDays: 1825,
    },
    features: [
      { label: "Unlimited everything" },
      { label: "500K clicks / month" },
      { label: "5 team members" },
      { label: "1 custom domain" },
      { label: "Role-based access" },
      { label: "Priority support" },
      { label: "Bulk link import" },
    ],
  },
];
