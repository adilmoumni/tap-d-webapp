"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Apple, 
  Smartphone, 
  TrendingUp, 
  Palette, 
  Mic, 
  ShoppingBag, 
  User,
  Zap
} from "lucide-react";
import { QRCode } from "@/components/shared/QRCode";

/* ------------------------------------------------------------------
   FloatingCards – hero floating card elements.
   Animations: gentle bobbing (floatY) + entry fade.
------------------------------------------------------------------ */

const floatY = (duration = 3, delay = 0) => ({
  animate: {
    y: [0, -12, 0],
    transition: { 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    } as any,
  },
});

export function FloatingCards() {
  return (
    <div className="relative w-full max-w-[1100px] mx-auto h-[400px] pointer-events-none select-none">
      
      {/* Social proof pill — top left, pink */}
      <motion.div 
        {...floatY(3.5, 0.2)}
        className="absolute top-0 left-[2%] bg-accent-pink px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 z-20"
      >
        <span className="text-[0.78rem] font-bold text-dark tracking-tight">12K creators</span>
      </motion.div>

      {/* Apple Music — top left, white */}
      <motion.div 
        {...floatY(4, 0.5)}
        className="absolute top-[20%] left-[18%] bg-white p-2.5 rounded-[14px] shadow-lg border border-border/40 z-10 flex items-center justify-center min-w-[140px]"
      >
        <div className="w-8 h-8 rounded-[8px] bg-[#f5f5f7] flex items-center justify-center text-dark mr-3">
          <Apple size={18} fill="currentColor" />
        </div>
        <span className="text-[0.78rem] font-bold text-dark">Apple Music</span>
      </motion.div>

      {/* Analytics card — left mid, dark elevated */}
      <motion.div 
        {...floatY(3.8, 0.8)}
        className="absolute left-[6%] top-[30%] bg-dark-elevated p-5 rounded-2xl shadow-2xl z-30 min-w-[180px] border border-white/[0.05]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-bold text-text-on-dark/50 tracking-widest uppercase mb-2">Live Clicks</span>
          <span className="font-serif text-3xl text-text-on-dark mb-1">12,408</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-mint"
                initial={{ width: "0%" }}
                animate={{ width: "72%" }}
                transition={{ duration: 1.5, delay: 1 }}
              />
            </div>
            <span className="text-[0.7rem] text-accent-mint font-bold">+12%</span>
          </div>
        </div>
      </motion.div>

      {/* CENTER — Bio page mockup (most prominent) */}
      <motion.div 
        {...floatY(4.5, 0)}
        className="absolute left-1/2 top-0 -translate-x-1/2 z-0"
      >
        <div className="w-[200px] md:w-[240px] bg-white rounded-[32px] p-5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.3)] border border-border/40">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c4a0e8] to-[#e8b86d] mx-auto mb-3 flex items-center justify-center ring-4 ring-white shadow-sm">
            <User size={24} className="text-white" />
          </div>
          <div className="text-center mb-5">
            <div className="h-2.5 w-20 bg-dark/10 rounded-full mx-auto mb-1.5" />
            <div className="h-1.5 w-24 bg-dark/5 rounded-full mx-auto" />
          </div>
          
          <div className="flex flex-col gap-2">
            {[ 
              { icon: Palette,    bg: "bg-[#f0e8fc]", smart: false },
              { icon: Mic,        bg: "bg-[#fce8f0]", smart: true },
              { icon: Smartphone, bg: "bg-[#e8fcf0]", smart: true },
              { icon: ShoppingBag, bg: "bg-[#e8f0fc]", smart: false },
            ].map((link, i) => (
              <div key={i} className={cn("flex items-center gap-2.5 p-2 rounded-xl", link.bg)}>
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-dark">
                  <link.icon size={12} strokeWidth={3} />
                </div>
                <div className="w-20 h-1.5 bg-dark/10 rounded-full" />
                {link.smart && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-pink shadow-[0_0_8px_rgba(232,160,191,0.6)]" />}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Android pill — top right, mint */}
      <motion.div 
        {...floatY(4.2, 1)}
        className="absolute top-[5%] right-[16%] bg-accent-mint px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 z-20"
      >
        <Smartphone size={14} className="text-dark" />
        <span className="text-[0.78rem] font-bold text-dark tracking-tight">Android App</span>
      </motion.div>

      {/* QR card — right, peach */}
      <motion.div 
        {...floatY(3.6, 1.2)}
        className="absolute right-[4%] top-[45%] bg-accent-peach p-4 rounded-[28px] shadow-2xl z-10 flex flex-col items-center gap-3 border border-dark/5"
      >
        <div className="bg-white p-2 rounded-2xl shadow-sm">
          <QRCode 
            value="https://tap-d.link/@emma" 
            size={88} 
            logo={true} 
            className="rounded-lg shadow-none"
          />
        </div>
        <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-dark/40">Scan Me</span>
      </motion.div>

      {/* Speed indicator — bottom right, dark */}
      <motion.div 
        {...floatY(3.4, 1.5)}
        className="absolute right-[8%] top-[80%] bg-dark-elevated border border-white/[0.08] px-4 py-2.5 rounded-xl shadow-2xl z-20 flex items-center gap-2"
      >
        <Zap size={14} className="text-accent-mint fill-accent-mint" />
        <span className="text-[0.72rem] font-bold text-accent-mint uppercase tracking-widest">12ms redirect</span>
      </motion.div>

    </div>
  );
}
