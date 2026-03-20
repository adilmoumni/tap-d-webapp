"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------
   FloatingCards – hero floating card elements.
   Each card has a CSS floatY animation with different delays.
   Hidden on mobile (< md), partial on tablet.
   Matches every .fc element from the HTML template exactly.
------------------------------------------------------------------ */

/* Shared float animation props for motion.div wrappers */
const float = (delay: number, duration = 6) => ({
  animate: { y: [0, -14, 0] },
  transition: { repeat: Infinity, duration, delay, ease: "easeInOut" as const },
});

const floatBio = (delay: number) => ({
  animate: { y: [0, -12, 0] },
  transition: { repeat: Infinity, duration: 6, delay, ease: "easeInOut" as const },
});

export function FloatingCards() {
  return (
    <div className="relative hidden md:block max-w-[1100px] mx-auto mt-20 h-[360px]">

      {/* Social proof pill — top left, pink */}
      <motion.div
        {...float(-5)}
        className="absolute left-[2%] top-0 w-[170px] h-12 bg-accent-pink rounded-xl flex items-center justify-center gap-2 px-3.5"
      >
        <span className="text-[0.78rem] font-semibold text-dark">✨ 12K creators</span>
      </motion.div>

      {/* iOS pill */}
      <motion.div
        {...float(-2)}
        className="absolute left-[22%] top-[8%] w-[140px] h-12 bg-white rounded-xl flex items-center gap-2 px-3.5 shadow-md"
      >
        <div className="w-7 h-7 rounded-[7px] bg-[#f0f0f0] flex items-center justify-center text-[0.85rem]">🍎</div>
        <span className="text-[0.78rem] font-semibold text-text-primary">App Store</span>
      </motion.div>

      {/* Analytics card — left mid, dark elevated */}
      <motion.div
        {...float(0)}
        className="absolute left-[6%] top-[30%] w-[200px] h-[160px] bg-dark-elevated border border-white/[0.08] rounded-xl p-[18px] flex flex-col justify-between"
      >
        <div>
          <div className="text-[0.68rem] font-semibold text-text-on-dark/55 uppercase tracking-widest mb-1">Link Taps</div>
          <div className="font-serif text-[2rem] text-text-on-dark leading-none">24.8K</div>
          <div className="text-[0.72rem] text-text-on-dark/55 mt-1">Last 30 days</div>
        </div>
        <div>
          <div className="h-1 rounded-full bg-white/[0.06] mt-1.5">
            <div className="h-full w-[72%] bg-accent-mint rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* CENTER — Bio page mockup (most prominent) */}
      <motion.div
        {...floatBio(-1)}
        className="absolute left-1/2 top-0 w-[240px] -translate-x-1/2 bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-5 z-10"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-lilac to-accent-pink mx-auto mb-2.5 flex items-center justify-center text-xl">👩‍🎨</div>
        <div className="text-center font-serif text-[0.88rem] font-medium text-text-primary mb-0.5">Emma Creates</div>
        <div className="text-center text-[0.68rem] text-text-muted mb-3.5">tap-d.link/@emma</div>
        {[
          { icon: "🎨", bg: "#f0e8fc", label: "Design Course", smart: false },
          { icon: "🎙️", bg: "#fce8f0", label: "Podcast",       smart: true },
          { icon: "📱", bg: "#e8fcf0", label: "My App",         smart: true },
          { icon: "🛒", bg: "#e8f0fc", label: "Merch Store",    smart: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-3 py-2 bg-[#f8f6fc] rounded-[10px] mb-1.5 text-[0.72rem] font-semibold text-text-primary">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[0.7rem] flex-shrink-0" style={{ background: item.bg }}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.smart && (
              <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#6b5b95] bg-lavender-light px-1.5 py-0.5 rounded-full">Smart</span>
            )}
          </div>
        ))}
      </motion.div>

      {/* Android pill — top right, mint */}
      <motion.div
        {...float(-3.5)}
        className="absolute right-[16%] top-[5%] w-[150px] h-12 bg-accent-mint rounded-xl flex items-center gap-2 px-3.5 lg:flex hidden"
      >
        <span className="text-[0.78rem] font-semibold text-dark">🤖 Google Play</span>
      </motion.div>

      {/* QR card — right, peach */}
      <motion.div
        {...float(-4)}
        className="absolute right-[4%] top-[45%] w-[120px] h-[120px] bg-accent-peach rounded-[20px] flex flex-col items-center justify-center gap-1 lg:flex hidden"
      >
        <div className="grid grid-cols-5 gap-0.5">
          {[1,1,1,0,1, 1,0,1,1,0, 1,1,0,1,1, 0,1,1,0,1, 1,0,1,1,1].map((f, i) => (
            <div key={i} className={`w-[9px] h-[9px] rounded-sm ${f ? "bg-dark" : "bg-dark/10"}`} />
          ))}
        </div>
        <div className="text-[0.65rem] font-semibold text-dark/50 mt-0.5">Scan me</div>
      </motion.div>

      {/* Speed indicator — bottom right, dark */}
      <motion.div
        {...float(-2.5)}
        className="absolute right-[8%] bottom-[10%] w-[130px] h-11 bg-dark-elevated border border-white/[0.08] rounded-xl flex items-center justify-center gap-1.5 text-[0.75rem] font-semibold text-accent-mint"
      >
        ⚡ 12ms redirect
      </motion.div>
    </div>
  );
}
