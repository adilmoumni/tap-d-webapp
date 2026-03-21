"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type DashboardSection = "analytics" | "links" | "bio" | "settings";
export type BioMode = "content" | "design";

export interface BioLink {
  id: string;
  title: string;
  slug: string;
  smart: boolean;
  clicks: number;
  active: boolean;
}

const INITIAL_LINKS: BioLink[] = [
  { id: "1", title: "Spotify playlist", slug: "spotify",    smart: true,  clicks: 2340, active: true },
  { id: "2", title: "ColorPal app",     slug: "colorpal",   smart: true,  clicks: 1102, active: true },
  { id: "3", title: "Instagram",        slug: "instagram",  smart: false, clicks: 0,    active: true },
  { id: "4", title: "Newsletter",       slug: "newsletter", smart: false, clicks: 312,  active: false },
];

interface DashboardContextValue {
  activeSection: DashboardSection;
  activeTab: string;
  bioMode: BioMode;
  bioLinks: BioLink[];
  setActiveSection: (s: DashboardSection) => void;
  setActiveTab: (t: string) => void;
  setBioMode: (m: BioMode) => void;
  setBioLinks: React.Dispatch<React.SetStateAction<BioLink[]>>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const DEFAULT_TABS: Record<DashboardSection, string> = {
  analytics: "overview",
  links: "all-links",
  bio: "links",
  settings: "account",
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSectionState] = useState<DashboardSection>("analytics");
  const [activeTab, setActiveTabState] = useState<string>("overview");
  const [bioMode, setBioModeState] = useState<BioMode>("content");
  const [bioLinks, setBioLinks] = useState<BioLink[]>(INITIAL_LINKS);

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
        bioLinks,
        setActiveSection,
        setActiveTab: setActiveTabState,
        setBioMode: setBioModeState,
        setBioLinks,
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
