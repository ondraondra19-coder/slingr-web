import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getAllPosts, getPostBySlug, parseBlogContent, splitBold } from "@/lib/blog";

// Obsah spravuje admin a může se změnit kdykoliv — žádné statické
// generování/cache, ať se úpravy projeví hned.
export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const blocks = parseBlogContent(post.content);

  function renderInline(text: string) {
    return splitBold(text).map((part, i) =>
      part.bold ? <strong key={i} className="font-bold text-text-base">{part.text}</strong> : <span key={i}>{part.text}</span>
    );
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
            unoptimized={post.img.startsWith("http")}
          />
        </div>

        {/* Text — celá šířka s větším paddingem */}
        <div className="w-full px-8 md:px-16 lg:px-24 py-12">
          {blocks.map((block, i) => {
            if (block.type === "heading") {
              return <h2 key={i} className="text-3xl font-bold text-text-base mt-12 mb-5">{renderInline(block.text)}</h2>;
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="list-disc list-inside space-y-2 mb-6 text-text-muted text-lg leading-relaxed">
                  {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ul>
              );
            }
            return <p key={i} className="text-text-muted text-lg leading-relaxed mb-6">{renderInline(block.text)}</p>;
          })}
        </div>

      </main>
      <Footer />
    </>
  );
}