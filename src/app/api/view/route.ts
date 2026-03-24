import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function toFieldKey(s: string): string {
  return s.replace(/[.$/[\]#]/g, "_").slice(0, 64) || "unknown";
}

function parseDevice(ua: string): "ios" | "android" | "desktop" {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, bioId } = body as {
      slug?: string;
      bioId?: string;
    };

    if (!slug && !bioId) {
      return NextResponse.json({ ok: false, error: "Missing slug or bioId" }, { status: 400 });
    }

    const ua      = req.headers.get("user-agent") ?? "";
    const referrer = req.headers.get("referer") ?? "direct";
    const device  = parseDevice(ua);
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || req.headers.get("x-country-code") || "Unknown";
    const today   = new Date().toISOString().slice(0, 10);

    let resolvedBioId = bioId;
    if (!resolvedBioId && slug) {
      const snap = await adminDb.collection("biopages").where("slug", "==", slug).limit(1).get();
      if (!snap.empty) resolvedBioId = snap.docs[0].id;
    }

    if (!resolvedBioId) {
      return NextResponse.json({ ok: true }); // Silent fail for unknown bios
    }

    const promises: Promise<unknown>[] = [];

    // ── 1. Raw view event ──────────────────────────
    promises.push(
      adminDb.collection("views").add({
        bioId: resolvedBioId,
        slug: slug ?? null,
        device,
        country,
        referrer: toFieldKey(referrer),
        ua,
        createdAt: FieldValue.serverTimestamp(),
      })
    );

    // ── 2. Bio page daily stats ───────────────────
    const bioStatsRef = adminDb.collection("biopages").doc(resolvedBioId).collection("stats").doc(today);
    const deviceField = device === "ios" ? "iosViews" : device === "android" ? "androidViews" : "desktopViews";

    promises.push(
      bioStatsRef.set({
        views: FieldValue.increment(1),
        [deviceField]: FieldValue.increment(1),
        [`viewReferrers.${toFieldKey(referrer)}`]: FieldValue.increment(1),
        [`viewCountries.${toFieldKey(country)}`]: FieldValue.increment(1),
      }, { merge: true })
    );

    // ── 3. Bio page all-time totals ───────────────
    const bioRef = adminDb.collection("biopages").doc(resolvedBioId);
    promises.push(
      bioRef.set({
        totalViews: FieldValue.increment(1),
        [deviceField + "Total"]: FieldValue.increment(1),
        [`viewCountriesTotal.${toFieldKey(country)}`]: FieldValue.increment(1),
      }, { merge: true })
    );

    await Promise.allSettled(promises);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/view] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
