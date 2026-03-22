/* ------------------------------------------------------------------
   Firestore CRUD for Bio Pages.
   Collection: biopages/{username}
   Subcollection: biopages/{username}/links/{linkId}
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BioPageData, BioLink, BioSocialLink, BioTheme } from "@/types/bio";
import { DEFAULT_THEME } from "@/types/bio";

/* ================================================================
   READ
   ================================================================ */

export async function getBioPage(username: string): Promise<BioPageData | null> {
  const snap = await getDoc(doc(db, "biopages", username));
  if (!snap.exists()) return null;
  return snap.data() as BioPageData;
}

export async function getBioLinks(username: string): Promise<BioLink[]> {
  const q = query(
    collection(db, "biopages", username, "links"),
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
  username: string,
  data: Partial<BioPageData> = {}
): Promise<void> {
  const now = serverTimestamp();

  const pageData = {
    username,
    displayName: data.displayName ?? username,
    bio: data.bio ?? "",
    avatarUrl: data.avatarUrl ?? null,
    socialLinks: data.socialLinks ?? [],
    theme: { ...DEFAULT_THEME, ...data.theme },
    isPublic: data.isPublic ?? true,
    uid,
    createdAt: now,
    updatedAt: now,
  };

  // Write bio page doc
  await setDoc(doc(db, "biopages", username), pageData);

  // Reserve the username for uniqueness lookups
  await setDoc(doc(db, "usernames", username), { uid });
}

export async function updateBioPage(
  username: string,
  data: Partial<BioPageData>
): Promise<void> {
  await updateDoc(doc(db, "biopages", username), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBioTheme(
  username: string,
  theme: Partial<BioTheme>
): Promise<void> {
  // Use dot notation so we merge into the existing theme object
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(theme)) {
    if (value !== undefined) {
      updates[`theme.${key}`] = value;
    }
  }
  await updateDoc(doc(db, "biopages", username), updates);
}

/* ================================================================
   LINKS CRUD
   ================================================================ */

export async function addBioLink(
  username: string,
  link: Omit<BioLink, "id" | "createdAt" | "clicks">
): Promise<string> {
  const ref = await addDoc(collection(db, "biopages", username, "links"), {
    ...link,
    clicks: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBioLink(
  username: string,
  linkId: string,
  data: Partial<BioLink>
): Promise<void> {
  await updateDoc(doc(db, "biopages", username, "links", linkId), data);
}

export async function deleteBioLink(
  username: string,
  linkId: string
): Promise<void> {
  await deleteDoc(doc(db, "biopages", username, "links", linkId));
}

export async function reorderBioLinks(
  username: string,
  linkIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  linkIds.forEach((id, index) => {
    const ref = doc(db, "biopages", username, "links", id);
    batch.update(ref, { order: index });
  });
  await batch.commit();
}

/* ================================================================
   SOCIAL LINKS
   ================================================================ */

export async function updateSocialLinks(
  username: string,
  socialLinks: BioSocialLink[]
): Promise<void> {
  await updateDoc(doc(db, "biopages", username), {
    socialLinks,
    updatedAt: serverTimestamp(),
  });
}
