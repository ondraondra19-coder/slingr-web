// app/sitemap.ts
// Next.js automaticky z tohoto souboru vygeneruje /sitemap.xml.
// Doména se bere z NEXT_PUBLIC_SITE_URL (.env.local) — až bude mít e-shop
// ostrou doménu, stačí ji tam nastavit, sitemapa se nemusí nijak upravovat.
import type { MetadataRoute } from "next";
import { products, categories } from "@/lib/products";
import { getAllPosts } from "@/lib/blog";
import { isMagazineEnabled } from "@/lib/featureFlags";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://slingr.vercel.app").replace(/\/$/, "");

// Statické informační stránky — košík, checkout a admin sem záměrně nepatří,
// nejsou to stránky, které má smysl nabízet Googlu k indexaci.
//
// POZOR na /informace: přes název to není informační stránka, ale TŘETÍ KROK
// checkoutu s formulářem na osobní údaje. Do sitemapy nepatří (dřív tady omylem
// byla) a v app/robots.ts je zakázaná — když sem něco přidáváš, zkontroluj obojí.
const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/o-nas", priority: 0.5, changeFrequency: "monthly" },
  { path: "/kontakt", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/doprava", priority: 0.5, changeFrequency: "monthly" },
  { path: "/reklamace", priority: 0.4, changeFrequency: "monthly" },
  { path: "/objednavky", priority: 0.4, changeFrequency: "monthly" },
  { path: "/napsat-recenzi", priority: 0.3, changeFrequency: "monthly" },
  { path: "/obchodni-podminky", priority: 0.2, changeFrequency: "yearly" },
  { path: "/ochrana-osobnich-udaju", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  // /blog se přidává jen když je magazín zapnutý — viz níž.
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Magazín je dočasně skrytý (viz isMagazineEnabled) — nepustíme /blog ani
  // články do sitemapy, ať je Google neindexuje, dokud jsou schované.
  const magazineOn = isMagazineEnabled();
  const posts = magazineOn ? await getAllPosts() : [];

  const staticPages = magazineOn
    ? [...STATIC_PAGES, { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const }]
    : STATIC_PAGES;

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/kategorie/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/produkt/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries, ...blogEntries];
}
