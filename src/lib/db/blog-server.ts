/* ------------------------------------------------------------------
   Server-side blog queries.
   Uses the client Firebase SDK (same pattern as bio-server.ts).
   Serializes Firestore Timestamps to ISO strings before returning.
------------------------------------------------------------------ */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getCountFromServer,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BlogPost, BlogPostSummary, PaginatedBlogPosts } from "@/types/blog";

const COLLECTION = "blogs";
const PER_PAGE = 10;

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

function docToPost(d: QueryDocumentSnapshot<DocumentData>): BlogPost {
  const data = d.data();
  return {
    id: d.id,
    authorId: data.authorId ?? "",
    authorName: data.authorName ?? "tap-d",
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
}

function postToSummary(post: BlogPost): BlogPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    tags: post.tags,
    readingTimeMinutes: post.readingTimeMinutes,
    authorName: post.authorName,
    publishedAt: post.publishedAt,
  };
}

/* ── Public: paginated list ── */

export async function getPublishedBlogPosts(
  page = 1
): Promise<PaginatedBlogPosts> {
  const currentPage = Math.max(1, page);

  // Count query — only needs the where clause (no orderBy needed for count)
  let total = 0;
  try {
    const countSnap = await getCountFromServer(
      query(collection(db, COLLECTION), where("status", "==", "published"))
    );
    total = countSnap.data().count;
  } catch (err) {
    console.error("[blog-server] count query failed:", err);
  }

  // Main paginated query — requires composite index: status ASC + publishedAt DESC
  let snap;
  try {
    if (currentPage === 1) {
      snap = await getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(PER_PAGE)
        )
      );
    } else {
      // Fetch cursor: last doc of the previous page
      const cursorSnap = await getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit((currentPage - 1) * PER_PAGE)
        )
      );
      const lastDoc = cursorSnap.docs[cursorSnap.docs.length - 1];
      if (!lastDoc) {
        return {
          posts: [],
          total,
          page: currentPage,
          perPage: PER_PAGE,
          hasNextPage: false,
          hasPreviousPage: currentPage > 1,
        };
      }
      snap = await getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          startAfter(lastDoc),
          limit(PER_PAGE)
        )
      );
    }
  } catch (err) {
    console.error("[blog-server] paginated query failed:", err);
    // Fallback: fetch without ordering (index may still be building)
    try {
      const fallbackSnap = await getDocs(
        query(
          collection(db, COLLECTION),
          where("status", "==", "published"),
          limit(PER_PAGE)
        )
      );
      const posts = fallbackSnap.docs.map((d) => postToSummary(docToPost(d)));
      total = total || posts.length;
      return {
        posts,
        total,
        page: 1,
        perPage: PER_PAGE,
        hasNextPage: total > PER_PAGE,
        hasPreviousPage: false,
      };
    } catch (fallbackErr) {
      console.error("[blog-server] fallback query also failed:", fallbackErr);
      return { posts: [], total: 0, page: 1, perPage: PER_PAGE, hasNextPage: false, hasPreviousPage: false };
    }
  }

  const posts = snap.docs.map((d) => postToSummary(docToPost(d)));

  return {
    posts,
    total,
    page: currentPage,
    perPage: PER_PAGE,
    hasNextPage: currentPage * PER_PAGE < total,
    hasPreviousPage: currentPage > 1,
  };
}

/* ── Public: single post by slug ── */

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try with status filter first
  try {
    const q = query(
      collection(db, COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return docToPost(snap.docs[0]);
  } catch (err) {
    console.error("[blog-server] getBlogPostBySlug failed:", err);
  }
  return null;
}

/* ── Static generation: all published slugs ── */

export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => String(d.data().slug ?? d.id).trim())
      .filter(Boolean);
  } catch (err) {
    console.error("[blog-server] failed to fetch slugs:", err);
    return [];
  }
}
