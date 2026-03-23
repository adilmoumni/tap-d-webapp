/* ------------------------------------------------------------------
   Server-side bio page queries.
   Uses the client Firebase SDK but serializes all Firestore
   Timestamps to plain strings before returning.
------------------------------------------------------------------ */

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BioTheme, BioSocialLink } from "@/types/bio";
import { DEFAULT_THEME } from "@/types/bio";

/* ── Plain-object versions of bio types (no Timestamps) ── */

export interface BioLinkPlain {
  id: string;
  title: string;
  url: string;
  slug: string;
  icon: string;
  isSmart: boolean;
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl: string;
  isVisible: boolean;
  clicks: number;
  order: number;
  thumbnailUrl?: string;
  layout?: "classic" | "featured";
  lockType?: "none" | "code" | "password" | "sensitive";
  lockCode?: string;
  lockPassword?: string;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  prioritize?: "none" | "animate" | "redirect";
  animationType?: "buzz" | "wobble" | "pop" | "swipe";
  redirectUntil?: string | null;
  createdAt: string | null;
}

export interface BioPagePlain {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: BioSocialLink[];
  links: BioLinkPlain[];
  theme: BioTheme;
  isPublic: boolean;
  updatedAt: string | null;
  createdAt: string | null;
}

/* ── Helpers ── */

function tsToString(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "object" && val !== null && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return val;
  return null;
}

/* ── Fetch bio page (with serialized timestamps) ── */

export async function getBioPageServer(username: string): Promise<BioPagePlain | null> {
  const snap = await getDoc(doc(db, "biopages", username));
  if (!snap.exists()) return null;

  const d = snap.data();

  const linksSnap = await getDocs(
    query(
      collection(db, "biopages", username, "links"),
      orderBy("order", "asc")
    )
  );

  const links: BioLinkPlain[] = linksSnap.docs.map((linkDoc) => {
    const l = linkDoc.data();
    return {
      id: linkDoc.id,
      title: l.title ?? "",
      url: l.url ?? "",
      slug: l.slug ?? "",
      icon: l.icon ?? "",
      isSmart: l.isSmart ?? false,
      iosUrl: l.iosUrl,
      androidUrl: l.androidUrl,
      fallbackUrl: l.fallbackUrl ?? "",
      isVisible: l.isVisible ?? true,
      clicks: l.clicks ?? 0,
      order: l.order ?? 0,
      thumbnailUrl: l.thumbnailUrl,
      layout: l.layout ?? "classic",
      lockType: l.lockType ?? "none",
      lockCode: l.lockCode,
      lockPassword: l.lockPassword,
      scheduleStart: l.scheduleStart ?? null,
      scheduleEnd: l.scheduleEnd ?? null,
      prioritize: l.prioritize ?? "none",
      animationType: l.animationType ?? "buzz",
      redirectUntil: l.redirectUntil ?? null,
      createdAt: tsToString(l.createdAt),
    };
  });

  return {
    username: d.username ?? username,
    displayName: d.displayName ?? username,
    bio: d.bio ?? "",
    avatarUrl: d.avatarUrl ?? null,
    socialLinks: (d.socialLinks ?? []).map((s: BioSocialLink, i: number) => ({
      platform: s.platform,
      url: s.url,
      icon: s.icon ?? "",
      order: s.order ?? i,
    })),
    links,
    theme: { ...DEFAULT_THEME, ...(d.theme ?? {}) },
    isPublic: d.isPublic ?? true,
    updatedAt: tsToString(d.updatedAt),
    createdAt: tsToString(d.createdAt),
  };
}

/* ── Smart link lookup (for /slug redirects) ── */

export interface SmartLinkPlain {
  id: string;
  uid: string;
  slug: string;
  title: string;
  urlIOS?: string;
  urlAndroid?: string;
  urlDesktop: string;
  isSmart: boolean;
}

export async function getLinkBySlugServer(slug: string): Promise<SmartLinkPlain | null> {
  const q = query(
    collection(db, "links"),
    where("slug", "==", slug),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    uid: data.uid,
    slug: data.slug,
    title: data.title,
    urlIOS: data.urlIOS,
    urlAndroid: data.urlAndroid,
    urlDesktop: data.urlDesktop,
    isSmart: data.isSmart ?? false,
  };
}

/* ── Server-side click logging ── */

function toFieldKey(s: string) {
  return s.replace(/[.$/[\]#]/g, "_");
}

export async function logClickServer(event: {
  linkId: string;
  uid: string;
  device: string;
  country?: string;
  referrer?: string;
}): Promise<void> {
  await addDoc(collection(db, "clicks"), {
    ...event,
    createdAt: serverTimestamp(),
  });

  const today = new Date().toISOString().slice(0, 10);
  const statsRef = doc(db, "links", event.linkId, "stats", today);
  const deviceField =
    event.device === "ios" ? "iosClicks" :
    event.device === "android" ? "androidClicks" :
    "desktopClicks";

  const aggregates: Record<string, unknown> = {
    clicks: increment(1),
    [deviceField]: increment(1),
  };
  if (event.country) {
    aggregates[`countries.${toFieldKey(event.country)}`] = increment(1);
  }
  if (event.referrer) {
    aggregates[`referrers.${toFieldKey(event.referrer)}`] = increment(1);
  }

  await setDoc(statsRef, aggregates, { merge: true });
}
