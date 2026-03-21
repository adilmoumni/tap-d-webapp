"use client";

import React from "react";
import { BarChart3, Link2, MonitorSmartphone, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard, type DashboardSection } from "@/contexts/DashboardContext";

export function Sidebar() {
  const { activeSection, setActiveSection } = useDashboard();

  const navItems: { id: DashboardSection; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "links", label: "Links", icon: Link2 },
    { id: "bio", label: "Bio", icon: MonitorSmartphone },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-[72px] bg-dash-white border-r border-dash-border flex flex-col items-center py-4 shrink-0 font-inter z-10">
      {/* Logo */}
      <div className="w-9 h-9 rounded-[10px] bg-dash-dark flex items-center justify-center mb-6 cursor-pointer relative">
        <span className="w-1.5 h-1.5 rounded-full bg-dash-gold absolute" />
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1 w-full px-3">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-11 h-11 mx-auto rounded-dash-radius flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative gap-0.5",
                isActive
                  ? "bg-dash-border-light text-dash-text"
                  : "text-dash-text-muted hover:bg-dash-border-light hover:text-dash-text"
              )}
            >
              {isActive && (
                <div className="absolute left-[-12px] w-1 h-5 rounded-r-[2px] bg-dash-dark" />
              )}
              <Icon strokeWidth={1.8} size={18} />
              <span className="text-[8px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto">
        <div className="w-8 h-8 rounded-full bg-dash-gold flex items-center justify-center text-[12px] font-semibold text-dash-dark cursor-pointer">
          E
        </div>
      </div>
    </div>
  );
}
