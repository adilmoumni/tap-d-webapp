/* ------------------------------------------------------------------
   Site Configuration — metadata, nav links, stats.
------------------------------------------------------------------ */

export const siteConfig = {
  name: "tap-d.link",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link",
  description:
    "Short links, bio link pages, smart links, and QR code links for creators and brands.",
  tagline: "Short links. Smart routing. One bio link.",
};

export const navLinks = [
  { label: "For Creators", href: "#bio" },
  { label: "Smart Links", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
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
