import Link from "next/link";
import Image from "next/image";

export default function PublicSlugNotFound() {
  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "linear-gradient(160deg,#d6d3cd 0%,#c9c6c0 100%)" }}
    >
      <div className="w-full max-w-[480px] flex flex-col">
        {/* Brand top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <Link href="/" aria-label="tap-d.link home">
            <Image
              src="/logo/logo-full-dark-text.svg"
              alt="tap-d.link"
              width={122}
              height={24}
              priority
              className="h-auto w-auto"
            />
          </Link>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-[#7b5a21] bg-[rgba(255,255,255,0.72)] border border-[rgba(123,90,33,0.16)]">
            Page Not Found
          </span>
        </div>

        {/* Bio-style card */}
        <div
          className="flex-1 rounded-t-[26px] overflow-hidden border border-[rgba(255,255,255,0.45)] shadow-[0_14px_40px_rgba(0,0,0,0.13)]"
          style={{
            marginTop: -56,
            paddingTop: 56,
            background:
              "radial-gradient(80% 45% at 50% 0%, rgba(232,184,109,0.22) 0%, rgba(232,184,109,0.07) 42%, rgba(18,15,13,0.96) 100%)",
          }}
        >
          <div className="px-6 pt-7 pb-8">
            <div className="w-[84px] h-[84px] mx-auto rounded-full border border-[rgba(238,223,186,0.42)] bg-[rgba(232,184,109,0.12)] flex items-center justify-center text-[#f3e6c4] text-[30px] font-semibold">
              404
            </div>

            <h1 className="mt-4 text-center text-[40px] leading-none font-semibold text-[#f3e6c4]">
              @not-found
            </h1>
            <p className="text-center text-[16px] text-[#c4b592] mt-1">
              This tap-d.link page is unavailable
            </p>
            <p className="text-center text-[13px] text-[#aa9a75] mt-3 max-w-[360px] mx-auto">
              The link may be mistyped, removed, or private. Try one of these verified brand links.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="w-full rounded-full px-5 py-3.5 flex items-center justify-center text-[16px] font-semibold text-[#f7edd0] border border-[rgba(240,224,178,0.9)] bg-[linear-gradient(90deg,rgba(232,184,109,0.12),rgba(232,184,109,0.22),rgba(232,184,109,0.12))] hover:brightness-110 transition-all"
              >
                Back To Home
              </Link>
              <Link
                href="/signup"
                className="w-full rounded-full px-5 py-3.5 flex items-center justify-center text-[16px] font-semibold text-[#f7edd0] border border-[rgba(240,224,178,0.7)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
              >
                Create Your Bio Page
              </Link>
              <Link
                href="/pricing"
                className="w-full rounded-full px-5 py-3.5 flex items-center justify-center text-[16px] font-semibold text-[#f7edd0] border border-[rgba(240,224,178,0.7)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
              >
                See Pricing
              </Link>
            </div>

            <div className="mt-7 pt-4 border-t border-[rgba(240,224,178,0.14)] flex items-center justify-center">
              <Image
                src="/logo/logo-full-white-text.svg"
                alt="tap-d.link"
                width={112}
                height={22}
                className="opacity-80"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
