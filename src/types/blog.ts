/* ------------------------------------------------------------------
   Blog post types — shared between client and server code.
------------------------------------------------------------------ */

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML string
  coverImageUrl?: string | null;
  tags: string[];
  status: BlogStatus;
  readingTimeMinutes: number;
  publishedAt: string | null; // ISO string
  createdAt: string | null;   // ISO string
  updatedAt: string | null;   // ISO string
}

/** Minimal shape returned for card lists */
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  tags: string[];
  readingTimeMinutes: number;
  authorName: string;
  publishedAt: string | null;
}

/** Payload used when creating/updating a post */
export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  tags: string[];
  status: BlogStatus;
}

/** Pagination result wrapper */
export interface PaginatedBlogPosts {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
