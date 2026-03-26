"use client";

import { useIsAdmin } from "@/hooks/useIsAdmin";
import { BlogManager } from "@/components/dashboard/blog/BlogManager";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BlogDashboardPage() {
  const { isAdmin, loading } = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    // Once auth resolves, redirect non-admins away
    if (!loading && !isAdmin) {
      router.replace("/d/dashboard");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#8a8a9a] text-sm">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return null; // will redirect
  }

  return <BlogManager />;
}
