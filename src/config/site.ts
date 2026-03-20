/* ------------------------------------------------------------------
   Site Configuration — metadata, nav links, stats.
------------------------------------------------------------------ */

export const siteConfig = {
  name: "tap-d.link",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link",
  description:
    "The smart link-in-bio for creators. One page for all your links — with device detection that sends your audience to the right app store automatically.",
  tagline: "One Link for Everything. Smart Enough to Know Where.",
};

export const navLinks = [
  { label: "For Creators", href: "#bio" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Bio Pages", href: "#bio" },
      { label: "Smart Links", href: "#features" },
      { label: "Analytics", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "API Docs", href: "#docs" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Instagram", href: "#" },
];

export const stats = [
  { number: "50ms", label: "Average redirect" },
  { number: "99.9%", label: "Uptime SLA" },
  { number: "0", label: "Ads shown. Ever." },
  { number: "∞", label: "Link lifetime" },
];
