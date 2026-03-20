import type { Metadata } from "next";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: "Pricing — tap-d.link",
  description: "Simple, transparent pricing for every creator. Start free, upgrade when you're ready.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="pt-28 pb-12">
      <Pricing />
      <CTA />
    </div>
  );
}
