import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBioPageServer } from "@/lib/db/bio-server";
import { PublicBioPage } from "./PublicBioPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await props.params;
  const bioData = await getBioPageServer(username);
  if (!bioData) return { title: "tap-d.link" };

  return {
    title: `${bioData.displayName} | tap-d.link`,
    description: bioData.bio || `${bioData.displayName}'s bio page on tap-d.link`,
    openGraph: {
      title: bioData.displayName,
      description: bioData.bio,
      images: bioData.avatarUrl ? [bioData.avatarUrl] : [],
      url: `https://tap-d.link/@${bioData.username}`,
    },
    twitter: {
      card: "summary",
      title: bioData.displayName,
      description: bioData.bio,
    },
  };
}

export default async function BioUserPage(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;

  const bioData = await getBioPageServer(username);

  if (!bioData || !bioData.isPublic) {
    notFound();
  }

  return <PublicBioPage data={bioData} />;
}
