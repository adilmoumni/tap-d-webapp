"use client";

import { motion } from "framer-motion";
import { EmmaCard } from "@/components/landing/EmmaCard";
import { Sparkles, Zap, Shield, Users } from "lucide-react";

/* ------------------------------------------------------------------
   AuthSidebar – The left-side marketing panel for Auth pages.
   Contains product preview and key value props.
------------------------------------------------------------------ */

export function AuthSidebar() {
  return (
    <div className="hidden lg:flex flex-col relative w-[40%] bg-dark overflow-hidden p-12 justify-between">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-pink/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-lavender/10 rounded-full blur-[120px]" />

      {/* Top: Branding/Quote */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent-pink mb-8">
          <Sparkles size={14} className="fill-accent-pink" />
          <span className="text-[0.7rem] font-bold uppercase tracking-widest">Join 12,000+ Creators</span>
        </div>
        
        <h2 className="font-serif text-4xl font-medium text-white leading-tight mb-6">
          The last link-in-bio <br />
          <span className="text-accent-pink italic">you'll ever need.</span>
        </h2>
      </div>

      {/* Middle: Visual Preview */}
      <div className="relative z-10 flex justify-center py-12">
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [-1, 1, -1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="perspective-1000"
        >
          <EmmaCard className="scale-110 shadow-3xl shadow-black/50 border-[12px] border-dark-elevated hover:rotate-0 transition-transform duration-500 cursor-default" />
        </motion.div>
        
        {/* Floating Badges */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -left-4 bg-dark-elevated/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-mint/20 flex items-center justify-center text-accent-mint">
              <Zap size={20} className="fill-accent-mint" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Smart Routing</p>
              <p className="text-white/40 text-[0.65rem]">Auto-detects device</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] -right-4 bg-dark-elevated/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
              <Users size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Real-time Stats</p>
              <p className="text-white/40 text-[0.65rem]">1.2M events tracked</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: Feature Footer */}
      <div className="relative z-10 border-t border-white/10 pt-8 mt-auto">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3 text-white/60">
            <Shield size={18} className="text-accent-mint" />
            <span className="text-xs font-medium">Enterprise Grade</span>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <Zap size={18} className="text-accent-pink" />
            <span className="text-xs font-medium">Free Forever Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
