"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { QRPreview } from "@/components/dashboard/qr/QRPreview";
import { logBioView } from "@/lib/db/bio-analytics";

interface BioPublicLayoutProps {
  children: React.ReactNode;
  slug: string;
  bioId: string;
  ownerId: string;
}

export default function BioPublicLayout({ children, slug, bioId, ownerId }: BioPublicLayoutProps) {
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track bio page view once on mount
  useEffect(() => {
    if (bioId && ownerId) {
      logBioView(bioId, ownerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bioId, ownerId]);

  useEffect(() => {
    const el = document.getElementById("bio-scroll-container");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Outer grey stage */
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "linear-gradient(160deg,#d6d3cd 0%,#c9c6c0 100%)" }}
    >
      {/* Card column */}
      <div
        className="w-full flex flex-col relative"
        style={{ maxWidth: 480 }}
      >
        {/* ── Sticky top bar ── */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between px-4 transition-all duration-300"
          style={{
            height: 56,
            background: scrolled ? "rgba(255,255,255,0.7)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
            boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
          }}
        >
          {/* Logo */}
          <a href="/" aria-label="tap-d.link home">
            <img
              src="/logo/logo-full-dark-text.svg"
              alt="tap-d.link"
              height={22}
              style={{ height: 22, width: "auto" }}
            />
          </a>

          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share this page"
            className="flex items-center gap-1.5 rounded-full transition-all active:scale-95"
            style={{
              padding: "7px 14px",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.08)",
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a2e",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
          >
            <Share2 size={14} strokeWidth={2.5} />
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* ── Bio card (scrollable) ── */}
        <div
          id="bio-scroll-container"
          className="flex-1 overflow-y-auto"
          style={{
            marginTop: -56, // slide under the sticky bar
            paddingTop: 56,
            borderRadius: "24px 24px 0 0",
            overflow: "hidden",
          }}
        >
          {children}
        </div>

        {/* ── Fixed QR Code (Desktop only) ── */}
        <div className="hidden lg:flex fixed bottom-5 right-5 z-[60] flex-col items-center gap-2 select-none pointer-events-none">
          <span className="text-[18px] font-bold text-[#1a1a2e] mb-1 opacity-80">
            View on mobile
          </span>
          <QRPreview 
            url={`${typeof window !== 'undefined' ? window.location.origin : 'https://tap-d.link'}/${slug.startsWith('@') ? slug : '@' + slug}`} 
            label={`tap-d.link/${slug.startsWith('@') ? slug : '@' + slug}`}
            size={150}
            showDownload={false}
            variant="minimal"
          />
        </div>
      </div>
    </div>
  );
}
