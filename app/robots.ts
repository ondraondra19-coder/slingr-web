// app/robots.ts
// Next.js z tohoto souboru vygeneruje /robots.txt.
import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://slingr.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/kosik", "/objednavka"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
