"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createBlogPost,
  updateBlogPost,
  generateSlug,
  ensureUniqueSlug,
} from "@/lib/db/blog-client";
import type { BlogPost, BlogPostInput } from "@/types/blog";

interface BlogEditorProps {
  post?: BlogPost | null; // null/undefined = create mode
  onSaved: () => void;
  onCancel: () => void;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogEditor({ post, onSaved, onCancel }: BlogEditorProps) {
  const { user } = useAuth();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [tagsInput, setTagsInput] = useState(post?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManuallyEdited]);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const wordCount = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  async function handleSave(publishStatus: "draft" | "published") {
    if (!user) return;
    if (!title.trim()) { setError("Title is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }
    if (!excerpt.trim()) { setError("Excerpt is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }

    setSaving(true);
    setError("");

    const input: BlogPostInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      tags,
      status: publishStatus,
    };

    try {
      if (isEdit && post) {
        await updateBlogPost(post.id, input, post.status === "published");
      } else {
        await createBlogPost(user.uid, user.displayName ?? "tap-d", input);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const labelClass = "block text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider mb-1.5";
  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[#e8e6e2] bg-white text-[14px] text-[#1a1a2e] placeholder:text-[#c0bec8] focus:outline-none focus:ring-2 focus:ring-[rgba(232,184,109,0.5)] focus:border-[#e8b86d] transition-all duration-150";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            {isEdit ? "Edit Post" : "New Post"}
          </h2>
          <p className="text-xs text-[#8a8a9a] mt-0.5">
            {wordCount} words · ~{estimateReadingTime(content)} min read
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-4 py-1.5 rounded-lg border border-[#e8e6e2] text-[13px] font-medium text-[#5b5470] hover:bg-[#f0eeea] transition-colors"
          >
            {preview ? "✏️ Edit" : "👁️ Preview"}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg border border-[#e8e6e2] text-[13px] font-medium text-[#5b5470] hover:bg-[#f0eeea] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {preview ? (
        /* ─ Preview mode ─ */
        <div className="bg-[#fafaf8] rounded-xl border border-[#e8e6e2] p-8 min-h-[400px]">
          {coverImageUrl && (
            <img src={coverImageUrl} alt="" className="w-full h-52 object-cover rounded-xl mb-6" />
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((t) => (
                <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(232,184,109,0.15)] text-[#b8860b] uppercase tracking-wide">{t}</span>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-3">{title || "Untitled"}</h1>
          <p className="text-base text-[#5b5470] mb-6">{excerpt}</p>
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        /* ─ Edit mode ─ */
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome post"
              className={inputClass}
              style={{ fontSize: 18, fontWeight: 600 }}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <div className="flex items-center gap-0 rounded-lg border border-[#e8e6e2] bg-white focus-within:ring-2 focus-within:ring-[rgba(232,184,109,0.5)] focus-within:border-[#e8b86d] overflow-hidden transition-all duration-150">
              <span className="px-3 py-2.5 text-[13px] text-[#9b91b5] bg-[#f5f5f3] border-r border-[#e8e6e2] whitespace-nowrap">
                tap-d.link/blog/
              </span>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); setSlugManuallyEdited(true); }}
                placeholder="my-awesome-post"
                className="flex-1 px-3 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelClass}>Excerpt * <span className="normal-case font-normal text-[#c0bec8]">(shown in cards & meta description)</span></label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of what this post is about..."
              rows={2}
              maxLength={300}
              className={`${inputClass} resize-none`}
            />
            <p className="text-[11px] text-[#c0bec8] mt-1 text-right">{excerpt.length}/300</p>
          </div>

          {/* Content */}
          <div>
            <label className={labelClass}>Content * <span className="normal-case font-normal text-[#c0bec8]">(HTML supported)</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Write your article here...</p>"
              rows={18}
              className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className={labelClass}>Cover Image URL <span className="normal-case font-normal text-[#c0bec8]">(optional)</span></label>
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {coverImageUrl && (
              <img src={coverImageUrl} alt="cover preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-[#e8e6e2]" />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags <span className="normal-case font-normal text-[#c0bec8]">(comma-separated)</span></label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tech, tutorial, tips"
              className={inputClass}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(232,184,109,0.15)] text-[#b8860b] uppercase tracking-wide">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>
      )}

      {/* Save buttons */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#e8e6e2]">
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#0a0a0f] text-white text-[13px] font-semibold hover:bg-[#1c1c24] disabled:opacity-50 transition-colors duration-150"
        >
          {saving ? "Saving…" : "🚀 Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-[#e8e6e2] text-[13px] font-medium text-[#5b5470] hover:bg-[#f0eeea] disabled:opacity-50 transition-colors duration-150"
        >
          {saving ? "Saving…" : "💾 Save draft"}
        </button>
      </div>
    </div>
  );
}
