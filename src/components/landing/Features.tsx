"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";

/* ------------------------------------------------------------------
   Features – 3-column grid of 9 pastel feature cards.
   Colors cycle matching .f-card:nth-child patterns from HTML template.
   Each card: icon → serif title → description → badge
------------------------------------------------------------------ */

import { 
  Zap, 
  User, 
  BarChart3, 
  QrCode, 
  Terminal, 
  Palette, 
  FlaskConical, 
  Globe, 
  Clock,
  LucideIcon
} from "lucide-react";

/* ------------------------------------------------------------------
   Features – 3-column grid of 9 pastel feature cards.
   Colors cycle matching .f-card:nth-child patterns from HTML template.
   Each card: icon → serif title → description → badge
------------------------------------------------------------------ */

type BadgeVariant = "free" | "pro" | "team";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: BadgeVariant;
  color: string;
  hover: string;
}

const features: Feature[] = [
  {
    icon: Zap, title: "Smart Routing",
    description: "Auto-detect iOS, Android, or Desktop and redirect to the right app store, podcast player, or website. Under 50ms.",
    badge: "free", color: "#e8e3f5", hover: "#ddd6f3",
  },
  {
    icon: User, title: "Link-in-Bio Page",
    description: "Beautiful profile page at tap-d.link/you. All your links in one place with smart routing built into each one.",
    badge: "free", color: "#fce8f0", hover: "#f8d4e4",
  },
  {
    icon: BarChart3, title: "Real-Time Analytics",
    description: "See who taps your links, from which country, on which device. Daily trends, referrers, and geo breakdown.",
    badge: "free", color: "#e0f5ec", hover: "#c8eddd",
  },
  {
    icon: QrCode, title: "QR Code Studio",
    description: "Auto-generated QR for every link. Custom colors, shapes, logo embedding. Download PNG, SVG, PDF.",
    badge: "free", color: "#fef0e0", hover: "#fce4c8",
  },
  {
    icon: Terminal, title: "REST API",
    description: "Full API for programmatic link creation and stats retrieval. Webhooks for real-time click events.",
    badge: "free", color: "#e0ecf8", hover: "#c8ddf2",
  },
  {
    icon: Palette, title: "Custom Themes",
    description: "Customize your bio page with colors, fonts, and layouts that match your brand. Dark mode included.",
    badge: "pro", color: "#e8e3f5", hover: "#dbd4f0",
  },
  {
    icon: FlaskConical, title: "A/B Testing",
    description: "Split traffic between destinations. Test which link copy or destination converts better.",
    badge: "pro", color: "#fce8f0", hover: "#f8d4e4",
  },
  {
    icon: Globe, title: "Custom Domains",
    description: "Use your own domain (link.mybrand.com). Automatic SSL and DNS management included.",
    badge: "team", color: "#e0f5ec", hover: "#c8eddd",
  },
  {
    icon: Clock, title: "Scheduled Links",
    description: "Set links to go live at a specific time. Perfect for drops, launches, and coordinated campaigns.",
    badge: "pro", color: "#e0ecf8", hover: "#c8ddf2",
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="features" className="bg-white rounded-[28px] mx-3 mt-3 px-6 py-24 lg:px-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-tight mb-3.5">
            Built for creators.<br />Loved by developers.
          </h2>
          <p className="text-text-secondary text-[1.05rem] max-w-[520px] mx-auto leading-[1.7]">
            Whether you&apos;re sharing your app, your podcast, or your merch — tap-d.link has the tools.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0, 0, 0.2, 1] }}
              className="group p-8 rounded-[20px] transition-all duration-350 hover:-translate-y-1 cursor-default"
              style={{ backgroundColor: f.color }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = f.hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = f.color; }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center text-text-primary mb-[18px]">
                <f.icon size={22} strokeWidth={2.5} />
              </div>
              <h3 className="font-serif text-[1.15rem] font-medium mb-2">{f.title}</h3>
              <p className="text-[0.86rem] text-text-muted leading-[1.6]">{f.description}</p>
              <Badge variant={f.badge} className="mt-3.5">
                {f.badge.charAt(0).toUpperCase() + f.badge.slice(1)}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
