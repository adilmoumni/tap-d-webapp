"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { getBioPageBySlug, getLinkBySlug, getBioLinks } from "@/lib/db/bio";
import { BioPageRenderer } from "@/components/shared/BioPageRenderer";
import RedirectClient from "./RedirectClient";
import BioPublicLayout from "./BioPublicLayout";
import type { BioPageData } from "@/types/bio";

// Resolve slug from URL segment (/slug only)
function rawSlug(slug: string): string {
  return decodeURIComponent(slug);
}

function slugFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  return rawSlug(last);
}

export default function BioClientPage({ params }: { params: any }) {
  const [name, setName] = useState<string | null>(null);
  const resolvedParams = use(params) as { slug: string };

  useEffect(() => {
    if (resolvedParams?.slug && resolvedParams.slug !== "placeholder") {
      setName(rawSlug(resolvedParams.slug));
    } else if (typeof window !== "undefined") {
      setName(slugFromPathname(window.location.pathname));
    }
  }, [resolvedParams]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ bio: (BioPageData & { id: string }) | null; link: any | null }>({ bio: null, link: null });

  useEffect(() => {
    async function fetchData() {
      if (!name) return;
      try {
        // 1. Check for smart link first
        const link = await getLinkBySlug(name);
        if (link) {
          setData({ bio: null, link });
          setLoading(false);
          return;
        }

        // 2. Check for bio page
        const bio = await getBioPageBySlug(name);
        if (bio) {
          // Fetch links for this bio page
          const links = await getBioLinks(bio.id);
          setData({ bio: { ...bio, links }, link: null });
        } else {
          setData({ bio: null, link: null });
        }
      } catch (err) {
        console.error("Error fetching slug data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  // 1. Smart link — delegate to client for accurate device detection
  if (data.link) {
    return <RedirectClient />;
  }

  // 2. Bio page — render inside polished public layout
  if (!data.bio || !name) {
    notFound();
  }

  return (
    <BioPublicLayout slug={name} bioId={data.bio.id} ownerId={data.bio.ownerId}>
      <BioPageRenderer data={data.bio as any} variant="public" />
    </BioPublicLayout>
  );
}
