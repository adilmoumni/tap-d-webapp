import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/db/blog-server";
import { BlogList } from "@/components/blog/BlogList";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog | tap-d.link — Tips, Tutorials & Stories",
  description: "Explore technical guides, product updates, creator tips, and random thoughts from the tap-d.link team.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    title: "Blog | tap-d.link — Tips, Tutorials & Stories",
    description: "Explore technical guides, product updates, creator tips, and random thoughts from the tap-d.link team.",
    url: "https://tap-d.link/blog",
    siteName: "tap-d.link",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | tap-d.link — Tips, Tutorials & Stories",
    description: "Explore technical guides, product updates, creator tips, and random thoughts from the tap-d.link team.",
  },
};

export default async function BlogListPage() {
  // Pre-render the first page of posts for SEO
  let initialResult;
  try {
    initialResult = await getPublishedBlogPosts(1);
  } catch (err) {
    console.error("[blog-page] static fetch failed:", err);
    initialResult = { posts: [], total: 0, page: 1, perPage: 10, hasNextPage: false, hasPreviousPage: false };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "tap-d.link Blog",
    url: "https://tap-d.link/blog",
    description: "Tips, tutorials, and stories from tap-d.link",
    publisher: {
      "@type": "Organization",
      name: "tap-d.link",
      url: "https://tap-d.link",
    },
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
        {/* Header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(232,184,109,0.2),transparent)]" />
          <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(232,184,109,0.15)] border border-[rgba(232,184,109,0.3)] text-[#b8860b] text-xs font-semibold uppercase tracking-widest mb-6">
              ✍️ &nbsp;Blog
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1625] leading-tight mb-4">
              Ideas, Guides &{" "}
              <span className="relative">
                <span className="relative z-10">Stories</span>
                <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-[rgba(232,184,109,0.35)] -skew-x-3 z-0" />
              </span>
            </h1>
            <p className="text-lg text-[#5b5470] max-w-2xl mx-auto leading-relaxed">
              Technical deep-dives, creator tips, product updates, and random thoughts
              — straight from the tap-d.link team.
            </p>
          </div>
        </header>

        {/* Content */}
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-[#e8b86d]/10 animate-pulse" />
                ))}
              </div>
            }
          >
            <BlogList initialData={initialResult} />
          </Suspense>
        </section>

        {/* Back to home nav */}
        <div className="text-center pb-12">
          <Link
            href="/"
            className="text-sm text-[#9b91b5] hover:text-[#1a1625] transition-colors duration-200"
          >
            ← Back to tap-d.link
          </Link>
        </div>
      </main>
    </>
  );
}
