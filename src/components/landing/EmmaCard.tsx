"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Palette, 
  Mic, 
  Smartphone, 
  ShoppingBag, 
  Music, 
  User,
  ArrowRight,
  Sparkles
} from "lucide-react";

/* ------------------------------------------------------------------
   EmmaCard – A high-fidelity "Link-in-Bio" preview component.
   Showcases the 'Emma Creates' profile with smart links.
   Used in the landing page BioShowcase section.
------------------------------------------------------------------ */

const bioLinks = [
  { icon: Palette,     label: "Design Course",    smart: false, bg: "bg-[#f8f0fc]" },
  { icon: Mic,         label: "Podcast",          smart: true,  bg: "bg-[#fce8f0]", smartLabel: "Smart" },
  { icon: Smartphone,  label: "ColorPal App",     smart: true,  bg: "bg-[#e8fcf0]", smartLabel: "Smart" },
  { icon: ShoppingBag, label: "Merch Store",      smart: false, bg: "bg-[#e8f0fc]" },
  { icon: Music,       label: "Spotify Playlist", smart: true,  bg: "bg-[#fcf0e8]", smartLabel: "Smart" },
];

export function EmmaCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative w-[280px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-dark shadow-lavender-dark/20",
      className
    )}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-dark rounded-b-[18px] z-10" />

      {/* Screen Content */}
      <div className="px-5 pt-10 pb-8 min-h-[460px] bg-gradient-to-b from-white to-lavender-light/30">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c4a0e8] via-[#e8a0bf] to-[#e8b86d] flex items-center justify-center shadow-lg ring-4 ring-white">
              <User size={32} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-lavender text-accent-pink">
              <Sparkles size={10} fill="currentColor" />
            </div>
          </div>
          
          <h3 className="font-serif text-lg font-bold text-text-primary leading-tight">
            Emma Creates
          </h3>
          <p className="text-[0.65rem] font-medium text-text-muted mt-1 uppercase tracking-wider">
            @emma.creates · Designer & Creator
          </p>
        </div>

        {/* Links List */}
        <div className="flex flex-col gap-2.5">
          {bioLinks.map((link, idx) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx + 0.5, duration: 0.5 }}
              className={cn(
                "group flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-default",
                link.bg,
                "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
              )}
            >
              {/* Link Icon */}
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-text-primary">
                <link.icon size={18} strokeWidth={2.5} />
              </div>

              {/* Link Label */}
              <span className="text-[0.8rem] font-bold text-text-primary tracking-tight">
                {link.label}
              </span>

              {/* Smart Badge / Arrow */}
              <div className="ml-auto flex items-center gap-2">
                {link.smart && (
                  <span className="text-[0.5rem] font-black uppercase tracking-[0.12em] text-[#8e44ad] bg-white/60 px-2 py-1 rounded-full border border-[#8e44ad]/20 backdrop-blur-sm">
                    {link.smartLabel}
                  </span>
                )}
                <ArrowRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Bottom */}
        <div className="mt-8 text-center opacity-30">
          <div className="inline-flex items-center gap-1 text-[0.55rem] font-black uppercase tracking-widest text-text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
            tap-d.link
          </div>
        </div>
      </div>
    </div>
  );
}
