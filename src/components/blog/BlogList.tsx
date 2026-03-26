"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogCard } from "./BlogCard";
import { BlogPagination } from "./BlogPagination";
import type { BlogPostSummary, PaginatedBlogPosts } from "@/types/blog";

interface BlogListProps {
  initialData: PaginatedBlogPosts;
}

export function BlogList({ initialData }: BlogListProps) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = parseInt(pageParam ?? "1", 10);

  const [data, setData] = useState<PaginatedBlogPosts>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we're on page 1 and have initial data, don't refetch
    if (currentPage === 1 && initialData.page === 1) {
      setData(initialData);
      return;
    }

    async function fetchPage() {
      setLoading(true);
      try {
        // We use a Relative URL or a direct DB call? 
        // In a static export, we usually fetch from an API or directly from Firebase.
        // Since blog-server.ts uses the Firebase client SDK (despite the name), 
        // we can actually call it from the client too if we export it properly.
        // Wait, blog-server.ts is marked as server-side in my mind but it's just functions.
        
        // Importing it directly might work if it doesn't use node-only APIs.
        // Let's check blog-server.ts imports.
        const { getPublishedBlogPosts } = await import("@/lib/db/blog-server");
        const result = await getPublishedBlogPosts(currentPage);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch blog page:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [currentPage, initialData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 opacity-50 transition-opacity duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <BlogPagination
          currentPage={data.page}
          hasNextPage={data.hasNextPage}
          hasPreviousPage={data.hasPreviousPage}
          total={data.total}
          perPage={data.perPage}
        />
      </div>
    );
  }

  if (data.posts.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">📝</p>
        <h2 className="text-xl font-semibold text-[#1a1625] mb-2">No posts yet</h2>
        <p className="text-[#5b5470]">Check back soon — we're writing!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      <BlogPagination
        currentPage={data.page}
        hasNextPage={data.hasNextPage}
        hasPreviousPage={data.hasPreviousPage}
        total={data.total}
        perPage={data.perPage}
      />
    </>
  );
}
