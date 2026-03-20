import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { BioShowcase } from "@/components/landing/BioShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: "tap-d.link — One Link for Everything. Smart Enough to Know Where.",
  description:
    "The smart link-in-bio for creators. One page for all your links — with device detection that sends your audience to the right app store automatically.",
  alternates: { canonical: "/" },
};

/* ------------------------------------------------------------------
   Homepage — (landing)/page.tsx
   Composes all landing sections in order. Each section is
   self-contained with its own data and animations.
------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <>
      <Hero />
      <BioShowcase />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
    </>
  );
}
