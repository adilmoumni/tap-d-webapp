"use client";

import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-[rgba(232,184,109,0.2)] shadow-[0_2px_8px_rgba(10,10,15,0.06)] hover:shadow-[0_8px_32px_rgba(10,10,15,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover image */}
      {post.coverImageUrl ? (
        <div className="relative h-52 overflow-hidden bg-[#fdf4e3]">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-52 bg-gradient-to-br from-[#fdf4e3] to-[#ffe7bf] flex items-center justify-center">
          <span className="text-5xl opacity-30">✍️</span>
        </div>
      )}

      <div className="p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(232,184,109,0.15)] text-[#b8860b] uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-[17px] font-bold text-[#1a1625] leading-snug mb-2 group-hover:text-[#b8860b] transition-colors duration-200 line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm text-[#5b5470] leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(232,184,109,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#e8b86d] flex items-center justify-center text-xs font-bold text-[#0a0a0f]">
              {post.authorName?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className="text-xs font-medium text-[#5b5470]">{post.authorName}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#9b91b5]">
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
