"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------
   CTA — centered bottom call-to-action section.
   Matches .cta-block from the HTML template.
------------------------------------------------------------------ */

export function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { user } = useAuth();

  return (
    <section ref={ref} className="bg-white rounded-[28px] mx-3 mt-3 px-6 py-24 lg:py-32 flex flex-col items-center justify-center text-center overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.15] mb-3.5">
          Your audience is on<br />every platform. Your link<br />
          should be <em className="not-italic italic">too.</em>
        </h2>
        <p className="text-text-secondary text-[1.05rem] max-w-[480px] mx-auto leading-[1.7] mb-8">
          Claim your custom slug and launch your short link landing page with smart routing and QR links in under 2 minutes.
        </p>
        <Button variant="primary" size="lg" dot asChild className="font-bold px-8 xl:min-w-[200px] hover:-translate-y-1 transition-transform">
          <Link href={user ? "/d/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Claim Your Page"}</Link>
        </Button>
        <p className="mt-4 text-[0.82rem] text-text-muted">
          No credit card · Free forever · Setup in 2 min
        </p>
      </motion.div>
    </section>
  );
}
