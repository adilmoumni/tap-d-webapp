"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function SimpleToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative w-9 h-5 rounded-[10px] cursor-pointer transition-colors duration-200 flex-shrink-0",
        on ? "bg-[#22c55e]" : "bg-[#e8e6e2]"
      )}
    >
      <div
        className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </div>
  );
}

export function DesignFooter() {
  const [branding, setBranding] = useState(true);
  const [joinCta, setJoinCta] = useState(true);

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Footer</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-[12px] border border-[#e8e6e2] bg-white">
          <div>
            <div className="text-[13px] font-semibold text-[#1a1a2e] mb-0.5">Show tap-d.link branding</div>
            <div className="text-[11px] text-[#8a8a9a]">Remove on Pro</div>
          </div>
          <SimpleToggle on={branding} onToggle={() => setBranding(!branding)} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-[12px] border border-[#e8e6e2] bg-white">
          <div>
            <div className="text-[13px] font-semibold text-[#1a1a2e] mb-0.5">Show Join CTA</div>
            <div className="text-[11px] text-[#8a8a9a]">Drives signups</div>
          </div>
          <SimpleToggle on={joinCta} onToggle={() => setJoinCta(!joinCta)} />
        </div>
      </div>
    </div>
  );
}
