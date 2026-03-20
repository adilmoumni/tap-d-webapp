"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------
   BioShowcase – two-column section:
   • Left: heading + 4 checklist items + CTA
   • Right: phone frame mockup showing a mini bio page
   Matches .bio-showcase / .bio-phone from the HTML template.
------------------------------------------------------------------ */

const checks = [
  { icon: "✓", color: "#f0e8fc", iconColor: "#8b5cf6", text: "Smart routing on every link — iOS, Android, Desktop" },
  { icon: "✓", color: "#fce8f0", iconColor: "#e8457c", text: "Beautiful customizable bio page at tap-d.link/@you" },
  { icon: "✓", color: "#e8fcf0", iconColor: "#059669", text: "Real-time analytics — see who taps, from where, on what" },
  { icon: "✓", color: "#e8f0fc", iconColor: "#2563eb", text: "QR code for every link — print, share, scan" },
];

const bioLinks = [
  { icon: "🎨", label: "Design Course",    smart: false, bg: "#f8f0fc" },
  { icon: "🎙️", label: "Podcast",          smart: true,  bg: "#fce8f0" },
  { icon: "📱", label: "ColorPal App",     smart: true,  bg: "#e8fcf0" },
  { icon: "🛒", label: "Merch Store",      smart: false, bg: "#e8f0fc" },
  { icon: "🎵", label: "Spotify Playlist", smart: true,  bg: "#fcf0e8" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0, 0, 0.2, 1] } }),
};

export function BioShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="bio" className="bg-white rounded-[28px] mx-3 px-6 py-24 lg:px-16">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={0}
        >
          <h2 className="font-serif text-[clamp(1.8rem,3.2vw,2.6rem)] font-medium leading-[1.12] mb-4">
            Your bio page,<br />
            but <em className="not-italic text-accent-lilac">smarter</em>
          </h2>
          <p className="text-text-secondary leading-[1.7] mb-6">
            Other link-in-bio tools just list links. tap-d.link makes every link intelligent — auto-detecting if your fan is on iPhone, Android, or desktop and routing them to the right place. Your podcast, your app, your music — one link, every platform.
          </p>
          <ul className="flex flex-col gap-3 mb-7">
            {checks.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-[0.92rem] font-medium">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] flex-shrink-0"
                  style={{ background: item.color, color: item.iconColor }}
                >
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
          <Button variant="primary" size="md" dot>
            Claim Your @username
          </Button>
        </motion.div>

        {/* Right: phone mockup */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={0.2}
          className="flex justify-center mt-8 lg:mt-0"
        >
          {/* Phone frame */}
          <div className="w-[280px] bg-lavender-light rounded-[32px] p-4">
            {/* Notch */}
            <div className="w-[100px] h-6 bg-page-bg rounded-b-[14px] mx-auto mb-3" />
            {/* Screen */}
            <div className="bg-white rounded-[22px] px-3.5 py-5 min-h-[400px]">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-lilac to-accent-pink mx-auto mb-2 flex items-center justify-center text-lg">👩‍🎨</div>
              <div className="text-center font-serif text-[0.82rem] font-medium mb-0.5">Emma Creates</div>
              <div className="text-center text-[0.62rem] text-text-muted mb-3">@emma.creates · Designer &amp; Creator</div>
              {/* Links */}
              <div className="flex flex-col gap-1.5 mt-3.5">
                {bioLinks.map((link) => (
                  <div
                    key={link.label}
                    className="flex items-center gap-2 px-2.5 py-2.5 rounded-[10px] text-[0.7rem] font-semibold text-text-primary"
                    style={{ background: link.bg }}
                  >
                    <span className="w-[22px] h-[22px] rounded-md bg-white/70 flex items-center justify-center text-[0.6rem] flex-shrink-0">
                      {link.icon}
                    </span>
                    {link.label}
                    {link.smart && (
                      <span className="ml-auto text-[0.5rem] font-bold uppercase tracking-wider text-[#6b5b95] bg-lavender-light px-1.5 py-0.5 rounded-full">Smart</span>
                    )}
                    <span className="text-[0.65rem] text-text-muted ml-auto">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
