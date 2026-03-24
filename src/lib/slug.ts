import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RESERVED_SLUGS = new Set([
  "api",
  "bio",
  "claim-username",
  "d",
  "dashboard",
  "links",
  "login",
  "pricing",
  "settings",
  "signup",
  "_next",
]);

const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function normalizePublicSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "").slice(0, 30);
}

export function isValidPublicSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 30) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return /^[a-z0-9][a-z0-9_.-]*$/.test(slug);
}

function randomSuffix(length = 5): string {
  return Array.from({ length }, () => RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]).join("");
}

export async function isPublicSlugAvailable(
  slug: string,
  opts?: { excludeUid?: string; excludeBioId?: string }
): Promise<boolean> {
  const normalized = normalizePublicSlug(slug);
  if (!isValidPublicSlug(normalized)) return false;

  const [usernameSnap, linkSnap, bioSnap] = await Promise.all([
    getDoc(doc(db, "usernames", normalized)),
    getDoc(doc(db, "links", normalized)),
    getDocs(query(collection(db, "biopages"), where("slug", "==", normalized), limit(1))),
  ]);

  if (linkSnap.exists()) return false;

  if (usernameSnap.exists()) {
    const reservedUid = usernameSnap.data()?.uid as string | undefined;
    if (!opts?.excludeUid || reservedUid !== opts.excludeUid) return false;
  }

  if (!bioSnap.empty) {
    const existingBioId = bioSnap.docs[0].id;
    if (!opts?.excludeBioId || existingBioId !== opts.excludeBioId) return false;
  }

  return true;
}

export async function generateUniquePublicSlug(seed?: string): Promise<string> {
  const baseSeed = normalizePublicSlug(seed ?? "user");
  const base = isValidPublicSlug(baseSeed) ? baseSeed : "user";

  if (await isPublicSlugAvailable(base)) return base;

  for (let i = 0; i < 100; i++) {
    const suffix = randomSuffix(5);
    const candidate = `${base}-${suffix}`.slice(0, 30);
    if (isValidPublicSlug(candidate) && (await isPublicSlugAvailable(candidate))) {
      return candidate;
    }
  }

  throw new Error("Could not generate an available slug. Please try again.");
}
