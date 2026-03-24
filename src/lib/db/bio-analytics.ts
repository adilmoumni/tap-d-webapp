/* ------------------------------------------------------------------
   Bio page visitor analytics — client-side helpers.
   Writes to:
     • views/{viewId}          — raw per-visit event
     • biopages/{bioId}/stats/{date} — daily aggregates (read by dashboard)
   Reads from:
     • biopages/{bioId}/stats/{date} — last N days of aggregated data
     • views/ (filtered by bioId)   — recent raw visitors
   Firestore security rules already allow these operations.
------------------------------------------------------------------ */

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeCountryCode, UNKNOWN_COUNTRY } from "@/lib/country";
import type { BioVisitorDoc, BioVisitStats } from "@/types/bio";

/** Sanitise a string for use as a Firestore field key (no dots / special chars). */
function toFieldKey(s: string): string {
  return s.replace(/\./g, "_").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "unknown";
}

/** Detect device type from navigator.userAgent */
function detectDevice(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/** Fetch visitor's country via a free IP geolocation API (best-effort). */
async function fetchCountry(): Promise<string | undefined> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.country_code ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Log a bio page view. Called once on mount in BioPublicLayout.
 * Writes a raw view event + atomic daily aggregate increments.
 */
export async function logBioView(bioId: string, ownerId: string): Promise<void> {
  try {
    const device = detectDevice();
    const referrer = typeof document !== "undefined"
      ? (document.referrer
          ? new URL(document.referrer).hostname.replace(/^www\./, "")
          : "direct")
      : "direct";

    // Fire country lookup in parallel — non-blocking for the main write
    const countryPromise = fetchCountry();

    const country = normalizeCountryCode(await countryPromise);

    // 1. Raw view event
    await addDoc(collection(db, "views"), {
      bioId,
      ownerId,
      device,
      country: country === UNKNOWN_COUNTRY ? null : country,
      referrer,
      createdAt: serverTimestamp(),
    });

    // 2. Daily aggregate in biopages/{bioId}/stats/{date}
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = doc(db, "biopages", bioId, "stats", today);

    const deviceField =
      device === "ios"     ? "iosViews" :
      device === "android" ? "androidViews" :
                              "desktopViews";

    const aggregates: Record<string, ReturnType<typeof increment>> = {
      totalViews: increment(1),
      [deviceField]: increment(1),
      [`countries.${toFieldKey(country)}`]: increment(1),
    };
    if (referrer && referrer !== "direct") {
      aggregates[`referrers.${toFieldKey(referrer)}`] = increment(1);
    }

    await setDoc(statsRef, aggregates, { merge: true });
  } catch (err) {
    // Never crash the page just because analytics failed
    console.warn("[logBioView] analytics error:", err);
  }
}

/**
 * Fetch daily visit stats for a bio page (last `days` days, oldest-first).
 * Requires auth — reads biopages/{bioId}/stats/{date}.
 */
export async function getBioDailyStats(
  bioId: string,
  days = 30
): Promise<BioVisitStats[]> {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const refs = dates.map((date) => doc(db, "biopages", bioId, "stats", date));
  const snaps = await Promise.all(refs.map((r) => getDoc(r)));

  return snaps.map((snap, i) => {
    const data = snap.data() ?? {};
    return {
      date:          dates[i],
      totalViews:    (data.totalViews    as number) ?? 0,
      iosViews:      (data.iosViews      as number) ?? 0,
      androidViews:  (data.androidViews  as number) ?? 0,
      desktopViews:  (data.desktopViews  as number) ?? 0,
      countries:     (data.countries     as Record<string, number>) ?? {},
      referrers:     (data.referrers     as Record<string, number>) ?? {},
    };
  });
}

/**
 * Fetch the most recent raw visitor events for a bio page.
 * Requires auth — reads the views/ collection filtered by bioId.
 */
/**
 * Log a link click on a bio page.
 * Writes a raw click event + atomic daily aggregate increments.
 */
export async function logBioClick(
  bioId: string,
  linkId: string,
  ownerId?: string
): Promise<void> {
  try {
    const device = detectDevice();
    const country = normalizeCountryCode(await fetchCountry());
    const referrer = typeof document !== "undefined"
      ? (document.referrer
          ? new URL(document.referrer).hostname.replace(/^www\./, "")
          : "direct")
      : "direct";

    // 1. Raw click event
    await addDoc(collection(db, "clicks"), {
      bioId,
      linkId,
      ownerId: ownerId ?? null,
      device,
      country: country === UNKNOWN_COUNTRY ? null : country,
      referrer,
      createdAt: serverTimestamp(),
    });

    // 2. Daily aggregate in biopages/{bioId}/stats/{date}
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = doc(db, "biopages", bioId, "stats", today);
    const linkRef = doc(db, "biopages", bioId, "links", linkId);

    const deviceField =
      device === "ios"     ? "iosClicks" :
      device === "android" ? "androidClicks" :
                              "desktopClicks";

    const statsAggregates: Record<string, ReturnType<typeof increment>> = {
      totalClicks: increment(1),
      [deviceField]: increment(1),
      [`links.${linkId}`]: increment(1),
      [`countries.${toFieldKey(country)}`]: increment(1),
    };

    if (referrer && referrer !== "direct") {
      statsAggregates[`referrers.${toFieldKey(referrer)}`] = increment(1);
    }

    // Update daily stats
    await setDoc(statsRef, statsAggregates, { merge: true });

    // Update link-specific total
    await setDoc(linkRef, {
      clicks: increment(1),
      [deviceField]: increment(1),
      [`countries.${toFieldKey(country)}`]: increment(1),
    }, { merge: true });

    // 3. Overall bio page totals
    const bioRef = doc(db, "biopages", bioId);
    await setDoc(bioRef, {
      totalClicks: increment(1),
      [`${deviceField}Total`]: increment(1),
      [`viewCountriesTotal.${toFieldKey(country)}`]: increment(1),
      [`countriesTotal.${toFieldKey(country)}`]: increment(1),
    }, { merge: true });

  } catch (err) {
    console.warn("[logBioClick] analytics error:", err);
  }
}

export async function getRecentBioVisitors(
  bioId: string,
  maxResults = 50
): Promise<BioVisitorDoc[]> {
  const q = query(
    collection(db, "views"),
    where("bioId", "==", bioId),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const normalizedCountry = normalizeCountryCode(data.country ?? null);
    return {
      id:        d.id,
      bioId:     data.bioId,
      ownerId:   data.ownerId,
      device:    data.device,
      country:   normalizedCountry === UNKNOWN_COUNTRY ? null : normalizedCountry,
      referrer:  data.referrer ?? "direct",
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
    } as BioVisitorDoc;
  });
}
