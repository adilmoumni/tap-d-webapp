import React from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { DashboardProvider } from "@/contexts/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="font-inter bg-dash-bg text-dash-text flex flex-col h-screen overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </DashboardProvider>
  );
}
