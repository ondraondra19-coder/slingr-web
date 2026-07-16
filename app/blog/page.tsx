import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // getAllPosts() už vrací seřazeno od nejnovějšího.
  const sortedPosts = await getAllPosts();

  // Vytáhneme data ze sortedPosts
  const [first, second, ...rest] = sortedPosts;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={12} className="text-border" />
            <span className="text-text-muted">Blog</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-text-base tracking-tight mb-8">Co je u nás nového</h1>

          {/* Horní dva — roztažené vedle sebe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[first, second].filter(Boolean).map((post) => (
              <a key={post.slug} href={`/blog/${post.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden aspect-[16/9]">
                <Image 
                  src={post.img} 
                  alt="" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
                  unoptimized={post.img.startsWith("http")}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-text-base font-bold text-sm leading-snug mb-1">{post.title}</h2>
                      <p className="text-text-subtle text-xs">{post.date}</p>
                    </div>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:border-primary group-hover:text-on-primary transition-all duration-200">
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Spodní — po třech */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rest.map((post) => (
                <a key={post.slug} href={`/blog/${post.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden aspect-square">
                  <Image 
                    src={post.img} 
                    alt="" 
                    fill 
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
                    unoptimized={post.img.startsWith("http")}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-text-base font-bold text-sm leading-snug mb-1">{post.title}</h3>
                        <p className="text-text-subtle text-xs">{post.date}</p>
                      </div>
                      <div className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:border-primary group-hover:text-on-primary transition-all duration-200">
                        <ArrowUpRight size={15} />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}