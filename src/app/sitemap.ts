import type { MetadataRoute } from "next";
// import { getPublicBioUsernames } from "@/lib/db/bio-server";

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

  /* 
     Ideally, we'd fetch all public usernames and add them here.
     For now, we'll stick to static routes or a small subset if needed.
     Example:
     const usernames = await getPublicBioUsernames();
     const bioRoutes = usernames.map(u => ({ ... }));
  */

  return [...routes];
}
