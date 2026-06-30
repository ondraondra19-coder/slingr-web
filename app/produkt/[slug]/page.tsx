// app/produkt/[slug]/page.tsx
// Server Component — fetchuje produkt + skladovost, předá client komponentě

import { getProductBySlug, getRelatedProducts, products } from "@/lib/products";
import { getProductStock } from "@/lib/stock";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProduktClient from "@/components/ProduktClient";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// Stránka se dynamicky revaliduje — ne staticky builduje —
// aby skladovost byla vždy čerstvá.
export const revalidate = 180; // sekund (= 3 min, stejně jako cache v stock.ts)

export default async function ProduktPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  // Fetchni skladovost pro tento produkt ze Sheets
  // Vrátí objekt jako: { "black|airpods-1-2": 12, "grey|-": 0, ... }
  const stockData = await getProductStock(slug);

  return (
    <>
      <Header />
      <ProduktClient
        product={product}
        related={related}
        stockData={stockData}
      />
    </>
  );
}