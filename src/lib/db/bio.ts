/* ------------------------------------------------------------------
   Firestore CRUD for Bio Pages.
   Collection: biopages/{bioId}
   Subcollection: biopages/{bioId}/links/{linkId}
------------------------------------------------------------------ */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  where,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BioPageData, BioLink, BioSocialLink, BioTheme } from "@/types/bio";
import { DEFAULT_THEME } from "@/types/bio";

/* ================================================================
   READ
   ================================================================ */

export async function getBioPage(bioId: string): Promise<BioPageData | null> {
  const snap = await getDoc(doc(db, "biopages", bioId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as BioPageData;
}

export async function getBioPageBySlug(slug: string): Promise<(BioPageData & { id: string }) | null> {
  const q = query(collection(db, "biopages"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BioPageData & { id: string };
}

export async function getLinkBySlug(slug: string): Promise<any | null> {
  const snap = await getDoc(doc(db, "links", slug));
  if (!snap.exists()) return null;

  const data = snap.data();
  if (data.isActive === false) return null;

  return {
    id: snap.id,
    ...data,
  };
}

export async function getBioLinks(bioId: string): Promise<BioLink[]> {
  const q = query(
    collection(db, "biopages", bioId, "links"),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BioLink);
}

/* ================================================================
   WRITE — Bio Page
   ================================================================ */

export async function createBioPage(
  uid: string,
  slug: string,
  data: Partial<BioPageData> = {}
): Promise<string> {
  const now = serverTimestamp();

  const pageData = {
    slug,
    ownerId: uid,
    displayName: data.displayName ?? slug,
    bio: data.bio ?? "",
    avatarUrl: data.avatarUrl ?? null,
    socialLinks: data.socialLinks ?? [],
    theme: { ...DEFAULT_THEME, ...data.theme },
    isPublic: data.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  };

  // Write bio page doc
  const ref = await addDoc(collection(db, "biopages"), pageData);

  // Reserve the username for uniqueness lookups
  await setDoc(doc(db, "usernames", slug), { uid, bioId: ref.id });

  return ref.id;
}

export async function updateBioPage(
  bioId: string,
  data: Partial<BioPageData>
): Promise<void> {
  await updateDoc(doc(db, "biopages", bioId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBioTheme(
  bioId: string,
  theme: Partial<BioTheme>
): Promise<void> {
  // Use dot notation so we merge into the existing theme object
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(theme)) {
    if (value !== undefined) {
      updates[`theme.${key}`] = value;
    }
  }
  await updateDoc(doc(db, "biopages", bioId), updates);
}

/* ================================================================
   LINKS CRUD
   ================================================================ */

export async function addBioLink(
  bioId: string,
  link: Omit<BioLink, "id" | "createdAt" | "clicks">
): Promise<string> {
  const ref = await addDoc(collection(db, "biopages", bioId, "links"), {
    ...link,
    clicks: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBioLink(
  bioId: string,
  linkId: string,
  data: Partial<BioLink>
): Promise<void> {
  await updateDoc(doc(db, "biopages", bioId, "links", linkId), data);
}

export async function deleteBioLink(
  bioId: string,
  linkId: string
): Promise<void> {
  await deleteDoc(doc(db, "biopages", bioId, "links", linkId));
}

export async function reorderBioLinks(
  bioId: string,
  linkIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  linkIds.forEach((id, index) => {
    const ref = doc(db, "biopages", bioId, "links", id);
    batch.update(ref, { order: index });
  });
  await batch.commit();
}

/* ================================================================
   SOCIAL LINKS
   ================================================================ */

export async function updateSocialLinks(
  bioId: string,
  socialLinks: BioSocialLink[]
): Promise<void> {
  await updateDoc(doc(db, "biopages", bioId), {
    socialLinks,
    updatedAt: serverTimestamp(),
  });
}

/* ================================================================
   MIGRATION / USERNAME UPDATE
   ================================================================ */

export async function changeUsername(
  uid: string,
  bioId: string,
  oldSlug: string,
  newSlug: string
): Promise<void> {
  const newNormalized = newSlug.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  
  // 1. Check availability
  const usernameDoc = await getDoc(doc(db, "usernames", newNormalized));
  if (usernameDoc.exists()) {
    throw new Error(`@${newNormalized} is already taken.`);
  }

  const q = query(collection(db, "biopages"), where("slug", "==", newNormalized), limit(1));
  const bioSnap = await getDocs(q);
  if (!bioSnap.empty) {
    throw new Error(`@${newNormalized} is already taken.`);
  }

  const batch = writeBatch(db);

  // 2. Update slug in biopage
  batch.update(doc(db, "biopages", bioId), {
    slug: newNormalized,
    updatedAt: serverTimestamp(),
  });

  // 3. Update users document
  batch.update(doc(db, "users", uid), {
    username: newNormalized,
    updatedAt: serverTimestamp(),
  });

  // 4. Reserve new username, delete old username
  batch.set(doc(db, "usernames", newNormalized), { uid, bioId });
  if (oldSlug) {
    batch.delete(doc(db, "usernames", oldSlug));
  }

  // Commit transaction
  await batch.commit();
}
