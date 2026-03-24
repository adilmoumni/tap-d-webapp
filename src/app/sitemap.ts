import type { MetadataRoute } from "next";
import { getAllPublicLinks, getAllPublicUsernames } from "@/lib/db/bio-server";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tap-d.link";

  // Static routes
  const routes = ["", "/login", "/signup", "/pricing"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [usernames, links] = await Promise.all([
      getAllPublicUsernames(),
      getAllPublicLinks(),
    ]);
    const slugs = Array.from(new Set([...usernames, ...links].map((s) => s.trim()).filter(Boolean)));
    dynamicRoutes = slugs.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] failed to fetch dynamic slugs:", err);
  }

  return [...routes, ...dynamicRoutes];
}
