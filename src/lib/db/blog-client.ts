/* ------------------------------------------------------------------
   Client-side blog CRUD — dashboard use only.
   Called from client components with Firebase Auth context.
------------------------------------------------------------------ */
"use client";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BlogPost, BlogPostInput } from "@/types/blog";

const COLLECTION = "blogs";

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

/** Estimate reading time from HTML content (~200 wpm) */
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/** Generate a URL-safe slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ensure the slug is unique by appending -2, -3, … if needed */
export async function ensureUniqueSlug(
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const q = query(collection(db, COLLECTION), where("slug", "==", candidate), limit(1));
    const snap = await getDocs(q);
    if (snap.empty || snap.docs[0].id === excludeId) return candidate;
    candidate = `${slug}-${suffix++}`;
  }
}

/* ── Create ── */

export async function createBlogPost(
  authorId: string,
  authorName: string,
  input: BlogPostInput
): Promise<string> {
  const uniqueSlug = await ensureUniqueSlug(input.slug);
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, COLLECTION), {
    authorId,
    authorName,
    title: input.title,
    slug: uniqueSlug,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl ?? null,
    tags: input.tags,
    status: input.status,
    readingTimeMinutes: estimateReadingTime(input.content),
    publishedAt: input.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

/* ── Update ── */

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
  wasAlreadyPublished: boolean
): Promise<void> {
  const updates: Record<string, unknown> = {
    ...input,
    updatedAt: serverTimestamp(),
  };

  if (input.content) {
    updates.readingTimeMinutes = estimateReadingTime(input.content);
  }

  // Set publishedAt only on first publish
  if (input.status === "published" && !wasAlreadyPublished) {
    updates.publishedAt = serverTimestamp();
  }

  if (input.slug) {
    updates.slug = await ensureUniqueSlug(input.slug, id);
  }

  await updateDoc(doc(db, COLLECTION, id), updates);
}

/* ── Delete ── */

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/* ── Real-time list for dashboard ── */

export function subscribeToBlogPosts(
  authorId: string,
  callback: (posts: BlogPost[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const posts: BlogPost[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        authorId: data.authorId ?? authorId,
        authorName: data.authorName ?? "",
        title: data.title ?? "",
        slug: data.slug ?? d.id,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        coverImageUrl: data.coverImageUrl ?? null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status ?? "draft",
        readingTimeMinutes: data.readingTimeMinutes ?? 1,
        publishedAt: tsToString(data.publishedAt),
        createdAt: tsToString(data.createdAt),
        updatedAt: tsToString(data.updatedAt),
      };
    });
    callback(posts);
  });
}
