"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { useDashboard } from "@/contexts/DashboardContext";

export function SaveIndicator() {
  const { activeSection } = useDashboard();
  const { saveStatus, retrySave } = useBioEditor();

  // Only show on bio section
  if (activeSection !== "bio") return null;
  if (saveStatus === "idle") return null;

  return (
    <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 text-[12px] font-medium">
      {saveStatus === "saving" && (
        <>
          <Loader2 size={14} className="animate-spin text-[#8a8a9a]" />
          <span className="text-[#8a8a9a]">Saving...</span>
        </>
      )}

      {saveStatus === "saved" && (
        <>
          <Check size={14} className="text-[#22c55e]" />
          <span className="text-[#22c55e]">Saved</span>
        </>
      )}

      {saveStatus === "error" && (
        <>
          <AlertCircle size={14} className="text-[#ef4444]" />
          <span className="text-[#ef4444]">Save failed</span>
          <button
            onClick={retrySave}
            className="ml-1 px-2 py-0.5 rounded-full bg-[#ef4444] text-white text-[11px] font-semibold hover:bg-[#dc2626] transition-colors"
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
}
