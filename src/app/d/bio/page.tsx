"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { BioLinksEditor } from "@/components/dashboard/bio/BioLinksEditor";
import { BioDesignEditor } from "@/components/dashboard/bio/design/BioDesignEditor";

export default function BioPage() {
  const { bioMode, activeTab } = useDashboard();

  if (bioMode === "content") {
    return <BioLinksEditor />;
  }

  return <BioDesignEditor activeTab={activeTab} />;
}
