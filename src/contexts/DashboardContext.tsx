"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type DashboardSection = "analytics" | "links" | "biopages" | "bio" | "blog" | "settings";
export type BioMode = "content" | "design";

interface DashboardContextValue {
  activeSection: DashboardSection;
  activeTab: string;
  bioMode: BioMode;
  setActiveSection: (s: DashboardSection) => void;
  setActiveTab: (t: string) => void;
  setBioMode: (m: BioMode) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const DEFAULT_TABS: Record<DashboardSection, string> = {
  analytics: "overview",
  links: "all-links",
  biopages: "all-bios",
  bio: "links",
  blog: "posts",
  settings: "account",
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSectionState] = useState<DashboardSection>("analytics");
  const [activeTab, setActiveTabState] = useState<string>("overview");
  const [bioMode, setBioModeState] = useState<BioMode>("content");

  const setActiveSection = (s: DashboardSection) => {
    setActiveSectionState(s);
    if (s === "bio") {
      setBioModeState("content");
      setActiveTabState("links");
    } else {
      setActiveTabState(DEFAULT_TABS[s]);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        activeSection,
        activeTab,
        bioMode,
        setActiveSection,
        setActiveTab: setActiveTabState,
        setBioMode: setBioModeState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
