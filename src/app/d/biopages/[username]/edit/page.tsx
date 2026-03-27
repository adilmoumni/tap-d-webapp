"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import { useBioEditor } from "@/contexts/BioEditorContext";
import {
  getUserBiopages,
  setUserActiveBio,
  type UserBiopageRecord,
} from "@/lib/db/bio";
import { normalizePublicSlug } from "@/lib/slug";
import { BioLinksEditor } from "@/components/dashboard/bio/BioLinksEditor";
import { BioDesignEditor } from "@/components/dashboard/bio/design/BioDesignEditor";
import { BioVisitorsTab } from "@/components/dashboard/bio/BioVisitorsTab";

function readUsernameParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isTargetPageMatch(
  page: UserBiopageRecord,
  targetBioRef: string,
  targetSlug: string
): boolean {
  if (page.id === targetBioRef) return true;

  const slugSource =
    typeof page.slug === "string" && page.slug
      ? page.slug
      : page.username;
  const pageSlug = normalizePublicSlug(slugSource);
  return !!targetSlug && pageSlug === targetSlug;
}

export default function BioPageEditRoute() {
  const router = useRouter();
  const params = useParams<{ username?: string | string[] }>();
  const { user, loading: authLoading } = useAuth();
  const { bioMode, activeTab } = useDashboard();
  const { loading: editorLoading } = useBioEditor();

  const [resolving, setResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetBioRef = useMemo(() => {
    return readUsernameParam(params?.username).trim();
  }, [params]);

  const targetSlug = useMemo(() => normalizePublicSlug(targetBioRef), [targetBioRef]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!targetBioRef) {
      router.replace("/d/biopages");
      return;
    }

    let cancelled = false;

    async function resolveAndActivate() {
      setResolving(true);
      setError(null);

      try {
        const userPages = await getUserBiopages(user.uid);
        const targetPage = userPages.find((page) =>
          isTargetPageMatch(page, targetBioRef, targetSlug)
        );

        if (!targetPage) {
          if (!cancelled) {
            setError("Bio page not found or you do not have access to it.");
            setResolving(false);
          }
          return;
        }

        if (targetPage.id !== targetBioRef) {
          router.replace(`/d/biopages/${encodeURIComponent(targetPage.id)}/edit`);
          return;
        }

        await setUserActiveBio(user.uid, targetPage.id, targetPage.username);

        if (!cancelled) {
          setResolving(false);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while opening this bio page.");
          setResolving(false);
        }
      }
    }

    void resolveAndActivate();

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, targetBioRef, targetSlug, user]);

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/d/biopages" className="text-sm text-[#1a1a2e] underline">
          Back to Bio Pages
        </Link>
      </div>
    );
  }

  if (resolving || editorLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-lavender-dark" />
        <p className="text-sm text-text-muted font-medium">Loading your bio page...</p>
      </div>
    );
  }

  if (bioMode === "content") {
    if (activeTab === "visitors") {
      return (
        <div className="p-4 lg:p-6">
          <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Visitors</h2>
          <BioVisitorsTab />
        </div>
      );
    }
    return <BioLinksEditor />;
  }

  return <BioDesignEditor activeTab={activeTab} />;
}
