"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonCard } from "@/components/ui/Skeleton";

/* ------------------------------------------------------------------
   AuthGuard – wraps protected (dashboard) routes.
   Behavior:
   • loading  → show skeleton placeholder
   • no user  → redirect to /login
   • no username → redirect to /d/claim-username
   • user     → render children
------------------------------------------------------------------ */

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (profile && !profile.username && pathname !== "/claim-username") {
      router.replace("/claim-username");
      return;
    }
  }, [user, profile, loading, router, pathname]);

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

  if (!user) return null;

  return <>{children}</>;
}
