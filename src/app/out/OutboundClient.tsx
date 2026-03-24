"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { getHostLabel, normalizeOutboundUrl } from "@/lib/url-safety";

export default function OutboundClient() {
  const search = useSearchParams();
  const rawTo = search.get("to") ?? "";

  const safeTo = useMemo(() => normalizeOutboundUrl(rawTo), [rawTo]);
  const host = useMemo(() => getHostLabel(rawTo), [rawTo]);

  return (
    <main className="min-h-screen bg-[#f8f6f2] flex items-center justify-center px-4">
      <section className="w-full max-w-[560px] rounded-[20px] border border-[#e8e6e2] bg-white p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4df] px-3 py-1 text-[11px] font-semibold text-[#b8860b] mb-4">
          <ShieldAlert size={14} />
          Security Check
        </div>

        <h1 className="text-[26px] leading-tight font-semibold text-[#1a1a2e]">
          You are leaving tap-d.link
        </h1>

        <p className="mt-3 text-[14px] leading-relaxed text-[#6f7080]">
          You are about to open <span className="font-semibold text-[#1a1a2e]">{host}</span>.
          {" "}Only continue if you trust this destination.
        </p>

        {safeTo ? (
          <div className="mt-6 rounded-[12px] border border-[#e8e6e2] bg-[#f7f5f1] p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#8a8a9a] mb-1">Destination</p>
            <p className="text-[13px] font-mono break-all text-[#1a1a2e]">{safeTo}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-[12px] border border-[#fecaca] bg-[#fff1f2] p-3 text-[13px] text-[#b42318]">
            This destination link is invalid or blocked for safety.
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-3 rounded-[12px] border border-[#e8e6e2] text-[14px] font-semibold text-[#1a1a2e] hover:bg-[#f7f5f1] transition-colors"
          >
            Go back
          </Link>
          {safeTo && (
            <a
              href={safeTo}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] bg-[#0a0a0f] text-white text-[14px] font-semibold hover:bg-[#1a1a2e] transition-colors"
            >
              Continue
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        <p className="mt-4 text-[12px] text-[#8a8a9a]">
          Never enter account credentials on pages you do not fully trust.
        </p>
      </section>
    </main>
  );
}
