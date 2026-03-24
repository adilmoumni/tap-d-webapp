import type { MetadataRoute } from "next";
import { getAllPublicLinks, getAllPublicUsernames } from "@/lib/db/bio-server";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tap-d.link";

  // Public, indexable routes only
  const routes = ["", "/pricing", "/legal/privacy", "/legal/terms"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === ""
        ? ("daily" as const)
        : route === "/pricing"
          ? ("weekly" as const)
          : ("monthly" as const),
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.3,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [usernames, links] = await Promise.all([
      getAllPublicUsernames(),
      getAllPublicLinks(),
    ]);
    const slugs = Array.from(
      new Set([...usernames, ...links].map((s) => s.trim()).filter(Boolean))
    );
    dynamicRoutes = slugs.map((slug) => ({
      url: `${baseUrl}/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] failed to fetch dynamic slugs:", err);
  }

  return [...routes, ...dynamicRoutes];
}
