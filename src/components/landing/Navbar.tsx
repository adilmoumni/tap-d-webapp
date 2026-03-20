"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Navbar – floating pill, fixed centered, top: 20px.
   Matches .nav / .nav-pill from the HTML template.
   Glass variant with dark background (rgba dark 85% + blur 24px).
------------------------------------------------------------------ */

export function Navbar() {
  const [activeSection, setActiveSection] = React.useState<string>("#bio");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Track active section on scroll
  React.useEffect(() => {
    const sections = navLinks
      .map((l) => l.href.startsWith("#") ? document.querySelector(l.href) : null)
      .filter(Boolean) as Element[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(`#${e.target.id}`);
        });
      },
      { threshold: 0.4, rootMargin: "-80px 0px 0px 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Smooth scroll on nav link click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(href);
    setMobileOpen(false);
  };

  return (
    <motion.nav
      className="fixed top-5 inset-x-0 z-50 mx-auto w-max"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
    >
      {/* Pill wrapper */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-1.5 rounded-full bg-dark/85 backdrop-blur-2xl border border-white/[0.06] min-w-[320px] md:min-w-[650px] shadow-lg shadow-black/20">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center px-4 py-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" theme="dark" />
          </Link>
          <div className="w-px h-5 bg-white/10 mx-1 hidden md:block" />
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex justify-center items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={cn(
                "px-4 py-2 rounded-full text-[0.85rem] font-medium transition-all duration-250 whitespace-nowrap",
                activeSection === link.href
                  ? "text-text-on-dark bg-white/[0.12] shadow-sm"
                  : "text-text-on-dark/55 hover:text-text-on-dark hover:bg-white/[0.06]"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA / Mobile toggle */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="bg-white text-dark hover:bg-lavender-light font-bold text-[0.82rem] h-9 px-5 hidden md:inline-flex shadow-sm"
          >
            <a href="/signup">Get Started</a>
          </Button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden p-2.5 text-text-on-dark/70 hover:text-text-on-dark transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              ) : (
                <path d="M4 6h14M4 11h14M4 16h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl bg-dark/95 backdrop-blur-2xl border border-white/[0.08] py-2 px-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-4 py-2.5 text-sm font-medium text-text-on-dark/70 hover:text-text-on-dark hover:bg-white/[0.06] rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="px-2 pt-2 pb-1">
              <Button variant="accent" size="sm" full asChild>
                <a href="/signup">Get Started Free</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
