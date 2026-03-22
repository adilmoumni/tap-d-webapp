"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FloatingCards } from "./FloatingCards";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------
   Hero – dark full-height section with rounded bottom corners.
   Matches .hero from the HTML template.
------------------------------------------------------------------ */

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
});

export function Hero() {
  const { user } = useAuth();

  return (
    <section
      className="relative bg-dark overflow-hidden min-h-screen pt-[160px] px-6 pb-[100px] flex flex-col items-center text-center"
      style={{ borderRadius: "0 0 28px 28px" }}
    >
      {/* Bottom fade overlay to match HTML template */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-[5]"
        style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }}
      />

      {/* Hero content */}
      <div className="relative z-[10] max-w-[820px] mx-auto mb-20 animate-fade-up">
        {/* Heading */}
        <h1 className="font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium text-text-on-dark leading-[1.08] tracking-[-0.025em] mb-6">
          One Link for{" "}
          <em className="not-italic text-accent-pink">Everything.</em>
          <br />
          Smart Enough to Know Where.
        </h1>

        {/* Subheading */}
        <p className="text-[clamp(1rem,1.6vw,1.12rem)] text-text-on-dark/55 max-w-[540px] mx-auto mb-10 leading-[1.7]">
          The link-in-bio for creators who need more. Every link auto-detects devices and sends your audience to the right app store, podcast player, or platform.
        </p>

        {/* CTA button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="accent"
            size="lg"
            dot
            asChild
            className="text-[0.95rem] font-bold px-8"
          >
            <Link href={user ? "/d/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Claim Your Page — Free"}</Link>
          </Button>
          
          <p className="text-[0.82rem] text-text-on-dark/40 tracking-wide">
            No credit card · Free forever · Setup in 2 min
          </p>
        </div>
      </div>

      {/* Floating cards container — relative positioning to flow AFTER text */}
      <div className="relative w-full max-w-[1100px] z-[1] animate-fade-up delay-300">
        <FloatingCards />
      </div>

    </section>
  );
}
