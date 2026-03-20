"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FloatingCards } from "./FloatingCards";

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
  return (
    <section
      className="relative bg-dark overflow-hidden min-h-screen"
      style={{ borderRadius: "0 0 28px 28px" }}
    >
      {/* Bottom fade overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[200px] pointer-events-none z-[2]"
        style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }}
      />

      {/* Hero content */}
      <div className="relative z-[3] max-w-[820px] mx-auto px-6 pt-40 pb-24 text-center">
        {/* Heading */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium text-text-on-dark leading-[1.08] tracking-[-0.025em] mb-6"
        >
          One Link for{" "}
          <em className="not-italic text-accent-pink">Everything.</em>
          <br />
          Smart Enough to Know Where.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fadeUp(0.35)}
          className="text-[clamp(1rem,1.6vw,1.12rem)] text-text-on-dark/55 max-w-[540px] mx-auto mb-10 leading-[1.7]"
        >
          The link-in-bio for creators who need more. Every link auto-detects devices and sends your audience to the right app store, podcast player, or platform.
        </motion.p>

        {/* CTA button */}
        <motion.div {...fadeUp(0.5)}>
          <Button
            variant="accent"
            size="lg"
            dot
            asChild
            className="text-[0.95rem]"
          >
            <a href="/signup">Claim Your Page — Free</a>
          </Button>
        </motion.div>

        {/* Meta */}
        <motion.p
          {...fadeUp(0.6)}
          className="mt-4 text-[0.82rem] text-text-on-dark/55"
        >
          No credit card · Free forever · No ads
        </motion.p>
      </div>

      {/* Floating cards */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: [0, 0, 0.2, 1] }}
        className="relative z-[1]"
      >
        <FloatingCards />
      </motion.div>

      {/* Extra bottom padding so cards don't clip */}
      <div className="h-16 md:h-24" />
    </section>
  );
}
