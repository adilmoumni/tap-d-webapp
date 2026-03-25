import type { Metadata } from "next";
import BioClientPage from "./BioClientPage";
import {
  getAllPublicLinks,
  getAllPublicUsernames,
  getBioPageServer,
  getLinkBySlugServer,
} from "@/lib/db/bio-server";

const BASE_URL = "https://tap-d.link";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeImage(url?: string | null): string {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return DEFAULT_IMAGE;
}

function getPrimarySocialImage(url?: string | null): string {
  const normalized = normalizeImage(url);
  return normalized;
}

function getOpenGraphImages(primary: string, alt: string) {
  const images = [
    { url: primary, alt, width: 1200, height: 630 },
  ];

  if (primary !== DEFAULT_IMAGE) {
    images.push({
      url: DEFAULT_IMAGE,
      alt: "tap-d.link preview image",
      width: 1200,
      height: 630,
    });
  }

  return images;
}

function toSet(items: string[]): Set<string> {
  const out = new Set<string>();
  for (const item of items) {
    const s = safeDecode(item).trim();
    if (!s) continue;
    out.add(s);
  }
  return out;
}

export async function generateStaticParams() {
  try {
    const [usernames, links] = await Promise.all([
      getAllPublicUsernames(),
      getAllPublicLinks(),
    ]);

    const all = new Set<string>(["placeholder"]);
    const values = toSet([...usernames, ...links]);
    for (const slug of values) all.add(slug);

    return Array.from(all).map((slug) => ({ slug }));
  } catch (err) {
    console.error("[slug] generateStaticParams failed:", err);
    return [{ slug: "placeholder" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = safeDecode(slug);

  if (!decoded || decoded === "placeholder") {
    return {};
  }

  const bio = await getBioPageServer(decoded);
  if (bio && bio.isPublic !== false) {
    const title = bio.displayName;
    const description =
      bio.bio?.trim() ||
      `Discover ${bio.displayName}'s bio page and links on tap-d.link.`;
    
    // Use the actual avatar URL since we build statically
    const image = getPrimarySocialImage(bio.avatarUrl);
    const canonical = `${BASE_URL}/${decoded}`;

    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      openGraph: {
        type: "profile",
        title,
        description,
        url: canonical,
        siteName: "tap-d.link",
        images: getOpenGraphImages(image, `${bio.displayName} profile image`),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  }

  const link = await getLinkBySlugServer(decoded);
  if (link) {
    const title = link.title;
    const description = "Open this smart link on tap-d.link.";
    
    // Use the actual thumbnail since we build statically
    const image = getPrimarySocialImage(link.thumbnailUrl);
    const canonical = `${BASE_URL}/${decoded}`;

    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "tap-d.link",
        images: getOpenGraphImages(image, link.title),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  }

  return {};
}

export default function Page({ params }: { params: any }) {
  return <BioClientPage params={params} />;
}
