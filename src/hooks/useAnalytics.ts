"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mergeCountryCounts, normalizeCountryCode } from "@/lib/country";
import { useAuth } from "./useAuth";

// ── Types ──────────────────────────────────────────

export interface DailyStats {
  date: string;      // YYYY-MM-DD
  clicks: number;
  iosClicks: number;
  androidClicks: number;
  desktopClicks: number;
  links?: Record<string, number>;
  countries?: Record<string, number>;
  referrers?: Record<string, number>;
}

export interface LinkStats {
  id: string;
  title: string;
  clicks: number;
  isVisible: boolean;
  url: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  iosTotal: number;
  androidTotal: number;
  desktopTotal: number;
  dailyStats: DailyStats[];
  topLinks: LinkStats[];
  topReferrers: { name: string; clicks: number }[];
  topCountries: { name: string; clicks: number }[];
  loading: boolean;
}

// ── Hook ──────────────────────────────────────────

export function useAnalytics(): AnalyticsSummary {
  const { profile } = useAuth();
  const [state, setState] = useState<Omit<AnalyticsSummary, "loading">>(
    {
      totalClicks: 0,
      iosTotal: 0,
      androidTotal: 0,
      desktopTotal: 0,
      dailyStats: [],
      topLinks: [],
      topReferrers: [],
      topCountries: [],
    }
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bioId = profile?.activeBioId;
    if (!bioId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // 1. Bio page totals
        const bioSnap = await getDoc(doc(db, "biopages", bioId!));
        const bioData = bioSnap.data() ?? {};

        // 2. Daily stats for last 30 days
        const statsSnap = await getDocs(
          query(collection(db, "biopages", bioId!, "stats"), orderBy("__name__", "asc"))
        );
        const daily: DailyStats[] = statsSnap.docs.map((d) => {
          const s = d.data();
          return {
            date: d.id,
            clicks: s.clicks ?? s.totalClicks ?? 0,
            iosClicks: s.iosClicks ?? 0,
            androidClicks: s.androidClicks ?? 0,
            desktopClicks: s.desktopClicks ?? 0,
            links: s.links,
            countries: s.countries,
            referrers: s.referrers,
          };
        });

        // Aggregate referrers from all daily docs
        // Aggregate referrers from all daily docs
        const fromStatsReferrers: Record<string, number> = {};
        for (const d of daily) {
          for (const [k, v] of Object.entries(d.referrers ?? {})) {
            fromStatsReferrers[k] = (fromStatsReferrers[k] ?? 0) + v;
          }
        }

        // Countries: merge daily stats + legacy totals + raw visitor docs
        const fromStatsMap = mergeCountryCounts(
          ...daily.map((d) => d.countries),
          bioData.countriesTotal as Record<string, number> | undefined,
          bioData.viewCountriesTotal as Record<string, number> | undefined
        );

        // Also tally countries and referrers from the 50 most recent raw view events
        const visitorsSnap = await getDocs(
          query(
            collection(db, "views"),
            where("bioId", "==", bioId!),
            orderBy("createdAt", "desc"),
            limit(50)
          )
        );
        const fromVisitors: Record<string, number> = {};
        const fromVisitorsReferrers: Record<string, number> = {};
        for (const vd of visitorsSnap.docs) {
          const data = vd.data();
          const code = normalizeCountryCode(data.country ?? null);
          fromVisitors[code] = (fromVisitors[code] ?? 0) + 1;
          
          if (data.referrer) {
            fromVisitorsReferrers[data.referrer] = (fromVisitorsReferrers[data.referrer] ?? 0) + 1;
          }
        }

        // Prefer the larger count per key (avoids double-counting) for Countries
        const countryMap: Record<string, number> = { ...fromVisitors };
        for (const [k, v] of Object.entries(fromStatsMap)) {
          countryMap[k] = Math.max(countryMap[k] ?? 0, v);
        }

        // Prefer the larger count per key for Referrers
        const referrerMap: Record<string, number> = { ...fromVisitorsReferrers };
        for (const [k, v] of Object.entries(fromStatsReferrers)) {
          referrerMap[k] = Math.max(referrerMap[k] ?? 0, v);
        }

        const topReferrers = Object.entries(referrerMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, clicks]) => ({ name, clicks }));

        const topCountries = Object.entries(countryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, clicks]) => ({ name, clicks: clicks as number }));

        // 3. Per-link click counts
        const linksSnap = await getDocs(
          collection(db, "biopages", bioId!, "links")
        );
        const topLinks: LinkStats[] = linksSnap.docs
          .map((d) => {
            const l = d.data();
            return {
              id: d.id,
              title: l.title ?? "",
              clicks: l.clicks ?? 0,
              isVisible: l.isVisible ?? true,
              url: l.url ?? "",
            };
          })
          .sort((a, b) => b.clicks - a.clicks);

        if (!cancelled) {
          setState({
            totalClicks: bioData.totalClicks ?? 0,
            iosTotal: bioData.iosClicksTotal ?? 0,
            androidTotal: bioData.androidClicksTotal ?? 0,
            desktopTotal: bioData.desktopClicksTotal ?? 0,
            dailyStats: daily,
            topLinks,
            topReferrers,
            topCountries,
          });
        }
      } catch (err) {
        console.error("[useAnalytics] error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profile?.activeBioId]);

  return { ...state, loading };
}
