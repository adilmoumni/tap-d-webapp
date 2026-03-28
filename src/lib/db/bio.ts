/* ------------------------------------------------------------------
   Firestore CRUD for Bio Pages.
   Collection: biopages/{bioId}
   Subcollection: biopages/{bioId}/links/{linkId}
------------------------------------------------------------------ */

import {
  doc,
  getDoc,
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
  limit,
  startAfter,
  runTransaction,
  deleteField,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BioPageData, BioLink, BioSocialLink, BioTheme, BioPendingTransfer } from "@/types/bio";
import { DEFAULT_THEME } from "@/types/bio";
import { isPublicSlugAvailable, isValidPublicSlug, normalizePublicSlug } from "@/lib/slug";

export type UserBiopageRecord = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  isPublic?: boolean;
  totalViews?: number;
  pendingTransfer?: BioPendingTransfer | null;
  slug?: string;
  uid?: string;
  ownerId?: string;
  createdAt?: unknown;
} & Record<string, unknown>;

export type UserBiopagesPageCursor = QueryDocumentSnapshot<DocumentData> | null;

export type UserBiopagesPageResult = {
  pages: UserBiopageRecord[];
  nextCursor: UserBiopagesPageCursor;
  hasMore: boolean;
};

function asMillis(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    const maybeTs = value as { toMillis?: () => number };
    if (typeof maybeTs.toMillis === "function") return maybeTs.toMillis();
  }
  return 0;
}

function asFiniteNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  return Number.isFinite(value) ? value : 0;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeBioUsername(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9_]/g, "").slice(0, 30);
}

export function isValidBioUsername(username: string): boolean {
  if (username.length < 3 || username.length > 30) return false;
  return /^[a-z0-9_]+$/.test(username);
}

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

export async function getUserBiopages(uid: string): Promise<UserBiopageRecord[]> {
  const ownerQuery = query(
    collection(db, "biopages"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  let snap = await getDocs(ownerQuery);

  // Backward compatibility: some docs may still only have uid.
  if (snap.empty) {
    const legacyQuery = query(collection(db, "biopages"), where("uid", "==", uid));
    snap = await getDocs(legacyQuery);
  }

  const pages = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const slug = typeof data.slug === "string" ? data.slug : "";
    return {
      ...data,
      id: d.id,
      username: slug || d.id,
    } as UserBiopageRecord;
  });

  pages.sort((a, b) => asMillis(b.createdAt) - asMillis(a.createdAt));
  return pages;
}

export async function getUserBiopagesPage(
  uid: string,
  options: {
    pageSize?: number;
    cursor?: UserBiopagesPageCursor;
  } = {}
): Promise<UserBiopagesPageResult> {
  const pageSize = Math.max(1, Math.min(options.pageSize ?? 12, 50));
  const cursor = options.cursor ?? null;

  const ownerBase = [
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc"),
  ];
  const ownerQuery = cursor
    ? query(collection(db, "biopages"), ...ownerBase, startAfter(cursor), limit(pageSize + 1))
    : query(collection(db, "biopages"), ...ownerBase, limit(pageSize + 1));

  const snap = await getDocs(ownerQuery);

  // Backward compatibility: first page may still rely on legacy uid docs.
  if (snap.empty && !cursor) {
    const legacyAll = await getUserBiopages(uid);
    const sliced = legacyAll.slice(0, pageSize);
    return {
      pages: sliced,
      hasMore: legacyAll.length > pageSize,
      nextCursor: null,
    };
  }

  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  const pages = docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const slug = typeof data.slug === "string" ? data.slug : "";
    return {
      ...data,
      id: d.id,
      username: slug || d.id,
    } as UserBiopageRecord;
  });

  return {
    pages,
    hasMore,
    nextCursor: hasMore ? docs[docs.length - 1] ?? null : null,
  };
}

export async function isBioUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeBioUsername(username);
  if (!isValidBioUsername(normalized)) return false;

  const [byIdSnap, slugAvailable] = await Promise.all([
    getDoc(doc(db, "biopages", normalized)),
    isPublicSlugAvailable(normalized),
  ]);

  return !byIdSnap.exists() && slugAvailable;
}

