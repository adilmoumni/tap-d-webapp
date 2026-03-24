"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { QRCode } from "@/components/shared/QRCode";
import { useAuth } from "@/hooks/useAuth";
import {
  Apple,
  Play,
  Monitor,
  Palette,
  Mic,
  Smartphone,
  Check,
  Sparkles
} from "lucide-react";

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
        <div className="font-mono text-[0.75rem] px-4 py-2 bg-white rounded-full inline-block mb-4 text-text-muted border border-border/10 shadow-sm uppercase tracking-wider font-bold">
          tap-d.link/@emma → Podcast
        </div>
        <div className="text-accent-pink my-3 flex justify-center">
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <span className="text-2xl">↓</span>
          </motion.div>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { label: "Apple Podcasts", icon: '/apple_music_icon.png' },
            { label: "Spotify", icon: '/spotify.png' },
            { label: "Web Player", icon: '/web.png' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-2.5 rounded-xl bg-white text-sm font-bold flex items-center gap-2 shadow-sm border border-border/10">
              <img src={s.icon} alt={s.label} className="w-8 h-8 rounded-[8px]" />
              {s.label}
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
        <div className="inline-flex flex-col gap-2.5 w-56">
          {[
            { label: "Design Course", icon: Palette, bg: "bg-[#fdfaf5]" },
            { label: "Podcast", icon: Mic, bg: "bg-[#f5e6d3]" },
            { label: "My App", icon: Smartphone, bg: "bg-[#e1f5ee]" },
          ].map((l) => (
            <div key={l.label} className={cn("px-3.5 py-3 rounded-xl text-sm font-bold text-text-primary text-left flex items-center gap-3 shadow-sm", l.bg)}>
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <l.icon size={16} strokeWidth={2.5} />
              </div>
              {l.label}
            </div>
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
      <div className="text-center space-y-3 w-64">
        {[["Total Clicks", "24.8K"], ["iOS Share", "58%"], ["Top Country", "US"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3 bg-white rounded-xl text-sm font-bold shadow-sm border border-border/10">
            <span className="text-text-muted text-[0.75rem] uppercase tracking-wider">{k}</span>
            <span className="text-text-primary">{v}</span>
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
      <div className="flex flex-col items-center gap-5">
        <div className="relative group p-4 bg-white rounded-[32px] shadow-2xl border border-accent-pink/20">
          <QRCode 
            value="https://tap-d.link/@emma" 
            size={160} 
            logo={true} 
            className="rounded-2xl"
          />
          <div className="absolute inset-0 bg-accent-pink/5 rounded-[32px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark/5 text-[0.7rem] font-bold uppercase tracking-widest text-text-muted">
          <Sparkles size={12} className="text-accent-pink fill-accent-pink" />
          High-Res SVG
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  const { user } = useAuth();
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
          className="text-center mb-16"
        >
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-tight mb-4">
            How the smart routing works
          </h2>
          <p className="text-text-secondary text-[1.1rem] max-w-[540px] mx-auto leading-[1.7]">
            Your audience clicks one link. We figure out the rest — automatically, in under 50 milliseconds.
          </p>
        </motion.div>

        {/* Improved Stepper (Tabs) */}
        <div className="max-w-2xl mx-auto mb-20 p-1.5 bg-surface-muted rounded-full flex gap-1 relative overflow-hidden shadow-inner border border-border/10">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex-1 py-3 px-6 text-sm font-extrabold transition-all duration-300 rounded-full cursor-pointer z-10",
                active === i ? "text-white" : "text-text-muted hover:text-text-primary"
              )}
            >
              {active === i && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-dark rounded-full -z-10 shadow-lg"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative inline-flex items-center gap-2">
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Left text */}
          <motion.div
            key={active + "text"}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent-pink/15 text-[0.75rem] font-black uppercase tracking-[0.15em] text-text-muted mb-6">
              {tab.chip}
            </span>
            <h3 className="font-serif text-[2.2rem] font-medium leading-tight mb-4">{tab.heading}</h3>
            <p className="text-text-secondary text-[1rem] leading-[1.8] mb-8 max-w-[480px]">{tab.body}</p>
            <Button variant="primary" size="lg" dot asChild className="px-8 font-bold">
              <Link href={user ? "/d/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Get Started Now"}</Link>
            </Button>
          </motion.div>

          {/* Right visual */}
          <motion.div
            key={active + "visual"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-accent-pink/20 rounded-[40px] p-12 min-h-[400px] flex items-center justify-center border border-white/50 backdrop-blur-sm relative"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-white/30 rounded-[40px] blur-3xl -z-10 opacity-50" />
            {tab.visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
