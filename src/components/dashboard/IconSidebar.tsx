"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Link2, User, Settings } from "lucide-react";
import { useDashboard, type DashboardSection } from "@/contexts/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems: { section: DashboardSection; label: string; icon: React.ElementType; href: string }[] = [
  { section: "analytics", label: "Analytics", icon: BarChart3, href: "/d/dashboard" },
  { section: "links",     label: "Links",     icon: Link2,     href: "/d/links" },
  { section: "bio",       label: "Bio",       icon: User,      href: "/d/bio" },
  { section: "settings",  label: "Settings",  icon: Settings,  href: "/d/settings" },
];

function sectionFromPath(pathname: string): DashboardSection {
  if (pathname.startsWith("/d/bio"))      return "bio";
  if (pathname.startsWith("/d/links"))    return "links";
  if (pathname.startsWith("/d/settings")) return "settings";
  return "analytics";
}

export function IconSidebar() {
  const pathname = usePathname();
  const { activeSection, setActiveSection } = useDashboard();
  const { user } = useAuth();

  // Sync context with current URL on initial load and navigation
  useEffect(() => {
    setActiveSection(sectionFromPath(pathname));
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const initial = user?.displayName?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className="w-[72px] flex-shrink-0 bg-white border-r border-[#e8e6e2] flex flex-col items-center py-4">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-[10px] bg-[#0a0a0f] flex items-center justify-center mb-6 relative cursor-pointer flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e8b86d] absolute" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ section, label, icon: Icon, href }) => {
          const active = activeSection === section;
          return (
            <Link
              key={section}
              href={href}
              className={cn(
                "relative w-11 h-11 rounded-[12px] flex flex-col items-center justify-center gap-0.5 transition-all duration-150",
                "text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]",
                active && "bg-[#f0eeea] text-[#1a1a2e]"
              )}
            >
              {active && (
                <span className="absolute left-[-2px] w-1 h-5 rounded-r-sm bg-[#0a0a0f]" />
              )}
              <Icon size={18} />
              <span className="text-[8px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-[#e8b86d] flex items-center justify-center text-xs font-semibold text-[#0a0a0f] cursor-pointer flex-shrink-0">
        {initial}
      </div>
    </aside>
  );
}
