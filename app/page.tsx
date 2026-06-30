import Header from "@/components/Header";
import HomeSlider from "@/components/HomeSlider";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import CategoryGrid from "@/components/CategoryGrid";
import InfoGrid from "@/components/InfoGrid";
import BlogPreview from "@/components/BlogPreview";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <Header />
      <HomeSlider />
      <TrustBar />
      <Reviews />
      <CategoryGrid />
      <FeaturedProducts />
      <InfoGrid />
      <BlogPreview />
      <Footer />
    </main>
  );
}