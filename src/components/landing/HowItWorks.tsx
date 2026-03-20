"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------
   HowItWorks — tab navigation section.
   Matches .how-tabs / .how-content from the HTML template.
------------------------------------------------------------------ */

const tabs = [
  {
    label: "Smart Routing",
    chip: "How It Works",
    heading: "One link, every platform",
    body: "Add your App Store, Spotify, Apple Podcasts, and web URLs. Choose a custom slug. When someone taps the link, we detect their device and send them to the right destination — no extra steps for your audience.",
    visual: (
      <div className="text-center">
        <div className="font-mono text-sm px-4 py-2 bg-white rounded-full inline-block mb-4 text-text-muted">
          Fan taps tap-d.link/@emma → Podcast
        </div>
        <div className="text-3xl text-accent-lilac my-3">↓</div>
        <div className="flex gap-3 justify-center flex-wrap">
          {["🍎 Apple Podcasts", "🟢 Spotify", "🖥 Web Player"].map((s) => (
            <div key={s} className="px-4 py-2.5 rounded-xl bg-white text-sm font-semibold flex items-center gap-1.5">
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Bio Pages",
    chip: "Bio Pages",
    heading: "Your link in bio, but smarter",
    body: "Create a stunning bio page at tap-d.link/@you. Customize colors, add your links, and share one URL everywhere. Every link auto-detects the visitor's device.",
    visual: (
      <div className="text-center">
        <div className="inline-flex flex-col gap-2 w-48">
          {["🎨 Design Course", "🎙️ Podcast", "📱 My App"].map((l) => (
            <div key={l} className="px-3 py-2 bg-white rounded-xl text-sm font-semibold text-text-primary text-left">{l}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Analytics",
    chip: "Real-Time Analytics",
    heading: "Know exactly who taps",
    body: "See click counts, device breakdown, countries, and referrers — all in real time. Understand your audience and optimize your links to convert.",
    visual: (
      <div className="text-center space-y-3">
        {[["Total Clicks", "24.8K"], ["iOS Share", "58%"], ["Top Country", "🇺🇸 US"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl text-sm font-medium">
            <span className="text-text-muted">{k}</span>
            <span className="font-bold text-text-primary">{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "QR Codes",
    chip: "QR Code Studio",
    heading: "Every link has a QR code",
    body: "Auto-generated QR for every link. Custom colors, shapes, and logo embedding. Download PNG, SVG, or PDF for print campaigns or events.",
    visual: (
      <div className="flex flex-col items-center gap-3">
        <div className="w-28 h-28 bg-accent-peach rounded-[20px] grid grid-cols-5 gap-0.5 p-4">
          {[1,1,1,0,1, 1,0,1,1,0, 1,1,0,1,1, 0,1,1,0,1, 1,0,1,1,1].map((f, i) => (
            <div key={i} className={`rounded-sm ${f ? "bg-dark" : "bg-dark/10"}`} />
          ))}
        </div>
        <div className="text-sm font-medium text-text-muted">tap-d.link/@emma</div>
      </div>
    ),
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const tab = tabs[active];

  return (
    <section ref={ref} id="how" className="bg-white rounded-[28px] mx-3 mt-3 px-6 py-24 lg:px-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-tight mb-3.5">
            How the smart routing works
          </h2>
          <p className="text-text-secondary text-[1.05rem] max-w-[520px] mx-auto leading-[1.7]">
            Your audience clicks one link. We figure out the rest — automatically, in under 50 milliseconds.
          </p>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0, 0, 0.2, 1] }}
          className="flex gap-0 border-b border-[#e8e5f0] mb-12"
        >
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`flex-1 py-4 text-sm font-medium text-left relative transition-colors duration-300 bg-none border-none font-sans cursor-pointer ${
                active === i ? "text-text-primary font-semibold" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {active === i && (
                <span className="absolute left-0 top-0 w-1.5 h-1.5 rounded-full bg-dark" />
              )}
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0, 0, 0.2, 1] }}
          key={active}
          className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start"
        >
          {/* Left text */}
          <div>
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-lavender-light text-[0.78rem] font-semibold text-text-muted mb-5">
              {tab.chip}
            </span>
            <h3 className="font-serif text-[1.8rem] font-medium mb-3.5">{tab.heading}</h3>
            <p className="text-text-secondary text-[0.95rem] leading-[1.7] mb-6">{tab.body}</p>
            <Button variant="primary" size="md" dot>Get Started</Button>
          </div>

          {/* Right visual */}
          <div className="bg-lavender-light rounded-[20px] p-10 min-h-[320px] flex items-center justify-center">
            {tab.visual}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
