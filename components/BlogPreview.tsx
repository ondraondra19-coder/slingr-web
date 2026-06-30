"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { blogPosts } from "@/lib/blog";

export default function BlogPreview() {
  const sortedPosts = [...blogPosts].sort((a, b) => {
    const parseCzechDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split(". ").map(Number);
      return new Date(year, month - 1, day).getTime();
    };

    return parseCzechDate(b.date) - parseCzechDate(a.date);
  });

  const shown = sortedPosts.slice(0, 3);

  return (
    <section className="py-16">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl font-bold text-text-base mb-8">Co je u nás nového</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {shown.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden aspect-[5/4]"
            >
              <Image
                src={post.img}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-text-base font-bold text-sm leading-snug mb-1">
                      {post.title}
                    </h3>
                    <p className="text-text-subtle text-xs">{post.date}</p>
                  </div>
                  <div className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:border-primary group-hover:text-dark transition-all duration-200">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-text-base text-sm font-medium hover:border-primary hover:text-primary transition-all duration-200"
          >
            Přejít do magazínu
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}