export type PendingBioTransferRecord = {
  bioId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  linkCount: number;
  pendingTransfer: {
    fromUid: string;
    fromEmail: string;
    toEmail: string;
    toUid: string | null;
    status: "pending";
  };
};

async function findUserUidByEmail(email: string): Promise<string | null> {
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch (err) {
    const code = (err as { code?: string } | null)?.code ?? "";
    // Most clients can't query arbitrary users due security rules.
    // Transfer still works by matching recipient email at accept time.
    if (code === "permission-denied" || code === "firestore/permission-denied") {
      return null;
    }
    throw err;
  }
}

export async function requestBioPageTransfer(input: {
  bioId: string;
  ownerUid: string;
  ownerEmail: string;
  recipientEmail: string;
}): Promise<void> {
  const normalizedRecipientEmail = normalizeEmail(input.recipientEmail);
  const normalizedOwnerEmail = normalizeEmail(input.ownerEmail);
  if (!normalizedRecipientEmail) {
    throw new Error("Recipient email is required.");
  }
  if (!normalizedOwnerEmail) {
    throw new Error("Your account email is required.");
  }

  const bioRef = doc(db, "biopages", input.bioId);
  const ownerRef = doc(db, "users", input.ownerUid);
  const recipientUid = await findUserUidByEmail(normalizedRecipientEmail);

  await runTransaction(db, async (tx) => {
    const [bioSnap, ownerSnap] = await Promise.all([
      tx.get(bioRef),
      tx.get(ownerRef),
    ]);

    if (!bioSnap.exists()) {
      throw new Error("Bio page not found.");
    }

    const bioData = bioSnap.data() as Record<string, unknown>;
    const ownerId = String(bioData.ownerId ?? bioData.uid ?? "");
    if (ownerId !== input.ownerUid) {
      throw new Error("You can only transfer your own bio pages.");
    }

    const ownerPlan = String(ownerSnap.data()?.plan ?? "free");
    if (ownerPlan !== "pro") {
      throw new Error("Upgrade to Pro to transfer bio pages.");
    }

    const existingPending = (bioData.pendingTransfer ?? null) as Record<string, unknown> | null;
    if (existingPending && existingPending.status === "pending") {
      throw new Error("This bio page already has a pending transfer.");
    }

    tx.update(bioRef, {
      pendingTransfer: {
        fromUid: input.ownerUid,
        fromEmail: normalizedOwnerEmail,
        toEmail: normalizedRecipientEmail,
        toUid: recipientUid,
        requestedAt: serverTimestamp(),
        status: "pending",
      },
      updatedAt: serverTimestamp(),
    });
  });
}

