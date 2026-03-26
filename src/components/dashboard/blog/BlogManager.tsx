"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToBlogPosts, deleteBlogPost } from "@/lib/db/blog-client";
import { BlogEditor } from "./BlogEditor";
import type { BlogPost } from "@/types/blog";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogManager() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToBlogPosts(user.uid, (p) => {
      setPosts(p);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const displayed = posts.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setView("edit");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteBlogPost(id);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved() {
    setView("list");
    setEditingPost(null);
  }

  /* ─────────── Render ─────────── */

  if (view === "create") {
    return (
      <BlogEditor
        post={null}
        onSaved={handleSaved}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        onSaved={handleSaved}
        onCancel={() => { setView("list"); setEditingPost(null); }}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Blog Posts</h1>
          <p className="text-xs text-[#8a8a9a] mt-0.5">
            {posts.filter((p) => p.status === "published").length} published · {posts.filter((p) => p.status === "draft").length} drafts
          </p>
        </div>
        <button
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0f] text-white text-[13px] font-semibold hover:bg-[#1c1c24] transition-colors"
        >
          + New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 bg-[#f5f5f3] rounded-xl p-1 w-fit">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all duration-150 ${
              filter === f
                ? "bg-white text-[#1a1a2e] shadow-sm"
                : "text-[#8a8a9a] hover:text-[#1a1a2e]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-[#8a8a9a] text-sm">
          Loading posts…
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-semibold text-[#1a1a2e] mb-1">No posts yet</p>
          <p className="text-sm text-[#8a8a9a] mb-4">Write your first article!</p>
          <button
            onClick={() => setView("create")}
            className="px-4 py-2 rounded-xl bg-[#0a0a0f] text-white text-[13px] font-semibold hover:bg-[#1c1c24] transition-colors"
          >
            + New Post
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#e8e6e2] bg-white hover:border-[#e8b86d] hover:shadow-[0_2px_12px_rgba(232,184,109,0.15)] transition-all duration-200"
            >
              {/* Cover thumb */}
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#fdf4e3] flex items-center justify-center">
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">✍️</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#1a1a2e] truncate">{post.title}</p>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      post.status === "published"
                        ? "bg-[rgba(34,197,94,0.1)] text-[#16a34a]"
                        : "bg-[rgba(245,158,11,0.1)] text-[#b45309]"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#8a8a9a] mt-0.5 truncate">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#b0afc0]">
                    {post.status === "published"
                      ? `Published ${formatDate(post.publishedAt)}`
                      : `Draft · Updated ${formatDate(post.updatedAt)}`}
                  </span>
                  {post.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] text-[#b8860b] bg-[rgba(232,184,109,0.12)] px-2 py-0.5 rounded-full font-semibold uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {post.status === "published" && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-[#e8e6e2] text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e] transition-colors"
                    title="View post"
                  >
                    🔗
                  </a>
                )}
                <button
                  onClick={() => handleEdit(post)}
                  className="px-3 py-1.5 rounded-lg border border-[#e8e6e2] text-[12px] font-medium text-[#5b5470] hover:bg-[#f0eeea] hover:text-[#1a1a2e] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="px-3 py-1.5 rounded-lg border border-[rgba(239,68,68,0.2)] text-[12px] font-medium text-[#ef4444] hover:bg-[rgba(239,68,68,0.05)] disabled:opacity-50 transition-colors"
                >
                  {deleting === post.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
