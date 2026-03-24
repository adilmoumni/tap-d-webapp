"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { countryDisplayName, normalizeCountryCode, UNKNOWN_COUNTRY } from "@/lib/country";

/* ─────────────────────────────────────────────
   Shared primitives
───────────────────────────────────────────── */

const CARD = "bg-[#f0eeea] rounded-[12px] p-[14px]";

function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div
      className="rounded-[6px] animate-pulse bg-[#e8e6e2]"
      style={{ width: w, height: h }}
    />
  );
}

function ListRow({
  left, right, last = false, mono = false, sub,
}: {
  left: string; right: string | number; last?: boolean; mono?: boolean; sub?: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-2 text-[12px]"
      style={!last ? { borderBottom: "1px solid #f0eeea" } : undefined}
    >
      <div>
        <span className={mono ? "font-mono text-[11px] text-[#1a1a2e]" : "text-[#1a1a2e]"}>
          {left}
        </span>
        {sub && <p className="text-[10px] text-[#8a8a9a] mt-0.5">{sub}</p>}
      </div>
      <span className="font-semibold text-[#1a1a2e]">{right.toLocaleString()}</span>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ─────────────────────────────────────────────
   Bar chart (7 or 30 days)
───────────────────────────────────────────── */

function BarChart({ data, days = 7 }: { data: { date: string; clicks: number }[]; days?: number }) {
  const slice = data.slice(-days);
  const max = Math.max(...slice.map((d) => d.clicks), 1);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex items-end gap-[3px] h-[70px] mt-2">
      {slice.map((d) => {
        const h = Math.max((d.clicks / max) * 100, 4);
        const dayLabel = daysOfWeek[new Date(d.date).getDay()];
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-[2px]" title={`${d.date}: ${d.clicks} clicks`}>
            <div
              className="w-full rounded-t-[3px] transition-all"
              style={{ height: `${h}%`, background: "#e8b86d", minHeight: 4 }}
            />
            {days <= 7 && (
              <span className="text-[8px] text-[#8a8a9a]">{dayLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Overview panel
───────────────────────────────────────────── */

function OverviewPanel() {
  const analytics = useAnalytics();
  const { profile } = useAuth();

  const last7 = analytics.dailyStats.slice(-7);
  const last7Total = last7.reduce((s, d) => s + d.clicks, 0);
  const prev7 = analytics.dailyStats.slice(-14, -7);
  const prev7Total = prev7.reduce((s, d) => s + d.clicks, 0);
  const delta = prev7Total > 0
    ? Math.round(((last7Total - prev7Total) / prev7Total) * 100)
    : null;

  const topDevice =
    analytics.iosTotal >= analytics.androidTotal && analytics.iosTotal >= analytics.desktopTotal
      ? `iOS ${analytics.totalClicks > 0 ? Math.round((analytics.iosTotal / analytics.totalClicks) * 100) : 0}%`
      : analytics.androidTotal >= analytics.desktopTotal
      ? `Android ${analytics.totalClicks > 0 ? Math.round((analytics.androidTotal / analytics.totalClicks) * 100) : 0}%`
      : `Desktop ${analytics.totalClicks > 0 ? Math.round((analytics.desktopTotal / analytics.totalClicks) * 100) : 0}%`;

  const STATS = [
    { label: "Total links",       value: analytics.loading ? null : analytics.topLinks.length, sub: null },
    { label: "Clicks (7 days)",   value: analytics.loading ? null : last7Total, sub: delta !== null ? `${delta > 0 ? "+" : ""}${delta}% vs prev week` : null },
    { label: "All-time clicks",   value: analytics.loading ? null : analytics.totalClicks, sub: null },
    { label: "Top device",        value: analytics.loading ? null : topDevice, sub: null },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Analytics overview</h2>
          {profile?.username && (
            <p className="text-[11px] text-[#8a8a9a] mt-0.5">/{profile.username}</p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2 mb-5 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className={CARD}>
            <p className="text-[10px] text-[#8a8a9a] mb-0.5">{s.label}</p>
            {s.value === null ? (
              <Skeleton h={24} />
            ) : (
              <p className="text-[20px] font-semibold text-[#1a1a2e] leading-tight">
                {typeof s.value === "number" ? fmt(s.value) : s.value}
              </p>
            )}
            {s.sub && (
              <p className="text-[10px] mt-0.5" style={{ color: delta && delta >= 0 ? "#059669" : "#ef4444" }}>
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-[#f0eeea] rounded-[12px] p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-[#1a1a2e]">Clicks (last 7 days)</span>
          <span className="text-[11px] text-[#8a8a9a]">{last7Total.toLocaleString()} total</span>
        </div>
        {analytics.loading ? (
          <div className="h-[80px] flex items-center justify-center">
            <Skeleton w="100%" h={70} />
          </div>
        ) : analytics.dailyStats.length === 0 ? (
          <p className="text-[11px] text-[#8a8a9a] text-center py-6">No clicks yet — share your bio link to get started! 🚀</p>
        ) : (
          <BarChart data={analytics.dailyStats} days={7} />
        )}
      </div>

      {/* Top links */}
      <div className="bg-[#f0eeea] rounded-[12px] p-4">
        <p className="text-[12px] font-semibold text-[#1a1a2e] mb-2">Top links</p>
        {analytics.loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} h={28} />)}
          </div>
        ) : analytics.topLinks.length === 0 ? (
          <p className="text-[11px] text-[#8a8a9a]">No links yet.</p>
        ) : (
          analytics.topLinks.slice(0, 5).map((l, i) => (
            <ListRow
              key={l.id}
              left={l.title || "Untitled"}
              right={l.clicks}
              last={i === Math.min(analytics.topLinks.length - 1, 4)}
              sub={l.url.replace(/^https?:\/\//, "").slice(0, 30)}
              mono
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Devices panel
───────────────────────────────────────────── */

function DevicesPanel() {
  const analytics = useAnalytics();
  const total = analytics.totalClicks || 1;

  const devs = [
    { label: "iOS",     value: analytics.iosTotal,     pct: Math.round((analytics.iosTotal / total) * 100) },
    { label: "Android", value: analytics.androidTotal, pct: Math.round((analytics.androidTotal / total) * 100) },
    { label: "Desktop", value: analytics.desktopTotal, pct: Math.round((analytics.desktopTotal / total) * 100) },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Devices</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {devs.map((d) => (
          <div key={d.label} className={CARD}>
            <p className="text-[10px] text-[#8a8a9a] mb-0.5">{d.label}</p>
            {analytics.loading ? <Skeleton h={24} /> : (
              <>
                <p className="text-[20px] font-semibold text-[#1a1a2e]">{d.pct}%</p>
                <p className="text-[10px] text-[#8a8a9a] mt-0.5">{d.value.toLocaleString()} clicks</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      {!analytics.loading && analytics.totalClicks > 0 && (
        <div className="bg-[#f0eeea] rounded-[12px] p-4">
          <p className="text-[12px] font-semibold text-[#1a1a2e] mb-3">Distribution</p>
          <div className="flex rounded-full overflow-hidden h-4 gap-[1px]">
            {devs.filter(d => d.pct > 0).map((d) => (
              <div
                key={d.label}
                style={{
                  width: `${d.pct}%`,
                  background: d.label === "iOS" ? "#e8b86d" : d.label === "Android" ? "#7c6cef" : "#5cb98c",
                }}
                title={`${d.label}: ${d.pct}%`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {[{l:"iOS",c:"#e8b86d"},{l:"Android",c:"#7c6cef"},{l:"Desktop",c:"#5cb98c"}].map(({l,c}) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-[#8a8a9a]">
                <span className="inline-block w-2 h-2 rounded-full" style={{background: c}} />
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daily chart by device */}
      {!analytics.loading && analytics.dailyStats.length > 0 && (
        <div className="bg-[#f0eeea] rounded-[12px] p-4 mt-4">
          <p className="text-[12px] font-semibold text-[#1a1a2e] mb-1">iOS clicks — last 7 days</p>
          <BarChart data={analytics.dailyStats.map(d => ({ date: d.date, clicks: d.iosClicks }))} days={7} />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Referrers panel
───────────────────────────────────────────── */

function ReferrersPanel() {
  const analytics = useAnalytics();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Traffic sources</h2>
      </div>
      <div className="bg-[#f0eeea] rounded-[12px] p-4">
        {analytics.loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} h={28} />)}
          </div>
        ) : analytics.topReferrers.length === 0 ? (
          <p className="text-[11px] text-[#8a8a9a] text-center py-4">No referrer data yet.</p>
        ) : (
          analytics.topReferrers.map((r, i) => (
            <ListRow
              key={r.name}
              left={r.name}
              right={r.clicks}
              last={i === analytics.topReferrers.length - 1}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Countries panel
───────────────────────────────────────────── */

function CountriesPanel() {
  const analytics = useAnalytics();
  const countries = [...analytics.topCountries];
  if (!countries.some((c) => normalizeCountryCode(c.name) === UNKNOWN_COUNTRY)) {
    countries.push({ name: UNKNOWN_COUNTRY, clicks: 0 });
  }
  countries.sort((a, b) => b.clicks - a.clicks);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Top Countries</h2>
      </div>
      <div className="bg-[#f0eeea] rounded-[12px] p-4">
        {analytics.loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} h={28} />)}
          </div>
        ) : countries.length === 0 ? (
          <p className="text-[11px] text-[#8a8a9a] text-center py-4">No country data yet.</p>
        ) : (
          countries.map((c, i) => (
            <ListRow
              key={c.name}
              left={countryDisplayName(c.name)}
              right={c.clicks}
              last={i === countries.length - 1}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Links breakdown panel
───────────────────────────────────────────── */

function LinksPanel() {
  const analytics = useAnalytics();
  const total = analytics.topLinks.reduce((s, l) => s + l.clicks, 0) || 1;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Link performance</h2>
      </div>
      <div className="bg-[#f0eeea] rounded-[12px] p-4">
        {analytics.loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} h={40} />)}
          </div>
        ) : analytics.topLinks.length === 0 ? (
          <p className="text-[11px] text-[#8a8a9a] text-center py-4">No link clicks yet.</p>
        ) : (
          analytics.topLinks.map((l, i) => (
            <div
              key={l.id}
              className="py-2"
              style={i < analytics.topLinks.length - 1 ? { borderBottom: "1px solid #e8e6e2" } : undefined}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-[#1a1a2e] truncate max-w-[70%]">
                  {l.title || "Untitled"}
                </span>
                <span className="text-[12px] font-semibold text-[#1a1a2e]">{l.clicks.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#e8e6e2] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round((l.clicks / total) * 100)}%`, background: "#e8b86d" }}
                />
              </div>
            </div>
          ))
        )}
      </div>
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
    case "referrers": return <ReferrersPanel />;
    case "countries": return <CountriesPanel />;
    case "links":     return <LinksPanel />;
    default:          return <OverviewPanel />;
  }
}
