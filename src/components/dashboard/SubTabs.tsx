"use client";

import {
  BarChart3, Smartphone, Globe, ExternalLink,
  List, QrCode, Users,
  User, LayoutTemplate, ImageIcon, Type, Square, Palette, AlignJustify, SlidersHorizontal,
  PenLine,
} from "lucide-react";
import { useDashboard, type DashboardSection } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

type TabItem = { id: string; label: string; icon: React.ElementType };

const analyticsTabs: TabItem[] = [
  { id: "overview",   label: "Overview",   icon: BarChart3 },
  { id: "devices",    label: "Devices",    icon: Smartphone },
  { id: "countries",  label: "Countries",  icon: Globe },
  { id: "referrers",  label: "Referrers",  icon: ExternalLink },
];

const linksTabs: TabItem[] = [
  { id: "all-links", label: "All links", icon: List },
  { id: "qr-codes",  label: "QR codes",  icon: QrCode },
];

const bioPagesTabs: TabItem[] = [
  { id: "all-bios", label: "All bios", icon: List },
];

const bioContentTabs: TabItem[] = [
  { id: "links",    label: "Links",    icon: List },
  { id: "visitors", label: "Visitors", icon: Users },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

const bioDesignTabs: TabItem[] = [
  { id: "header",    label: "Header",    icon: User },
  { id: "theme",     label: "Theme",     icon: LayoutTemplate },
  { id: "wallpaper", label: "Wallpaper", icon: ImageIcon },
  { id: "text",      label: "Text",      icon: Type },
  { id: "buttons",   label: "Buttons",   icon: Square },
  { id: "colors",    label: "Colors",    icon: Palette },
  { id: "footer",    label: "Footer",    icon: AlignJustify },
];

const settingsTabs: TabItem[] = [
  { id: "account",  label: "Account",      icon: User },
  // { id: "billing",  label: "Plan & billing", icon: CreditCard },
  // { id: "api-keys", label: "API keys",     icon: KeyRound },
];

const blogTabs: TabItem[] = [
  { id: "posts", label: "Posts", icon: PenLine },
];

const sectionTitles: Record<DashboardSection, string> = {
  analytics: "Analytics",
  links: "Links",
  biopages: "Bio pages",
  bio: "Bio pages",
  blog: "Blog",
  settings: "Settings",
};

function TabRow({ item, active, onClick }: { item: TabItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-[9px] text-[13px] font-medium transition-all duration-150 rounded-[8px] lg:rounded-none lg:w-full lg:text-left whitespace-nowrap",
        active
          ? "text-[#1a1a2e] bg-[#f0eeea] lg:border-l-2 lg:border-l-[#0a0a0f]"
          : "text-[#8a8a9a] lg:border-l-2 lg:border-l-transparent hover:text-[#1a1a2e] hover:bg-[#f0eeea]"
      )}
    >
      <Icon size={16} className={cn("flex-shrink-0", active ? "opacity-80" : "opacity-50")} />
      {item.label}
    </button>
  );
}

export function SubTabs() {
  const { activeSection, activeTab, setActiveTab, bioMode, setBioMode } = useDashboard();
  const title = sectionTitles[activeSection];

  let tabs: TabItem[];
  if (activeSection === "analytics") tabs = analyticsTabs;
  else if (activeSection === "links") tabs = linksTabs;
  else if (activeSection === "biopages") tabs = bioPagesTabs;
  else if (activeSection === "bio") tabs = bioMode === "content" ? bioContentTabs : bioDesignTabs;
  else if (activeSection === "blog") tabs = blogTabs;
  else tabs = settingsTabs;

  const handleBioMode = (mode: "content" | "design") => {
    setBioMode(mode);
    setActiveTab(mode === "content" ? "links" : "header");
  };

  return (
    <aside className="w-full lg:w-[190px] flex-shrink-0 bg-white border-b lg:border-r lg:border-b-0 border-[#e8e6e2] flex flex-row lg:flex-col font-inter overflow-x-auto lg:overflow-y-auto no-scrollbar">
      <div className="py-2.5 px-3 lg:px-0 lg:py-4 flex flex-row lg:flex-col gap-1 lg:gap-0 min-w-max lg:min-w-0 items-center lg:items-stretch">
        <p className="hidden lg:block px-4 pb-2 text-[10px] font-semibold text-[#8a8a9a] uppercase tracking-widest mt-2">
          {title}
        </p>

        {activeSection === "bio" && (
          <div className="mx-1 lg:mx-3 lg:mb-2 lg:mt-1 flex bg-[#f0eeea] rounded-[8px] p-0.5 shrink-0 self-center lg:self-stretch">
            {(["content", "design"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleBioMode(mode)}
                className={cn(
                  "flex-1 py-[3px] text-[11px] font-semibold rounded-[6px] transition-all duration-150 capitalize",
                  bioMode === mode
                    ? "bg-white text-[#1a1a2e] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    : "text-[#8a8a9a] hover:text-[#1a1a2e]"
                )}
              >
                {mode === "content" ? "Content" : "Design"}
              </button>
            ))}
          </div>
        )}

        {tabs.map((tab) => (
          <TabRow
            key={tab.id}
            item={tab}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
    </aside>
  );
}
