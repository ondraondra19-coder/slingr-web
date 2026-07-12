import Header from "@/components/Header";
import HomeSlider from "@/components/HomeSlider";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import CategoryGrid from "@/components/CategoryGrid";
import InfoGrid from "@/components/InfoGrid";
import BlogPreview from "@/components/BlogPreview";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getProductsWithPriceOverrides } from "@/lib/priceOverrides";

export const revalidate = 180;

export default async function Home() {
  const products = await getProductsWithPriceOverrides();

  return (
    <main className="min-h-screen bg-dark">
      <Header />
      <HomeSlider />
      <TrustBar />
      <Reviews />
      <CategoryGrid />
      <FeaturedProducts products={products} />
      <InfoGrid />
      <BlogPreview />
      <Footer />
    </main>
  );
}