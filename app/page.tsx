import Header from "@/components/Header";
import VideoHero from "@/components/VideoHero";
import TrustBar from "@/components/TrustBar";
import CategoryProductRows from "@/components/CategoryProductRows";
import HowItWorks from "@/components/HowItWorks";
import Reviews from "@/components/Reviews";
import CategoryGrid from "@/components/CategoryGrid";
import InfoGrid from "@/components/InfoGrid";
import BlogPreview from "@/components/BlogPreview";
import Footer from "@/components/Footer";
import { getProductsForDisplay } from "@/lib/productDiscounts";
import { getStockMap } from "@/lib/stock";

export const revalidate = 180;

export default async function Home() {
  const products = await getProductsForDisplay();

  // Reálná dostupnost pro odznaky „Poslední kusy" / „Zbývá N skladem" a pro
  // skrytí quick-add „+" u vyprodaných. Klíč = slug produktu (jeden sklad na
  // produkt, viz lib/stock.ts). Nenaskladněný produkt = 0 (ne fallback na
  // statické inStock), takže bez skladu se nedá rovnou hodit do košíku. Jen
  // když Redis spadne, necháme availability prázdné a karty použijí product.inStock.
  const availability: Record<string, number> = {};
  try {
    const stockMap = await getStockMap();
    for (const product of products) {
      availability[product.slug] = stockMap.get(product.slug) ?? 0;
    }
  } catch (e) {
    console.warn("Stock fetch for homepage failed:", e);
  }

  return (
    <main className="min-h-screen bg-dark">
      <Header />
      <VideoHero />
      <TrustBar />
      <CategoryProductRows products={products} availability={availability} slugs={["vyhodne-sety", "zbrane"]} />
      <HowItWorks />
      <Reviews />
      <CategoryProductRows products={products} availability={availability} slugs={["munice"]} />
      <CategoryGrid />
      <CategoryProductRows products={products} availability={availability} slugs={["prislusenstvi"]} />
      <InfoGrid />
      <BlogPreview />
      <Footer />
    </main>
  );
}