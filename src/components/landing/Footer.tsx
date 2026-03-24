import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { footerColumns, socialLinks } from "@/config/site";

/* ------------------------------------------------------------------
   Footer – dark section with rounded top corners.
   Matches .footer from the HTML template exactly:
   • 4-column top: brand tagline | Product | Resources | Contact
   • Bottom bar: logo | legal | copyright | social
------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="bg-dark rounded-[18px] mb-3 mx-3 mt-3 px-10 pt-20 pb-10 text-text-on-dark">

      {/* Top 4-col grid */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">

        {/* Brand */}
        <div>
          <Logo size="lg" theme="dark" tagline className="mb-6" />
          <p className="text-[0.85rem] text-text-on-dark/55 leading-[1.6] mt-4">
            Serverless infrastructure.<br />Built on Google Cloud.
          </p>
        </div>

        {/* Link columns from config */}
        {footerColumns.map((col) => (
          <div key={col.title}>
            <div className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-text-on-dark/55 mb-4">
              {col.title}
            </div>
            <nav className="flex flex-col gap-1">
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[0.95rem] font-medium text-text-on-dark py-1 hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        {/* Contact */}
        <div>
          <div className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-text-on-dark/55 mb-4">
            Get in Touch
          </div>
          <p className="text-[0.88rem] text-text-on-dark/55 leading-[1.6] mb-4">
            Questions or feedback?<br />We&apos;d love to hear from you.
          </p>
          <Link
            href="mailto:hello@tap-d.link"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-elevated text-text-on-dark text-[0.88rem] font-semibold border border-white/[0.08] hover:opacity-80 transition-opacity"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0" />
            Contact Us
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto border-t border-white/[0.08] pt-8 flex flex-wrap items-center justify-between gap-4">
        <Logo size="sm" theme="dark" className="opacity-90" />

        {/* Legal links */}
        <div className="flex gap-6 text-[0.82rem] text-text-on-dark/55">
          {["Privacy", "Terms", "Imprint"].map((l) => (
            <Link key={l} href="#" className="hover:text-text-on-dark transition-colors">{l}</Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[0.82rem] text-text-on-dark/55">© 2026 tap-d.link</p>

        {/* Social links */}
        <div className="flex gap-6 text-[0.82rem] text-text-on-dark/55">
          {socialLinks.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-text-on-dark transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
