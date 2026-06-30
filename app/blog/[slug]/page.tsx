import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { blogPosts, getBlogPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  function renderContent(text: string) {
    return text.trim().split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return <h2 key={i} className="text-3xl font-bold text-text-base mt-12 mb-5">{block.slice(3)}</h2>;
      }
      return <p key={i} className="text-text-muted text-lg leading-relaxed mb-6">{block}</p>;
    });
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark">

        {/* Nadpis + datum — celá šířka */}
        <div className="w-full px-8 md:px-16 lg:px-24 pt-12 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-base leading-tight tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-text-subtle text-base">{post.date}</p>
        </div>

        {/* Obrázek — přirozený poměr stran */}
        <div className="w-full px-8 md:px-16 lg:px-24">
          <Image
            src={post.img}
            alt={post.title}
            width={1920}
            height={1080}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Text — celá šířka s větším paddingem */}
        <div className="w-full px-8 md:px-16 lg:px-24 py-12">
          {renderContent(post.content)}
        </div>

      </main>
      <Footer />
    </>
  );
}