export async function cancelBioPageTransfer(input: {
  bioId: string;
  ownerUid: string;
}): Promise<void> {
  const bioRef = doc(db, "biopages", input.bioId);

  await runTransaction(db, async (tx) => {
    const bioSnap = await tx.get(bioRef);
    if (!bioSnap.exists()) return;

    const bioData = bioSnap.data() as Record<string, unknown>;
    const ownerId = String(bioData.ownerId ?? bioData.uid ?? "");
    if (ownerId !== input.ownerUid) {
      throw new Error("You can only cancel transfers for your own bio pages.");
    }

    tx.update(bioRef, {
      pendingTransfer: deleteField(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getPendingTransfersForRecipient(email: string): Promise<PendingBioTransferRecord[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const q = query(
    collection(db, "biopages"),
    where("pendingTransfer.toEmail", "==", normalizedEmail),
    where("pendingTransfer.status", "==", "pending")
  );
  const snap = await getDocs(q);

  const transfers = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const linksSnap = await getDocs(collection(db, "biopages", docSnap.id, "links"));
      const pendingTransfer = (data.pendingTransfer ?? {}) as Record<string, unknown>;

      return {
        bioId: docSnap.id,
        username: String(data.slug ?? docSnap.id),
        displayName: String(data.displayName ?? data.slug ?? docSnap.id),
        avatarUrl: typeof data.avatarUrl === "string" && data.avatarUrl ? data.avatarUrl : null,
        linkCount: linksSnap.size,
        pendingTransfer: {
          fromUid: String(pendingTransfer.fromUid ?? ""),
          fromEmail: String(pendingTransfer.fromEmail ?? ""),
          toEmail: String(pendingTransfer.toEmail ?? ""),
          toUid: typeof pendingTransfer.toUid === "string" ? pendingTransfer.toUid : null,
          status: "pending" as const,
        },
      };
    })
  );

  return transfers;
}

export async function acceptBioPageTransfer(input: {
  bioId: string;
  recipientUid: string;
  recipientEmail: string;
}): Promise<void> {
  const normalizedRecipientEmail = normalizeEmail(input.recipientEmail);
  const bioRef = doc(db, "biopages", input.bioId);

  await runTransaction(db, async (tx) => {
    const bioSnap = await tx.get(bioRef);
    if (!bioSnap.exists()) {
      throw new Error("Transfer no longer exists.");
    }

    const data = bioSnap.data() as Record<string, unknown>;
    const pendingTransfer = (data.pendingTransfer ?? null) as Record<string, unknown> | null;
    if (!pendingTransfer || pendingTransfer.status !== "pending") {
      throw new Error("Transfer no longer exists.");
    }

    const toEmail = normalizeEmail(String(pendingTransfer.toEmail ?? ""));
    if (toEmail !== normalizedRecipientEmail) {
      throw new Error("This transfer is not addressed to your account.");
    }

    const username = normalizePublicSlug(String(data.slug ?? input.bioId));
    const usernameRef = doc(db, "usernames", username);

    tx.update(bioRef, {
      ownerId: input.recipientUid,
      uid: input.recipientUid,
      pendingTransfer: deleteField(),
      updatedAt: serverTimestamp(),
    });

    tx.set(
      usernameRef,
      {
        uid: input.recipientUid,
        bioId: input.bioId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

export async function declineBioPageTransfer(input: {
  bioId: string;
  recipientEmail: string;
}): Promise<void> {
  const normalizedRecipientEmail = normalizeEmail(input.recipientEmail);
  const bioRef = doc(db, "biopages", input.bioId);

  await runTransaction(db, async (tx) => {
    const bioSnap = await tx.get(bioRef);
    if (!bioSnap.exists()) return;

    const data = bioSnap.data() as Record<string, unknown>;
    const pendingTransfer = (data.pendingTransfer ?? null) as Record<string, unknown> | null;
    if (!pendingTransfer || pendingTransfer.status !== "pending") return;

    const toEmail = normalizeEmail(String(pendingTransfer.toEmail ?? ""));
    if (toEmail !== normalizedRecipientEmail) {
      throw new Error("This transfer is not addressed to your account.");
    }

    tx.update(bioRef, {
      pendingTransfer: deleteField(),
      updatedAt: serverTimestamp(),
    });
  });
}

interface CreateAdditionalBioPageInput {
  uid: string;
  username: string;
  displayName: string;
  bio?: string;
}

export async function createAdditionalBioPage(input: CreateAdditionalBioPageInput): Promise<string> {
  const username = normalizeBioUsername(input.username);
  if (!isValidBioUsername(username)) {
    throw new Error("Username must be 3-30 chars and contain only lowercase letters, numbers, and underscores.");
  }

  const available = await isBioUsernameAvailable(username);
  if (!available) {
    throw new Error("This username is already taken. Try another.");
  }

  const biopageRef = doc(db, "biopages", username);
  const usernameRef = doc(db, "usernames", username);
  const linkRef = doc(db, "links", username);
  const now = serverTimestamp();

  await runTransaction(db, async (tx) => {
    const [biopageSnap, usernameSnap, linkSnap] = await Promise.all([
      tx.get(biopageRef),
      tx.get(usernameRef),
      tx.get(linkRef),
    ]);

    if (biopageSnap.exists() || usernameSnap.exists() || linkSnap.exists()) {
      throw new Error("This username is already taken. Try another.");
    }

    tx.set(biopageRef, {
      uid: input.uid,
      ownerId: input.uid,
      slug: username,
      displayName: input.displayName.trim(),
      bio: (input.bio ?? "").trim(),
      avatarUrl: "",
      theme: {
        ...DEFAULT_THEME,
        accentColor: "#22d3ee",
        backgroundColor: "#0f0f12",
      },
      socialLinks: [],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    });

    tx.set(usernameRef, {
      uid: input.uid,
      bioId: username,
      createdAt: now,
    });
  });

  return username;
}

export async function getBioPageTotalViews(bioId: string, fallback = 0): Promise<number> {
  const statsSnap = await getDocs(collection(db, "biopages", bioId, "stats"));
  if (statsSnap.empty) return fallback;

  return statsSnap.docs.reduce((sum, statDoc) => {
    const data = statDoc.data();
    return sum + asFiniteNumber(data.totalViews);
  }, 0);
}

export async function deleteBioPageById(bioId: string, username?: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, "biopages", bioId));

  if (username) {
    const normalized = normalizePublicSlug(username);
    if (normalized) {
      batch.delete(doc(db, "usernames", normalized));
    }
  }

  await batch.commit();
}

export async function setUserActiveBio(
  uid: string,
  activeBioId: string | null,
  username: string | null
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    activeBioId,
    username,
    updatedAt: serverTimestamp(),
  });
}

export async function getLinkBySlug(slug: string): Promise<Record<string, unknown> | null> {
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
  const normalizedSlug = normalizePublicSlug(slug);
  if (!isValidPublicSlug(normalizedSlug)) {
    throw new Error("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
  }

  const available = await isPublicSlugAvailable(normalizedSlug);
  if (!available) {
    throw new Error("This slug is already taken.");
  }

  const now = serverTimestamp();

  const pageData = {
    slug: normalizedSlug,
    uid,
    ownerId: uid,
    displayName: data.displayName ?? normalizedSlug,
    bio: data.bio ?? "",
    avatarUrl: data.avatarUrl ?? null,
    socialLinks: data.socialLinks ?? [],
    theme: { ...DEFAULT_THEME, ...data.theme },
    isPublic: data.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const ref = doc(collection(db, "biopages"));
  const usernameRef = doc(db, "usernames", normalizedSlug);
  const linkRef = doc(db, "links", normalizedSlug);

  await runTransaction(db, async (tx) => {
    const [usernameSnap, linkSnap] = await Promise.all([tx.get(usernameRef), tx.get(linkRef)]);
    if (usernameSnap.exists() || linkSnap.exists()) {
      throw new Error("This slug is already taken.");
    }

    tx.set(ref, pageData);
    tx.set(usernameRef, { uid, bioId: ref.id });
  });

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
  const newNormalized = normalizePublicSlug(newSlug);
  if (!isValidPublicSlug(newNormalized)) {
    throw new Error("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
  }

  const available = await isPublicSlugAvailable(newNormalized, { excludeUid: uid, excludeBioId: bioId });
  if (!available) {
    throw new Error("This slug is already taken.");
  }

  const bioRef = doc(db, "biopages", bioId);
  const userRef = doc(db, "users", uid);
  const newUsernameRef = doc(db, "usernames", newNormalized);
  const oldNormalized = normalizePublicSlug(oldSlug);
  const oldUsernameRef = oldNormalized ? doc(db, "usernames", oldNormalized) : null;
  const linkRef = doc(db, "links", newNormalized);

  await runTransaction(db, async (tx) => {
    const [newUsernameSnap, linkSnap] = await Promise.all([tx.get(newUsernameRef), tx.get(linkRef)]);

    if (linkSnap.exists()) {
      throw new Error("This slug is already taken.");
    }

    if (newUsernameSnap.exists()) {
      const existingUid = newUsernameSnap.data()?.uid as string | undefined;
      if (existingUid !== uid) {
        throw new Error("This slug is already taken.");
      }
    }

    tx.update(bioRef, {
      slug: newNormalized,
      updatedAt: serverTimestamp(),
    });

    tx.update(userRef, {
      username: newNormalized,
      updatedAt: serverTimestamp(),
    });

    tx.set(newUsernameRef, { uid, bioId });

    if (oldUsernameRef && oldNormalized !== newNormalized) {
      tx.delete(oldUsernameRef);
    }
  });
}
