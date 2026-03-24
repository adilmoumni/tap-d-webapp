import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { BioShowcase } from "@/components/landing/BioShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { SEOContent } from "@/components/landing/SEOContent";

export const metadata: Metadata = {
  title: { absolute: "tap-d.link | Smart Short Links, Bio Link Pages & QR Codes" },
  description:
    "Create a short link, build your bio link page, auto-route users by device, and generate QR links. tap-d.link helps creators and businesses launch faster.",
  keywords: [
    "short link",
    "bio link page",
    "smart links",
    "link landing page",
    "QR code links",
    "URL shortener",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "tap-d.link | Smart Short Links, Bio Link Pages & QR Codes",
    description:
      "Short links, bio link pages, smart routing, and QR code links in one platform.",
    url: "https://tap-d.link",
    images: [{ url: "https://tap-d.link/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "tap-d.link | Smart Short Links, Bio Link Pages & QR Codes",
    description:
      "Build short links, bio pages, smart links, and QR links with analytics.",
    images: ["https://tap-d.link/og-image.png"],
  },
};

/* ------------------------------------------------------------------
   Homepage — (landing)/page.tsx
   Composes all landing sections in order. Each section is
   self-contained with its own data and animations.
------------------------------------------------------------------ */
export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "tap-d.link",
        url: "https://tap-d.link",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "A platform for short links, bio link pages, smart device routing, and QR links.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a smart link?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A smart link detects the visitor device and redirects to the right destination, such as App Store, Google Play, or web.",
            },
          },
          {
            "@type": "Question",
            name: "Can I create a bio link page with multiple links?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. You can create a public bio page and add all your links in one place under your own slug.",
            },
          },
          {
            "@type": "Question",
            name: "Does tap-d.link provide QR codes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Every link can have a QR code, so users can scan and open your short link instantly.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <BioShowcase />
      <HowItWorks />
      <Features />
      <SEOContent />
      <Pricing />
      <CTA />
    </>
  );
}
