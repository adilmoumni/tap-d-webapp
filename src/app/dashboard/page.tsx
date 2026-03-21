"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { SubTabs } from "@/components/dashboard/SubTabs";
import { PhonePreviewPane } from "@/components/dashboard/PhonePreviewPane";
import { useDashboard } from "@/contexts/DashboardContext";
import { BioLinksEditor } from "@/components/dashboard/bio/BioLinksEditor";
import { BioDesignEditor } from "@/components/dashboard/bio/design/BioDesignEditor";

export default function DashboardPage() {
  const { activeSection, activeTab, bioMode } = useDashboard();

  const renderContent = () => {
    if (activeSection === "analytics") {
      switch (activeTab) {
        case "overview": return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-[15px] font-semibold text-[#1a1a2e] mb-1">No data yet</h3>
            <p className="text-[13px] text-dash-text-muted">Share your bio page to start tracking</p>
          </div>
        );
        case "devices": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            AnalyticsDevices
          </div>
        );
        case "countries": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            AnalyticsCountries
          </div>
        );
        case "referrers": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            AnalyticsReferrers
          </div>
        );
        default: return null;
      }
    }

    if (activeSection === "links") {
      switch (activeTab) {
        case "all-links": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            AllLinks
          </div>
        );
        case "qr-codes": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            QRCodes
          </div>
        );
        default: return null;
      }
    }

    if (activeSection === "bio") {
      if (bioMode === "content" && activeTab === "links") {
        return <BioLinksEditor />;
      }
      if (bioMode === "design") {
        return <BioDesignEditor activeTab={activeTab} />;
      }
      return null;
    }

    if (activeSection === "settings") {
      switch (activeTab) {
        case "account": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            SettingsAccount (placeholder for now)
          </div>
        );
        case "billing": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            SettingsBilling (placeholder for now)
          </div>
        );
        case "api-keys": return (
          <div className="flex items-center justify-center h-full text-dash-text-muted text-sm border-2 border-dashed border-dash-border rounded-xl">
            SettingsAPI (placeholder for now)
          </div>
        );
        default: return null;
      }
    }

    return null;
  };

  return (
    <>
      <Sidebar />
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <SubTabs />

        <div className="flex-1 overflow-y-auto bg-dash-white p-7 md:p-9 font-inter">
          {renderContent()}
        </div>

        <PhonePreviewPane />
      </div>
    </>
  );
}
