// app/hledani/page.tsx
// Stránka výsledků vyhledávání. Na rozdíl od overlaye v hlavičce (rychlý náhled)
// tady zákazník výsledky filtruje a řadí — proto sem míří „Zobrazit všechny
// výsledky" i Enter z overlaye.
//
// Stejná architektura jako kategorie: server načte katalog (s přepisy cen) a
// živý sklad z Redisu a předá je klientovi, který nad tím dělá fulltext (Fuse)
// a filtry. Sklad je potřeba pro filtr „skladem" — /api/stock umí jen jeden
// slug, tady je potřeba celá mapa.
import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductsForDisplay } from "@/lib/productDiscounts";
import { getStockMap } from "@/lib/stock";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HledaniClient from "@/components/HledaniClient";

// Interní vyhledávání se neindexuje — vyhledávače nemají procházet nekonečno
// kombinací dotazů (běžná SEO praxe u on-site search).
export const metadata: Metadata = {
  title: "Vyhledávání",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function HledaniPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await getProductsForDisplay();

  // Celá stock mapa jedním (cachovaným) voláním → { [slug]: number }.
  const stockData: Record<string, number> = {};
  try {
    const stockMap = await getStockMap();
    for (const product of products) {
      const count = stockMap.get(product.slug);
      if (count !== undefined) stockData[product.slug] = count;
    }
  } catch (e) {
    console.warn("Stock fetch failed, using fallback:", e);
  }

  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-surface" />}>
        <HledaniClient products={products} stockData={stockData} initialQuery={q ?? ""} />
      </Suspense>
      <Footer />
    </>
  );
}
