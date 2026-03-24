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
    const { slug, linkId, bioId } = body as {
      slug?: string;
      linkId: string;
      bioId?: string;
    };

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

    const promises: Promise<unknown>[] = [];

    // ── 1. Raw click event ──────────────────────────
    promises.push(
      adminDb.collection("clicks").add({
        linkId,
        bioId: resolvedBioId ?? null,
        slug: slug ?? null,
        device,
        country,
        referrer: toFieldKey(referrer),
        ua,
        createdAt: FieldValue.serverTimestamp(),
      })
    );

    if (resolvedBioId) {
      // ── 2. Per-link click counter & breakdowns ──
      const linkRef = adminDb.collection("biopages").doc(resolvedBioId).collection("links").doc(linkId);
      const linkDeviceField = device === "ios" ? "iosClicks" : device === "android" ? "androidClicks" : "desktopClicks";

      promises.push(linkRef.set({
        clicks: FieldValue.increment(1),
        [linkDeviceField]: FieldValue.increment(1),
        [`countries.${toFieldKey(country)}`]: FieldValue.increment(1),
      }, { merge: true }));

      // ── 3. Bio page daily stats ───────────────────
      const bioStatsRef = adminDb.collection("biopages").doc(resolvedBioId).collection("stats").doc(today);
      promises.push(
        bioStatsRef.set({
          clicks: FieldValue.increment(1),
          [linkDeviceField]: FieldValue.increment(1),
          [`links.${linkId}`]: FieldValue.increment(1),
          [`referrers.${toFieldKey(referrer)}`]: FieldValue.increment(1),
          [`countries.${toFieldKey(country)}`]: FieldValue.increment(1),
        }, { merge: true })
      );

      // ── 4. Bio page all-time totals ───────────────
      const bioRef = adminDb.collection("biopages").doc(resolvedBioId);
      promises.push(
        bioRef.set({
          totalClicks: FieldValue.increment(1),
          [linkDeviceField + "Total"]: FieldValue.increment(1),
          [`countriesTotal.${toFieldKey(country)}`]: FieldValue.increment(1),
        }, { merge: true })
      );
    }

    await Promise.allSettled(promises);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/click] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
