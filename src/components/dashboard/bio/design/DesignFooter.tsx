"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { Logo } from "@/components/shared/Logo";

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
  const { data, updateTheme } = useBioEditor();

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Footer</h2>

      <div className="space-y-4">
        {/* tap-d.link footer */}
        <div className="rounded-[16px] border border-[#e8e6e2] bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="text-[13px] font-semibold text-[#1a1a2e]">tap-d.link footer</div>
            <SimpleToggle
              on={data.theme.showBranding}
              onToggle={() => updateTheme("showBranding", !data.theme.showBranding)}
            />
          </div>
          {data.theme.showBranding && (
            <div className="px-4 pb-4">
              <Logo size="sm" theme="light" />
            </div>
          )}
        </div>

        {/* Join CTA */}
        <div className="rounded-[16px] border border-[#e8e6e2] bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-[13px] font-semibold text-[#1a1a2e] mb-0.5">Join CTA button</div>
              <div className="text-[11px] text-[#8a8a9a]">Shows a sign-up button below your links</div>
            </div>
            <SimpleToggle
              on={data.theme.showJoinCta}
              onToggle={() => updateTheme("showJoinCta", !data.theme.showJoinCta)}
            />
          </div>
          {data.theme.showJoinCta && (
            <div className="px-4 pb-4">
              <div className="bg-[#f0eeea] rounded-full px-5 py-2.5 text-center text-[12px] font-semibold text-[#1a1a2e]">
                Join {data.displayName || "us"} on tap-d.link
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
