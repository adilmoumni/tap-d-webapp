import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllPublishedBlogSlugs } from "@/lib/db/blog-server";
import { BlogContent } from "@/components/blog/BlogContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = `${post.title} | tap-d.link Blog`;
  const description = post.excerpt || `Read "${post.title}" on the tap-d.link blog.`;
  const url = `https://tap-d.link/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: post.authorName }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "tap-d.link",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      authors: [post.authorName],
      tags: post.tags,
      ...(post.coverImageUrl
        ? {
            images: [
              {
                url: post.coverImageUrl,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `https://tap-d.link/blog/${post.slug}`,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt ?? undefined,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "tap-d.link",
      url: "https://tap-d.link",
      logo: { "@type": "ImageObject", url: "https://tap-d.link/og-image.png" },
    },
    ...(post.coverImageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: post.coverImageUrl,
            width: 1200,
            height: 630,
          },
        }
      : {}),
    keywords: post.tags.join(", "),
    wordCount: post.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-[#fffdf8] to-[#fff7ed]">
        {/* Back nav */}
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#9b91b5] hover:text-[#1a1625] transition-colors duration-200"
          >
            ← All posts
          </Link>
        </div>

        {/* Article header */}
        <header className="max-w-3xl mx-auto px-4 pt-8 pb-10">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[rgba(232,184,109,0.15)] text-[#b8860b] uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1625] leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-[#5b5470] leading-relaxed mb-6">{post.excerpt}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 py-4 border-t border-b border-[rgba(232,184,109,0.2)]">
            <div className="w-9 h-9 rounded-full bg-[#e8b86d] flex items-center justify-center text-sm font-bold text-[#0a0a0f] flex-shrink-0">
              {post.authorName?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1625]">{post.authorName}</p>
              <p className="text-xs text-[#9b91b5]">
                {formatDate(post.publishedAt)} · {post.readingTimeMinutes} min read
              </p>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="max-w-4xl mx-auto px-4 mb-10">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(10,10,15,0.12)]">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full object-cover max-h-[480px]"
              />
            </div>
          </div>
        )}

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 pb-20">
          <BlogContent html={post.content} />
        </article>

        {/* Footer nav */}
        <div className="max-w-3xl mx-auto px-4 pb-16 border-t border-[rgba(232,184,109,0.2)] pt-10 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(232,184,109,0.4)] text-[13px] font-semibold text-[#1a1625] hover:bg-[rgba(232,184,109,0.1)] transition-colors duration-200"
          >
            ← All posts
          </Link>
          <Link
            href="/"
            className="text-sm text-[#9b91b5] hover:text-[#1a1625] transition-colors duration-200"
          >
            tap-d.link →
          </Link>
        </div>
      </main>
    </>
  );
}
