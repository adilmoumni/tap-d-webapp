import type { MetadataRoute } from "next";
import { getAllPublicLinks, getAllPublicUsernames } from "@/lib/db/bio-server";
import { getAllPublishedBlogSlugs } from "@/lib/db/blog-server";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tap-d.link";

  // Public, indexable routes only
  const routes = ["", "/pricing", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" ? ("daily" as const)
      : route === "/blog" ? ("daily" as const)
      : ("weekly" as const),
    priority: route === "" ? 1 : route === "/blog" ? 0.85 : 0.9,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [usernames, links, blogSlugs] = await Promise.all([
      getAllPublicUsernames(),
      getAllPublicLinks(),
      getAllPublishedBlogSlugs(),
    ]);
    const slugs = Array.from(
      new Set([...usernames, ...links].map((s) => s.trim()).filter(Boolean))
    );
    dynamicRoutes = [
      ...slugs.map((slug) => ({
        url: `${baseUrl}/${encodeURIComponent(slug)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      ...blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (err) {
    console.error("[sitemap] failed to fetch dynamic slugs:", err);
  }

  return [...routes, ...dynamicRoutes];
}
