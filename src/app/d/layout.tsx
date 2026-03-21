"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { IconSidebar } from "@/components/dashboard/IconSidebar";
import { SubTabs } from "@/components/dashboard/SubTabs";
import { PhonePreview } from "@/components/dashboard/PhonePreview";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardProvider>
        <div
          className="flex flex-col h-screen overflow-hidden"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f5f3f0" }}
        >
          {/* Promo topbar */}
          <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-2 bg-[#0a0a0f] text-white text-xs font-medium">
            <span>Unlock smart routing, QR studio, and custom themes.</span>
            <a
              href="#"
              className="text-[#e8b86d] bg-[rgba(232,184,109,0.15)] px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
            >
              Upgrade to Pro
            </a>
          </div>

          {/* 4-column layout */}
          <div className="flex flex-1 overflow-hidden">
            <IconSidebar />
            <SubTabs />
            <main
              className="flex-1 overflow-y-auto bg-white"
              style={{ padding: "28px 36px" }}
            >
              {children}
            </main>
            <PhonePreview />
          </div>
        </div>
      </DashboardProvider>
    </AuthGuard>
  );
}
