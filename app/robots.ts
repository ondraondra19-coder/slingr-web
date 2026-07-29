// app/robots.ts
// Next.js z tohoto souboru vygeneruje /robots.txt.
import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://slingr.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // "/objednavka" pokryje i "/objednavka/uspech" (prefixová shoda).
      // "/informace" je 3. krok checkoutu s osobními údaji, ne informační
      // stránka — indexovat ho nechceme, viz komentář v app/sitemap.ts.
      disallow: ["/admin", "/api", "/kosik", "/objednavka", "/informace"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
