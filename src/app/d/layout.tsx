"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { BioEditorProvider } from "@/contexts/BioEditorContext";
import { IconSidebar } from "@/components/dashboard/IconSidebar";
import { SubTabs } from "@/components/dashboard/SubTabs";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { SaveIndicator } from "@/components/dashboard/SaveIndicator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardProvider>
        <BioEditorProvider>
        <div
          className="flex flex-col h-screen overflow-hidden bg-black"
          style={{ fontFamily: "'Inter', system-ui, sans-serif"}}
        >
          {/* Promo topbar */}
          <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-2 bg-[#0a0a0f] text-white text-xs font-medium">
            <span>You’re enjoying Pro features for free — locked in forever 🎉</span>
            <div className="text-[#e8b86d] bg-[rgba(232,184,109,0.15)] px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
              Pro Lifetime
            </div>
          </div>

          {/* 4-column layout */}
          <div className="flex flex-1 overflow-hidden rounded-t-xl">
            <IconSidebar />
            <SubTabs />
            <main className="relative flex-1 overflow-y-auto bg-white" style={{ padding: "28px 36px" }}>
              <SaveIndicator />
              {children}
            </main>
            <PhonePreview />
          </div>
        </div>
        </BioEditorProvider>
      </DashboardProvider>
    </AuthGuard>
  );
}
