import { Suspense } from "react";
import OutboundClient from "./OutboundClient";

function OutboundFallback() {
  return (
    <main className="min-h-screen bg-[#f8f6f2] flex items-center justify-center px-4">
      <section className="w-full max-w-[560px] rounded-[20px] border border-[#e8e6e2] bg-white p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
        <h1 className="text-[24px] leading-tight font-semibold text-[#1a1a2e]">
          Security Check
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#6f7080]">
          Preparing destination details...
        </p>
      </section>
    </main>
  );
}

export default function OutboundPage() {
  return (
    <Suspense fallback={<OutboundFallback />}>
      <OutboundClient />
    </Suspense>
  );
}
