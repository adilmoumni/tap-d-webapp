import Link from "next/link";

/* ------------------------------------------------------------------
   SEOContent — semantic, keyword-rich section for discoverability.
   Helps target queries around short links, bio links, smart links,
   link landing pages, and QR code links.
------------------------------------------------------------------ */

export function SEOContent() {
  return (
    <section className="bg-white rounded-[28px] mx-3 mt-3 px-6 py-20 lg:px-16" id="seo">
      <div className="max-w-[980px] mx-auto">
        <h2 className="font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] font-medium leading-[1.15] tracking-tight mb-5 text-[#1a1a2e]">
          Short link, bio link page, smart link routing, and QR codes in one place
        </h2>

        <p className="text-[1.02rem] text-[#5f5f73] leading-[1.8] mb-8">
          tap-d.link is built for creators, founders, and marketers who need a
          reliable <strong className="text-[#1a1a2e]">short link platform</strong>, a
          fast <strong className="text-[#1a1a2e]">bio link page builder</strong>, and
          intelligent <strong className="text-[#1a1a2e]">smart links</strong> that route
          visitors to the right destination by device.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-[18px] border border-[#ece9e3] bg-[#faf9f6] p-5">
            <h3 className="text-[1.02rem] font-semibold text-[#1a1a2e] mb-2">
              Build your link landing page quickly
            </h3>
            <p className="text-[0.95rem] text-[#5f5f73] leading-[1.7]">
              Create a clean landing page with all your links in minutes. Share
              one URL on Instagram, TikTok, YouTube, and email campaigns.
            </p>
          </article>

          <article className="rounded-[18px] border border-[#ece9e3] bg-[#faf9f6] p-5">
            <h3 className="text-[1.02rem] font-semibold text-[#1a1a2e] mb-2">
              Turn every URL into a smart link
            </h3>
            <p className="text-[0.95rem] text-[#5f5f73] leading-[1.7]">
              Route iOS users to the App Store, Android users to Google Play,
              and desktop visitors to your website automatically.
            </p>
          </article>

          <article className="rounded-[18px] border border-[#ece9e3] bg-[#faf9f6] p-5">
            <h3 className="text-[1.02rem] font-semibold text-[#1a1a2e] mb-2">
              Track countries, devices, and traffic sources
            </h3>
            <p className="text-[0.95rem] text-[#5f5f73] leading-[1.7]">
              View analytics by country, platform, and referrer so you can
              improve conversion and optimize your link strategy.
            </p>
          </article>

          <article className="rounded-[18px] border border-[#ece9e3] bg-[#faf9f6] p-5">
            <h3 className="text-[1.02rem] font-semibold text-[#1a1a2e] mb-2">
              Generate a QR code for every short link
            </h3>
            <p className="text-[0.95rem] text-[#5f5f73] leading-[1.7]">
              Download and share scannable QR codes for print materials, events,
              menus, packaging, and offline campaigns.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#1a1a2e] text-white text-[0.9rem] font-semibold hover:opacity-90 transition-opacity"
          >
            Start Free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#ddd8cf] text-[#1a1a2e] text-[0.9rem] font-semibold hover:bg-[#f7f4ef] transition-colors"
          >
            See Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
