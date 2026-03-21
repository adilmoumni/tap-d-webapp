"use client";

import { useDashboard } from "@/contexts/DashboardContext";

/* ─────────────────────────────────────────────
   Shared primitives
───────────────────────────────────────────── */

const CARD = "bg-[#f0eeea] rounded-[12px] p-[14px]";

function ListRow({
  left,
  right,
  last = false,
  mono = false,
}: {
  left: string;
  right: string;
  last?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-1.5 text-[12px]"
      style={!last ? { borderBottom: "1px solid #f0eeea" } : undefined}
    >
      <span className={mono ? "font-mono text-[11px] text-[#1a1a2e]" : "text-[#1a1a2e]"}>
        {left}
      </span>
      <span className="font-medium text-[#1a1a2e]">{right}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Overview panel
───────────────────────────────────────────── */

const STATS = [
  { label: "Total links",       value: "8",       sub: null },
  { label: "Clicks this month", value: "4,821",   sub: "+12%" },
  { label: "Bio views",         value: "1,203",   sub: "+8%" },
  { label: "Top device",        value: "iOS 68%", sub: null },
];

const BAR_HEIGHTS = [45, 60, 38, 80, 100, 72, 55];

const TOP_LINKS = [
  { slug: "/spotify",  clicks: "2,340" },
  { slug: "/colorpal", clicks: "1,102" },
  { slug: "/course",   clicks: "890" },
  { slug: "/podcast",  clicks: "312" },
];

function OverviewPanel() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Analytics overview</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className={CARD}>
            <p className="text-[10px] text-[#8a8a9a] mb-0.5">{s.label}</p>
            <p className="text-[20px] font-semibold text-[#1a1a2e] leading-tight">{s.value}</p>
            {s.sub && (
              <p className="text-[10px] mt-0.5" style={{ color: "#059669" }}>
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-[#f0eeea] rounded-[12px] p-4 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-medium text-[#1a1a2e]">Clicks (7 days)</span>
          <span className="text-[11px] text-[#8a8a9a]">1,247 total</span>
        </div>
        <div className="flex items-end gap-[3px] h-[70px]">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px]"
              style={{ height: `${h}%`, minHeight: 4, background: "#e8b86d", opacity: 0.65 }}
            />
          ))}
        </div>
      </div>

      {/* Top links */}
      <div>
        <p className="text-[12px] font-semibold text-[#1a1a2e] mb-2">Top links</p>
        {TOP_LINKS.map((row, i) => (
          <ListRow
            key={row.slug}
            left={row.slug}
            right={row.clicks}
            last={i === TOP_LINKS.length - 1}
            mono
          />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Devices panel
───────────────────────────────────────────── */

const DEVICES = [
  { label: "iOS",     value: "68%" },
  { label: "Android", value: "24%" },
  { label: "Desktop", value: "8%" },
];

function DevicesPanel() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Devices</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEVICES.map((d) => (
          <div key={d.label} className={CARD}>
            <p className="text-[10px] text-[#8a8a9a] mb-0.5">{d.label}</p>
            <p className="text-[20px] font-semibold text-[#1a1a2e]">{d.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Countries panel
───────────────────────────────────────────── */

const COUNTRIES = [
  { name: "United States",  clicks: "1,820" },
  { name: "United Kingdom", clicks: "890" },
  { name: "France",         clicks: "640" },
  { name: "Germany",        clicks: "412" },
];

function CountriesPanel() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Countries</h2>
      </div>
      {COUNTRIES.map((row, i) => (
        <ListRow
          key={row.name}
          left={row.name}
          right={row.clicks}
          last={i === COUNTRIES.length - 1}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Referrers panel
───────────────────────────────────────────── */

const REFERRERS = [
  { name: "Instagram",   clicks: "2,100" },
  { name: "Twitter / X", clicks: "980" },
  { name: "Direct",      clicks: "740" },
  { name: "TikTok",      clicks: "520" },
];

function ReferrersPanel() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Referrers</h2>
      </div>
      {REFERRERS.map((row, i) => (
        <ListRow
          key={row.name}
          left={row.name}
          right={row.clicks}
          last={i === REFERRERS.length - 1}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Page — switches on activeTab
───────────────────────────────────────────── */

export default function DashboardPage() {
  const { activeTab } = useDashboard();

  switch (activeTab) {
    case "devices":   return <DevicesPanel />;
    case "countries": return <CountriesPanel />;
    case "referrers": return <ReferrersPanel />;
    default:          return <OverviewPanel />;
  }
}
