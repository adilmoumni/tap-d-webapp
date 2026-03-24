/* ------------------------------------------------------------------
   Firestore helpers — all DB operations live here.
   Components/hooks call these, never Firestore methods directly.
------------------------------------------------------------------ */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SmartLink, BioPage, ClickEvent, DailyStats } from "@/types";

/* ================================================================
   Smart Links
   ================================================================ */

/** Remove keys with undefined values — Firestore rejects them */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createLink(
  uid: string,
  data: Omit<SmartLink, "id" | "uid" | "clicks" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "links"), {
    ...stripUndefined(data),
    uid,
    clicks: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLink(
  linkId: string,
  data: Partial<Omit<SmartLink, "id" | "uid" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "links", linkId), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLink(linkId: string): Promise<void> {
  await deleteDoc(doc(db, "links", linkId));
}

/** Fetch all active links for a user — used by the public bio page (server-side) */
export async function getActiveLinksForUser(uid: string): Promise<SmartLink[]> {
  const q = query(
    collection(db, "links"),
    where("uid", "==", uid),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SmartLink);
}

export async function getLinkBySlug(slug: string): Promise<SmartLink | null> {
  const q = query(collection(db, "links"), where("slug", "==", slug), where("isActive", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as SmartLink;
}

export async function getLinkById(linkId: string): Promise<SmartLink | null> {
  const snap = await getDoc(doc(db, "links", linkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SmartLink;
}

export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db, "links"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return true;
  if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) return true;
  return false;
}

/** Subscribe to all links for a user, ordered by createdAt desc.
 *  Falls back to client-side sort while the composite index is building. */
export function subscribeToUserLinks(
  uid: string,
  callback: (links: SmartLink[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "links"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SmartLink));
    },
    () => {
      // Index not yet ready — fall back to unordered query + client sort
      const fallbackQ = query(collection(db, "links"), where("uid", "==", uid));
      onSnapshot(fallbackQ, (snap) => {
        const links = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as SmartLink)
          .sort((a, b) => {
            const aTime = a.createdAt && (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : 0;
            const bTime = b.createdAt && (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : 0;
            return bTime - aTime;
          });
        callback(links);
      });
    }
  );
}

/* ================================================================
   Bio Pages
   ================================================================ */

export async function getBioByUsername(username: string): Promise<BioPage | null> {
  const q = query(collection(db, "biopages"), where("slug", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BioPage;
}

export async function getUserBioPage(uid: string): Promise<BioPage | null> {
  const q = query(collection(db, "biopages"), where("ownerId", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BioPage;
}

export async function upsertBioPage(
  uid: string,
  data: Partial<Omit<BioPage, "id" | "ownerId" | "createdAt">>
): Promise<void> {
  const existing = await getUserBioPage(uid);
  if (existing) {
    await updateDoc(doc(db, "biopages", existing.id), {
      ...stripUndefined(data),
      updatedAt: serverTimestamp(),
    });
  } else {
    throw new Error("Cannot update a bio page that does not exist. Claim a link first.");
  }
}

export function subscribeToUserBio(
  uid: string,
  callback: (bio: BioPage | null) => void
): Unsubscribe {
  const q = query(collection(db, "biopages"), where("ownerId", "==", uid));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
    } else {
      const d = snap.docs[0];
      callback({ id: d.id, ...d.data() } as BioPage);
    }
  });
}

/* ================================================================
   Analytics / Click Events
   ================================================================ */

/** Sanitise a string for use as a Firestore field key (no dots). */
function toFieldKey(s: string): string {
  return s.replace(/\./g, "_").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "unknown";
}

export async function logClick(event: Omit<ClickEvent, "id" | "createdAt">): Promise<void> {
  // Write raw click event
  await addDoc(collection(db, "clicks"), {
    ...event,
    createdAt: serverTimestamp(),
  });

  // Write daily aggregate (atomic increments — no read needed)
  const today = new Date().toISOString().slice(0, 10);
  const statsRef = doc(db, "links", event.linkId, "stats", today);
  const deviceField =
    event.device === "ios"     ? "iosClicks" :
    event.device === "android" ? "androidClicks" :
                                  "desktopClicks";

  const aggregates: Record<string, ReturnType<typeof increment>> = {
    clicks:      increment(1),
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

export async function getLinkClicks(linkId: string): Promise<ClickEvent[]> {
  const q = query(
    collection(db, "clicks"),
    where("linkId", "==", linkId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClickEvent);
}

/** Fetch daily stats for a link for the last `days` days (newest last). */
export async function getLinkDailyStats(linkId: string, days = 30): Promise<DailyStats[]> {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const refs = dates.map((date) => doc(db, "links", linkId, "stats", date));
  const snaps = await Promise.all(refs.map((r) => getDoc(r)));

  return snaps.map((snap, i) => {
    const data = snap.data() ?? {};
    return {
      date:           dates[i],
      clicks:         (data.clicks         as number) ?? 0,
      iosClicks:      (data.iosClicks      as number) ?? 0,
      androidClicks:  (data.androidClicks  as number) ?? 0,
      desktopClicks:  (data.desktopClicks  as number) ?? 0,
      countries:      (data.countries      as Record<string, number>) ?? {},
      referrers:      (data.referrers      as Record<string, number>) ?? {},
    };
  });
}
