"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getBioDailyStats, getRecentBioVisitors } from "@/lib/db/bio-analytics";
import {
  countryDisplayName,
  countryFlagEmoji,
  mergeCountryCounts,
  normalizeCountryCode,
  UNKNOWN_COUNTRY,
} from "@/lib/country";
import type { BioVisitStats, BioVisitorDoc } from "@/types/bio";
import { Smartphone, Monitor, Tablet, ExternalLink, Users, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── helpers ── */

function timeAgo(iso: string | null): string {
  if (!iso) return "Just now";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const DEVICE_ICON: Record<"ios" | "android" | "desktop", React.ElementType> = {
  ios:     Smartphone,
  android: Tablet,
  desktop: Monitor,
};

const DEVICE_COLOR: Record<"ios" | "android" | "desktop", string> = {
  ios:     "bg-violet-100 text-violet-600",
  android: "bg-emerald-100 text-emerald-600",
  desktop: "bg-blue-100 text-blue-600",
};

const DEVICE_BAR_COLOR: Record<"ios" | "android" | "desktop", string> = {
  ios:     "bg-violet-400",
  android: "bg-emerald-400",
  desktop: "bg-blue-400",
};

/* ── sub-components ── */

function KpiCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="flex-1 min-w-[100px] bg-white rounded-[16px] border border-[#f0eeea] p-4 flex flex-col gap-1 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className="text-[#8a8a9a]" />
        <span className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-[26px] font-bold text-[#1a1a2e] leading-none">{value}</span>
      {sub && <span className="text-[11px] text-[#8a8a9a] mt-0.5">{sub}</span>}
    </div>
  );
}

function TopTable({
  data,
  label,
  emptyMsg,
  formatLabel,
}: {
  data: Record<string, number>;
  label: string;
  emptyMsg?: string;
  formatLabel?: (key: string) => string;
}) {
  const rows = useMemo(
    () => Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [data]
  );
  const max = rows[0]?.[1] ?? 1;

  return (
    <div>
      <p className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-3">{label}</p>
      {rows.length === 0 ? (
        <p className="text-[12px] text-[#8a8a9a] italic">{emptyMsg ?? "No data yet."}</p>
      ) : (
        <div className="space-y-2">
          {rows.map(([key, count]) => (
            <div key={key} className="flex items-center gap-3">
              <span className={cn(
                "w-28 text-[12px] text-[#1a1a2e] truncate flex-shrink-0",
                formatLabel ? "font-medium" : "font-mono"
              )}>
                {formatLabel ? formatLabel(key) : key.replace(/_/g, ".")}
              </span>
              <div className="flex-1 h-1.5 bg-[#f0eeea] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#e8b86d]"
                  style={{ width: `${Math.round((count / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 text-[11px] text-[#8a8a9a] text-right flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main component ── */

export function BioVisitorsTab() {
  const { profile } = useAuth();
  const bioId = profile?.activeBioId ?? null;

  const [stats, setStats]       = useState<BioVisitStats[]>([]);
  const [visitors, setVisitors] = useState<BioVisitorDoc[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!bioId) return;
    setLoading(true);
    Promise.all([
      getBioDailyStats(bioId, 30),
      getRecentBioVisitors(bioId, 50),
    ])
      .then(([s, v]) => { setStats(s); setVisitors(v); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bioId]);

  /* derived totals */
  const totals = useMemo(() =>
    stats.reduce(
      (acc, s) => ({
        views:        acc.views        + s.totalViews,
        iosViews:     acc.iosViews     + s.iosViews,
        androidViews: acc.androidViews + s.androidViews,
        desktopViews: acc.desktopViews + s.desktopViews,
      }),
      { views: 0, iosViews: 0, androidViews: 0, desktopViews: 0 }
    ), [stats]
  );

  const allCountries = useMemo(() =>
    mergeCountryCounts(...stats.map((s) => s.countries)),
    [stats]
  );

  const countriesForDisplay = useMemo(
    () => ({ ...allCountries, [UNKNOWN_COUNTRY]: allCountries[UNKNOWN_COUNTRY] ?? 0 }),
    [allCountries]
  );

  const countryCount = useMemo(
    () => Object.keys(allCountries).filter((k) => normalizeCountryCode(k) !== UNKNOWN_COUNTRY).length,
    [allCountries]
  );

  const allReferrers = useMemo(() =>
    stats.reduce<Record<string, number>>((acc, s) => {
      for (const [k, v] of Object.entries(s.referrers)) acc[k] = (acc[k] ?? 0) + v;
      return acc;
    }, {}), [stats]
  );

  const topCountryCode = useMemo(
    () =>
      Object.entries(allCountries)
        .filter(([code]) => normalizeCountryCode(code) !== UNKNOWN_COUNTRY)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    [allCountries]
  );

  const maxViews   = useMemo(() => Math.max(1, ...stats.map((s) => s.totalViews)), [stats]);

  /* dominant device */
  const dominantDevice = useMemo<"ios" | "android" | "desktop">(() => {
    if (totals.iosViews >= totals.androidViews && totals.iosViews >= totals.desktopViews) return "ios";
    if (totals.androidViews >= totals.desktopViews) return "android";
    return "desktop";
  }, [totals]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#e8b86d]" />
        <p className="text-[13px] text-[#8a8a9a]">Loading visitor data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-[13px] text-[#ef4444]">{error}</div>
    );
  }

  return (
    <div className="space-y-7 pb-8">

      {/* ── KPI row ── */}
      <div className="flex flex-wrap gap-3">
        <KpiCard
          label="Total views"
          value={totals.views.toLocaleString()}
          icon={TrendingUp}
          sub="Last 30 days"
        />
        <KpiCard
          label="Countries"
          value={countryCount}
          icon={MapPin}
          sub={topCountryCode ? `Top: ${countryFlagEmoji(topCountryCode)} ${countryDisplayName(topCountryCode)}` : "No data yet"}
        />
        <KpiCard
          label="Top device"
          value={
            dominantDevice === "ios"     ? "iOS" :
            dominantDevice === "android" ? "Android" : "Desktop"
          }
          icon={DEVICE_ICON[dominantDevice]}
        />
      </div>

      {/* ── Bar chart — last 30 days ── */}
      <div>
        <p className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-3">
          Views — last 30 days
        </p>
        {totals.views === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <Users size={28} className="text-[#d0cec8]" />
            <p className="text-[13px] text-[#8a8a9a]">No visitors yet.</p>
            <p className="text-[11px] text-[#b0aea8]">Views will appear here once someone visits your public bio page.</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-24">
              {stats.map((s) => {
                const pct = Math.round((s.totalViews / maxViews) * 100);
                return (
                  <div
                    key={s.date}
                    className="flex flex-col items-center flex-1 min-w-0 group"
                  >
                    <div className="relative w-full flex items-end" style={{ height: 80 }}>
                      <div
                        title={`${s.date.slice(5)}: ${s.totalViews}`}
                        className="w-full rounded-t-sm bg-[#e8b86d] group-hover:bg-[#d4a85c] transition-colors"
                        style={{ height: `${Math.max(pct, s.totalViews > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* x-axis labels */}
            <div className="flex mt-1">
              {stats
                .filter((_, i) => i % 5 === 0 || i === stats.length - 1)
                .map((s) => (
                  <span
                    key={s.date}
                    className="text-[9px] text-[#8a8a9a]"
                    style={{ flex: "1 1 0" }}
                  >
                    {s.date.slice(5)}
                  </span>
                ))}
            </div>
          </>
        )}
      </div>

      {/* ── Device breakdown ── */}
      {totals.views > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-3">Devices</p>
          <div className="space-y-2">
            {(
              [
                { key: "ios"     as const, label: "iOS",     count: totals.iosViews     },
                { key: "android" as const, label: "Android", count: totals.androidViews },
                { key: "desktop" as const, label: "Desktop", count: totals.desktopViews },
              ]
            ).map(({ key, label, count }) => {
              const pct = totals.views ? Math.round((count / totals.views) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-16 text-[12px] text-[#1a1a2e] flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-[#f0eeea] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", DEVICE_BAR_COLOR[key])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] text-[#8a8a9a] text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Countries & Referrers ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TopTable
          data={countriesForDisplay}
          label="Top countries"
          emptyMsg="No country data yet."
          formatLabel={countryDisplayName}
        />
        <TopTable data={allReferrers} label="Top referrers" emptyMsg="No referrer data yet." />
      </div>

      {/* ── Recent visitors ── */}
      <div>
        <p className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-3">
          Recent visitors
        </p>
        {visitors.length === 0 ? (
          <p className="text-[12px] text-[#8a8a9a] italic">No visitors recorded yet.</p>
        ) : (
          <div className="space-y-1">
            {visitors.map((v) => {
              const DevIcon = DEVICE_ICON[v.device] ?? Monitor;
              return (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-white border border-[#f0eeea] hover:border-[#e8e6e2] transition-colors"
                >
                  {/* device badge */}
                  <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0", DEVICE_COLOR[v.device])}>
                    <DevIcon size={14} />
                  </div>

                  {/* flag + country */}
                  <span className="text-[14px] flex-shrink-0" title={countryDisplayName(v.country)}>
                    {countryFlagEmoji(v.country)}
                  </span>
                  <span className="w-20 text-[11px] text-[#8a8a9a] truncate flex-shrink-0">
                    {countryDisplayName(v.country)}
                  </span>

                  {/* referrer */}
                  <span className="flex-1 text-[12px] text-[#1a1a2e] truncate">
                    {v.referrer === "direct" ? (
                      <span className="italic text-[#8a8a9a]">Direct</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={10} className="text-[#8a8a9a] flex-shrink-0" />
                        {v.referrer}
                      </span>
                    )}
                  </span>

                  {/* time */}
                  <span className="text-[11px] text-[#8a8a9a] flex-shrink-0 tabular-nums">
                    {timeAgo(v.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
