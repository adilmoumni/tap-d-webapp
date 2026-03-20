"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonCard } from "@/components/ui/Skeleton";

/* ------------------------------------------------------------------
   AuthGuard – wraps protected (dashboard) routes.
   Behavior:
   • loading → show skeleton placeholder
   • no user → redirect to /login
   • user    → render children
------------------------------------------------------------------ */

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col gap-4 p-8 max-w-2xl mx-auto pt-24">
        <div className="h-8 w-48 bg-lavender-light rounded-lg animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    // Redirect in progress — render nothing
    return null;
  }

  return <>{children}</>;
}
