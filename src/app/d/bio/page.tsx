"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { BioLinksEditor } from "@/components/dashboard/bio/BioLinksEditor";
import { BioDesignEditor } from "@/components/dashboard/bio/design/BioDesignEditor";
import { BioVisitorsTab } from "@/components/dashboard/bio/BioVisitorsTab";
import { Loader2 } from "lucide-react";

export default function BioPage() {
  const { bioMode, activeTab } = useDashboard();
  const { loading } = useBioEditor();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-lavender-dark" />
        <p className="text-sm text-text-muted font-medium">Loading your link in bio...</p>
      </div>
    );
  }

  if (bioMode === "content") {
    if (activeTab === "visitors") return (
      <div className="p-4 lg:p-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Visitors</h2>
        <BioVisitorsTab />
      </div>
    );
    return <BioLinksEditor />;
  }

  return <BioDesignEditor activeTab={activeTab} />;
}
