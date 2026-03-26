"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DailyStats } from "@/types";

/* ------------------------------------------------------------------
   AnalyticsChart — driven by DailyStats aggregates (30-day window).
   Shows: bar chart, device breakdown, top countries, top referrers.
------------------------------------------------------------------ */

interface AnalyticsChartProps {
  stats: DailyStats[];
  className?: string;
}

const DEVICE_COLORS = {
  ios:     "bg-accent-lilac",
  android: "bg-accent-mint",
  desktop: "bg-lavender",
} as const;

function TopTable({
  data,
  label,
}: {
  data: Record<string, number>;
  label: string;
}) {
  const rows = useMemo(
    () =>
      Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    [data]
  );
  const max = rows[0]?.[1] ?? 1;

  if (rows.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="space-y-2">
        {rows.map(([key, count]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-28 text-xs text-text-secondary truncate flex-shrink-0 font-mono">
              {key.replace(/_/g, ".")}
            </span>
            <div className="flex-1 h-1.5 bg-lavender-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-lavender"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
            <span className="w-8 text-xs text-text-muted text-right flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsChart({ stats, className }: AnalyticsChartProps) {
  const maxClicks = useMemo(
    () => Math.max(1, ...stats.map((s) => s.clicks)),
    [stats]
  );

  const totals = useMemo(
    () =>
      stats.reduce(
        (acc, s) => ({
          clicks:        acc.clicks        + s.clicks,
          iosClicks:     acc.iosClicks     + s.iosClicks,
          androidClicks: acc.androidClicks + s.androidClicks,
          desktopClicks: acc.desktopClicks + s.desktopClicks,
        }),
        { clicks: 0, iosClicks: 0, androidClicks: 0, desktopClicks: 0 }
      ),
    [stats]
  );

  const allCountries = useMemo(
    () =>
      stats.reduce<Record<string, number>>((acc, s) => {
        for (const [k, v] of Object.entries(s.countries ?? {})) {
          acc[k] = (acc[k] ?? 0) + v;
        }
        return acc;
      }, {}),
    [stats]
  );

  const allReferrers = useMemo(
    () =>
      stats.reduce<Record<string, number>>((acc, s) => {
        for (const [k, v] of Object.entries(s.referrers ?? {})) {
          acc[k] = (acc[k] ?? 0) + v;
        }
        return acc;
      }, {}),
    [stats]
  );

  if (totals.clicks === 0) {
    return (
      <p className={cn("text-sm text-text-muted text-center py-6", className)}>
        No clicks recorded yet.
      </p>
    );
  }

  return (
    <div className={cn("space-y-7", className)}>
      {/* Bar chart — last 30 days */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Clicks — last 30 days
        </p>
        <div className="flex gap-2">
          {/* Y-axis */}
          <div className="flex flex-col justify-between items-end" style={{ minWidth: 28, height: 80 }}>
            <span className="text-[8px] text-text-muted tabular-nums">{maxClicks}</span>
            <span className="text-[8px] text-text-muted tabular-nums">{Math.round(maxClicks / 2)}</span>
            <span className="text-[8px] text-text-muted tabular-nums">0</span>
          </div>
          {/* Bars */}
          <div className="flex-1">
            <div className="flex items-end gap-0.5 h-24">
              {stats.map((s) => {
                const pct = Math.round((s.clicks / maxClicks) * 100);
                const label = s.date.slice(5); // MM-DD
                return (
                  <div
                    key={s.date}
                    className="flex flex-col items-center flex-1 min-w-0 group"
                  >
                    <div className="relative w-full flex items-end" style={{ height: 80 }}>
                      <div
                        title={`${label}: ${s.clicks}`}
                        className="w-full rounded-t-sm bg-lavender group-hover:bg-lavender-dark transition-colors"
                        style={{ height: `${Math.max(pct, s.clicks > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis: show ~6 evenly-spaced labels */}
            <div className="flex mt-1">
              {stats
                .filter((_, i) => i % 5 === 0 || i === stats.length - 1)
                .map((s) => (
                  <span
                    key={s.date}
                    className="text-[9px] text-text-muted"
                    style={{ flex: "1 1 0" }}
                  >
                    {s.date.slice(5)}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device breakdown */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Devices
        </p>
        <div className="space-y-2">
          {(
            [
              { key: "ios",     label: "iOS",     count: totals.iosClicks },
              { key: "android", label: "Android", count: totals.androidClicks },
              { key: "desktop", label: "Desktop", count: totals.desktopClicks },
            ] as const
          ).map(({ key, label, count }) => {
            const pct = totals.clicks
              ? Math.round((count / totals.clicks) * 100)
              : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-16 text-xs text-text-secondary flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-lavender-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", DEVICE_COLORS[key])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-text-muted text-right flex-shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Countries */}
      <TopTable data={allCountries} label="Top countries" />

      {/* Referrers */}
      <TopTable data={allReferrers} label="Top referrers" />
    </div>
  );
}
