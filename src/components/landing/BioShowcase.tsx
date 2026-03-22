"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { EmmaCard } from "./EmmaCard";
import { Smartphone, Camera, Users, Zap, CheckCircle2, Check, TrendingUp, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

/* ------------------------------------------------------------------
   BioShowcase – Re-designed premium section:
   • Refined layout with 3D-feeling EmmaCard
   • Exact copy as requested by the user
   • Background decoration for 'wow' factor
------------------------------------------------------------------ */

const checks = [
  { icon: Check, color: "bg-[#f0e8fc]", iconColor: "text-[#8b5cf6]", text: "Smart routing on every link — iOS, Android, Desktop" },
  { icon: Check, color: "bg-[#fce8f0]", iconColor: "text-[#e8457c]", text: "Beautiful customizable bio page at tap-d.link/@you" },
  { icon: Check, color: "bg-[#e8fcf0]", iconColor: "text-[#059669]", text: "Real-time analytics — see who taps, from where, on what" },
  { icon: Check, color: "bg-[#e8f0fc]", iconColor: "text-[#2563eb]", text: "QR code for every link — print, share, scan" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      delay: i, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }),
};

export function BioShowcase() {
  const { user } = useAuth();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="bio" className="relative bg-white rounded-[40px] mt-5  mx-4 px-6 py-24 lg:px-20 lg:py-32 overflow-hidden border border-border/40 shadow-sm">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-lavender/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-accent-pink/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* Left: Text Content */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={0}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lavender-light/50 text-dark font-bold text-[0.7rem] uppercase tracking-widest mb-6 border border-lavender/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse" />
            Bio Pages
          </div>

          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.05] tracking-tight mb-6">
            Your bio page,<br />
            but <em className="not-italic text-accent-pink">smarter</em>
          </h2>

          <p className="text-text-secondary text-[1.05rem] leading-[1.7] mb-8 max-w-[540px]">
            Other link-in-bio tools just list links. tap-d.link makes every link intelligent — auto-detecting if your fan is on iPhone, Android, or desktop and routing them to the right place. Your podcast, your app, your music — one link, every platform.
          </p>

          <ul className="flex flex-col gap-4 mb-10">
            {checks.map((item, idx) => (
              <motion.li 
                key={item.text} 
                className="flex items-start gap-4 text-[1rem] font-medium text-text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5 }}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  item.color, item.iconColor
                )}>
                  <item.icon size={12} strokeWidth={3} />
                </span>
                <span className="leading-snug text-[0.95rem]">{item.text}</span>
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" asChild className="px-8 font-bold text-[0.95rem]">
              <Link href={user ? "/d/dashboard" : "/signup"}>{user ? "Go to Dashboard" : "Claim Your @username"}</Link>
            </Button>
          </div>
        </motion.div>

        {/* Right: Premium Phone Mockup */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={0.2}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Animated Glow behind phone */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-accent-pink/20 blur-[60px] rounded-full z-0"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 scale-[1.05] md:scale-110 lg:scale-[1.12] origin-bottom lg:origin-right transform rotate-1 lg:rotate-2 hover:rotate-0 transition-transform duration-700">
            <EmmaCard />
            
            {/* Contextual Floaties */}
            <motion.div 
              className="absolute -right-8 top-1/4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-border/40 z-20 flex gap-2.5 items-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-9 h-9 rounded-xl bg-accent-pink/15 flex items-center justify-center text-accent-pink">
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted leading-none mb-1.5 tracking-wider">Live Clicks</p>
                <p className="text-[1.05rem] font-bold text-text-primary leading-none tracking-tight">+1,240</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -left-12 bottom-1/4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-border/40 z-20 flex gap-2.5 items-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-9 h-9 rounded-xl bg-lavender/30 flex items-center justify-center text-lavender-dark">
                <Globe size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted leading-none mb-1.5 tracking-wider">Top Region</p>
                <p className="text-[1.05rem] font-bold text-text-primary leading-none tracking-tight">California</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
