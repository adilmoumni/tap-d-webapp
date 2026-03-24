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
  limit,
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
  isActive: boolean;
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
  id: string;
  ownerId: string;
  slug: string;
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

export async function getBioPageServer(slug: string): Promise<BioPagePlain | null> {
  const q = query(collection(db, "biopages"), where("slug", "==", slug), limit(1));
  let snap = await getDocs(q);
  let parentCollection = "biopages";
  
  if (snap.empty) {
    // Fallback: check legacy 'username' field in case it wasn't migrated
    const legacyQ = query(collection(db, "biopages"), where("username", "==", slug), limit(1));
    snap = await getDocs(legacyQ);
  }

  if (snap.empty) {
    // Second Fallback: check the legacy 'bio_pages' collection
    const veryLegacyQ = query(collection(db, "bio_pages"), where("username", "==", slug), limit(1));
    snap = await getDocs(veryLegacyQ);
    if (!snap.empty) {
      parentCollection = "bio_pages";
    }
  }

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  const d = docSnap.data();
  const bioId = docSnap.id;

  const linksSnap = await getDocs(
    query(
      collection(db, parentCollection, bioId, "links"),
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
      isActive: l.isActive ?? true,
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
    id: bioId,
    ownerId: d.ownerId,
    slug: d.slug ?? slug,
    displayName: d.displayName ?? d.slug ?? slug,
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
  thumbnailUrl?: string | null;
}

export async function getLinkBySlugServer(slug: string): Promise<SmartLinkPlain | null> {
  // Links are stored with slug as the document ID in the "links" collection
  const snap = await getDoc(doc(db, "links", slug));
  if (!snap.exists()) return null;

  const data = snap.data();

  // Respect the isActive flag (not "active")
  if (data.isActive === false) return null;

  return {
    id: snap.id,
    uid: data.uid ?? "",
    slug: data.slug ?? slug,
    title: data.title ?? "",
    urlIOS: data.iosUrl ?? data.urlIOS,
    urlAndroid: data.androidUrl ?? data.urlAndroid,
    urlDesktop: data.fallbackUrl ?? data.urlDesktop ?? data.url ?? "",
    isSmart: data.isSmart ?? false,
    thumbnailUrl: data.thumbnailUrl ?? null,
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

/* ── Static generation helpers ── */

export async function getAllPublicUsernames(): Promise<string[]> {
  try {
    const q = query(collection(db, "biopages"), where("isPublic", "==", true));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => String(d.data().slug || d.id || ""))
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    console.error("Error fetching usernames for static generation:", err);
    return [];
  }
}

export async function getAllPublicLinks(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "links"));
    return snap.docs
      .filter((d) => d.data()?.isActive !== false)
      .map((d) => {
      const data = d.data();
      return String(data.slug || d.id || "").trim();
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Error fetching links for static generation:", err);
    return [];
  }
}
