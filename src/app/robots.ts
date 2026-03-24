import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/dashboard/",
        "/bio",
        "/settings",
        "/links/",
        "/d/",
        "/login",
        "/signup",
        "/claim-username",
      ],
    },
    sitemap: "https://tap-d.link/sitemap.xml",
    host: "https://tap-d.link",
  };
}
