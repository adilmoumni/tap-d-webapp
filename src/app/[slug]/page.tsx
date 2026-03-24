import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getLinkBySlugServer, getBioPageServer } from "@/lib/db/bio-server";
import { BioPageRenderer } from "@/components/shared/BioPageRenderer";
import RedirectClient from "./RedirectClient";
import BioPublicLayout from "./BioPublicLayout";

// Force dynamic rendering — never cache this route.
export const dynamic = "force-dynamic";

// Resolve the raw slug whether the path is /adil or /@adil
function rawSlug(slug: string): string {
  const decoded = decodeURIComponent(slug);
  return decoded.startsWith("@") ? decoded.slice(1) : decoded;
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const name = rawSlug(slug);

  const link = await getLinkBySlugServer(name);
  if (link) {
    const title = `Redirecting: ${link.title} | tap-d.link`;
    const description = `Smart link to ${link.urlDesktop}. Powered by tap-d.link.`;
    return {
      title,
      description,
      openGraph: { title, description, type: "website", url: `https://tap-d.link/${name}` },
      twitter: { card: "summary", title, description },
    };
  }

  const bio = await getBioPageServer(name);
  if (!bio) return { title: "Not Found | tap-d.link" };

  const title = `${bio.displayName} (@${bio.slug}) | tap-d.link`;
  return {
    title,
    description: bio.bio || `Check out ${bio.displayName}'s links on tap-d.link`,
    openGraph: {
      title,
      description: bio.bio || `Check out ${bio.displayName}'s links on tap-d.link`,
      type: "profile",
      url: `https://tap-d.link/@${bio.slug}`,
      images: bio.avatarUrl ? [{ url: bio.avatarUrl }] : undefined,
    },
  };
}

export default async function DynamicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = rawSlug(slug);

  // 1. Smart link — delegate to client for accurate device detection
  const link = await getLinkBySlugServer(name);
  if (link) {
    return <RedirectClient />;
  }

  // 2. Bio page — SSR render inside polished public layout
  const bio = await getBioPageServer(name);
  if (!bio) {
    notFound();
  }

  return (
    <BioPublicLayout slug={name}>
      <BioPageRenderer data={bio as any} variant="public" />
    </BioPublicLayout>
  );
}
