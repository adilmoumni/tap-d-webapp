"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/config/plans";
import { stats } from "@/config/site";
import Link from "next/link";

/* ------------------------------------------------------------------
   Pricing – Launch / Early-access version.
   Everything is FREE during beta. Pro & Team shown as "Coming Soon".
------------------------------------------------------------------ */

export function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="pricing" className="bg-white rounded-[28px] mx-3 mt-3 px-6 py-24 lg:px-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-tight mb-3.5">
            Everything is free during<br />our launch
          </h2>
          <p className="text-text-secondary text-[1.05rem] max-w-[520px] mx-auto leading-[1.7]">
            No credit card needed. No limits during beta. Paid plans launching soon.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
          {PLANS.map((plan, i) => {
            const isFree = plan.id === "free";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative rounded-[20px] p-9 transition-all duration-350 ${
                  isFree
                    ? "bg-dark text-text-on-dark hover:-translate-y-1"
                    : "bg-lavender-light text-text-primary opacity-75"
                }`}
              >
                {/* Badge */}
                {isFree ? (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-[0.68rem] font-bold uppercase tracking-wider text-emerald-400">
                    Available Now
                  </span>
                ) : (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/5 text-[0.68rem] font-bold uppercase tracking-wider text-text-muted">
                    Coming Soon
                  </span>
                )}

                {/* Plan name */}
                <p className={`text-[0.8rem] font-bold uppercase tracking-[0.1em] mb-3 ${
                  isFree ? "text-text-on-dark/60" : "text-text-muted"
                }`}>
                  {plan.name}
                </p>

                {/* Price */}
                <p className="font-serif text-5xl font-semibold tracking-tight mb-1">
                  {plan.price.monthly === 0 ? "$0" : `$${plan.price.monthly}`}
                  {plan.price.monthly > 0 && (
                    <span className={`font-sans text-[0.9rem] font-normal ${
                      isFree ? "text-text-on-dark/50" : "text-text-muted"
                    }`}>
                      /mo
                    </span>
                  )}
                </p>

                {/* Description */}
                <p className={`text-[0.88rem] leading-[1.6] pb-6 mb-6 border-b ${
                  isFree
                    ? "text-text-on-dark/60 border-white/[0.08]"
                    : "text-text-muted border-black/[0.06]"
                }`}>
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-7">
                  {plan.features.map((f) => (
                    <li key={f.label} className={`flex items-center gap-2.5 text-[0.86rem] ${
                      isFree ? "text-text-on-dark/60" : "text-text-muted"
                    }`}>
                      <span className="font-bold text-sm text-accent-mint">✓</span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isFree ? (
                  <div>
                    <Link href="/register">
                      <Button variant="accent" size="md" full>
                        Get Started Free
                      </Button>
                    </Link>
                    <p className="text-center text-[0.72rem] text-text-on-dark/40 mt-2.5">
                      No limits during beta
                    </p>
                  </div>
                ) : (
                  <div>
                    <button
                      disabled
                      className="w-full px-4 py-3 rounded-full font-semibold text-[0.88rem] border border-black/10 bg-white/60 text-text-muted cursor-not-allowed"
                    >
                      Get Notified
                    </button>
                    <p className="text-center text-[0.72rem] text-text-muted/60 mt-2.5">
                      Launching Q2 2026
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Early access note */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-center text-[0.88rem] text-text-muted leading-[1.7] max-w-[640px] mx-auto mt-10"
        >
          We&apos;re in early access! All features are <strong className="text-text-primary">FREE</strong> while we build.
          Pro &amp; Team plans will launch soon — join the waitlist to lock in early-bird pricing.
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16 mt-16 border-t border-[#e8e5f0]"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[2.4rem] font-semibold mb-1">{s.number}</div>
              <div className="text-[0.82rem] text-text-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
