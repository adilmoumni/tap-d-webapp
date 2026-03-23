"use client";

import { Share2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { BioPageRenderer } from "@/components/shared/BioPageRenderer";

/* ─────────────────────────────────────────────
   Phone Preview — wraps BioPageRenderer in a
   phone-shaped frame. Visible only on Bio section.

   Reads live editor state from BioEditorContext
   so the preview updates instantly as the user edits.
───────────────────────────────────────────── */

export function PhonePreview() {
  const { activeSection } = useDashboard();
  const { data } = useBioEditor();

  if (activeSection !== "bio") return null;

  return (
    <aside className="w-[360px] flex-shrink-0 bg-[#f5f3f0] border-l border-[#e8e6e2] flex flex-col items-center px-4 py-5 overflow-y-auto">
      {/* URL bar */}
      <div className="flex items-center gap-2 w-full px-3.5 py-[7px] bg-white border border-[#e8e6e2] rounded-full text-[11px] text-[#1a1a2e] mb-4 shadow-sm">
        <span className="font-medium">tap-d.link/@{data.username || "username"}</span>
        <Share2 size={14} className="ml-auto opacity-30 cursor-pointer flex-shrink-0" />
      </div>

      {/* Phone frame */}
      <div
        className="w-[260px] bg-white rounded-[30px] border border-[#e8e6e2] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
      >
        {/* Notch (classic only) */}
        {data.theme?.headerLayout !== "hero" && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-[70px] h-[5px] bg-[#f5f3f0] rounded-full" />
          </div>
        )}

        {/* Renderer */}
        <div className={data.theme?.headerLayout === "hero" ? "s" : "px-2 pb-3"}>
          <BioPageRenderer data={data} variant="phone" />
        </div>
      </div>
    </aside>
  );
}
