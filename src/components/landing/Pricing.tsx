"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/config/plans";
import { stats } from "@/config/site";

/* ------------------------------------------------------------------
   Pricing – 3-column grid consumed from config/plans.ts.
   Matches .p-card / .p-card.featured from the HTML template.
   Below grid: stats strip with 4 inline stats.
------------------------------------------------------------------ */

export function Pricing() {
  const [annual, setAnnual] = useState(false);
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
            Start free.<br />Scale when ready.
          </h2>
          <p className="text-text-secondary text-[1.05rem] max-w-[520px] mx-auto leading-[1.7] mb-6">
            No surprises. No ads. Upgrade only when you need more.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-lavender-light rounded-full px-1.5 py-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !annual ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                annual ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
              }`}
            >
              Annual
              <span className="text-[0.68rem] font-bold text-emerald-600 bg-accent-mint/30 px-1.5 py-0.5 rounded-full">
                Save 28%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            const isFeatured = plan.featured;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative rounded-[20px] p-9 transition-all duration-350 hover:-translate-y-1 ${
                  isFeatured
                    ? "bg-dark text-text-on-dark"
                    : "bg-lavender-light text-text-primary"
                }`}
              >
                {isFeatured && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 text-[0.68rem] font-bold uppercase tracking-wider text-text-on-dark/60">
                    Popular
                  </span>
                )}

                {/* Plan name */}
                <p className={`text-[0.8rem] font-bold uppercase tracking-[0.1em] mb-3 ${isFeatured ? "text-text-on-dark/60" : "text-text-muted"}`}>
                  {plan.name}
                </p>

                {/* Price */}
                <p className="font-serif text-5xl font-semibold tracking-tight mb-1">
                  {price === 0 ? "$0" : `$${price}`}
                  {price > 0 && (
                    <span className={`font-sans text-[0.9rem] font-normal ${isFeatured ? "text-text-on-dark/50" : "text-text-muted"}`}>
                      /mo
                    </span>
                  )}
                </p>

                {/* Description */}
                <p className={`text-[0.88rem] leading-[1.6] pb-6 mb-6 border-b ${
                  isFeatured ? "text-text-on-dark/60 border-white/[0.08]" : "text-text-muted border-black/[0.06]"
                }`}>
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-7">
                  {plan.features.map((f) => (
                    <li key={f.label} className={`flex items-center gap-2.5 text-[0.86rem] ${isFeatured ? "text-text-on-dark/60" : "text-text-muted"}`}>
                      <span className={`font-bold text-sm ${isFeatured ? "text-accent-mint" : "text-accent-mint"}`}>✓</span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isFeatured ? (
                  <Button variant="accent" size="md" full>
                    {plan.ctaLabel}
                  </Button>
                ) : (
                  <button className="w-full px-4 py-3 rounded-full font-semibold text-[0.88rem] border border-black/10 bg-white text-text-primary transition-all hover:bg-dark hover:text-text-on-dark hover:border-dark cursor-pointer">
                    {plan.ctaLabel}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
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
