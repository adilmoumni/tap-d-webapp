import type { Metadata } from "next";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: { absolute: "tap-d.link Pricing | Short Links, Bio Pages, Smart Links & QR" },
  description:
    "Simple pricing for short links, bio link pages, smart routing, and QR code links. Start free and scale when you need more.",
  keywords: [
    "short link pricing",
    "bio link pricing",
    "smart link pricing",
    "QR code link pricing",
  ],
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "tap-d.link Pricing | Short Links, Bio Pages, Smart Links & QR",
    description:
      "Compare plans for short links, smart links, bio pages, QR codes, and analytics.",
    url: "https://tap-d.link/pricing",
    images: [{ url: "https://tap-d.link/og-image.png", width: 1200, height: 630 }],
  },
};

export default function PricingPage() {
  return (
    <div className="pt-28 pb-12">
      <Pricing />
      <CTA />
    </div>
  );
}
