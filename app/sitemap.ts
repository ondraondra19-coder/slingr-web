// app/sitemap.ts
// Next.js automaticky z tohoto souboru vygeneruje /sitemap.xml.
// Doména se bere z NEXT_PUBLIC_SITE_URL (.env.local) — až bude mít e-shop
// ostrou doménu, stačí ji tam nastavit, sitemapa se nemusí nijak upravovat.
import type { MetadataRoute } from "next";
import { products, categories } from "@/lib/products";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://slingr.vercel.app").replace(/\/$/, "");

// Statické informační stránky — košík, checkout a admin sem záměrně nepatří,
// nejsou to stránky, které má smysl nabízet Googlu k indexaci.
const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/o-nas", priority: 0.5, changeFrequency: "monthly" },
  { path: "/kontakt", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/doprava", priority: 0.5, changeFrequency: "monthly" },
  { path: "/reklamace", priority: 0.4, changeFrequency: "monthly" },
  { path: "/informace", priority: 0.4, changeFrequency: "monthly" },
  { path: "/napsat-recenzi", priority: 0.3, changeFrequency: "monthly" },
  { path: "/obchodni-podminky", priority: 0.2, changeFrequency: "yearly" },
  { path: "/ochrana-osobnich-udaju", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
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
