"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function CategoryGrid() {
  return (
    <section className="py-10">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Levý — světlý (primary) */}
          <div className="relative overflow-hidden rounded-2xl bg-primary min-h-[220px] flex items-center p-8 md:p-10">
            {/* Dekorativní kruhy */}
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white/5" />

            {/* Zdroj je 1408×768, ale vykresluje se ve výšce 240px (~440px šířky).
                Syrový <img> stahoval celých 287 KB PNG; next/image doručí AVIF/WebP
                ve správné velikosti. Dekorace → alt="". */}
            <Image src="/images/page/panak.png" alt="" width={440} height={240} className="absolute right-0 bottom-0 h-60 w-auto object-contain object-bottom pointer-events-none" />

            {/* Růžová #ff8ad0 je světlá — bílý text na ní má 2.14:1. Tmavý
                text-on-primary dává 8.94:1 a pozadí zůstává značkově růžové. */}
            <div className="relative z-10 max-w-[55%]">
              <h3 className="text-on-primary text-2xl font-extrabold leading-tight">
                Na všechno zboží dáváme záruku
              </h3>
              <a
                href="/zaruka"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-on-primary/40 text-on-primary text-sm font-medium hover:bg-on-primary/10 transition-all"
              >
                Více informací
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Pravý — tmavý */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0f1117] min-h-[220px] flex items-center p-8 md:p-10">
            {/* Dekorativní kruhy */}
            <div className="absolute -left-8 -top-8 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -left-4 -bottom-12 w-64 h-64 rounded-full bg-white/[0.03]" />

            <Image src="/images/page/panak.png" alt="" width={440} height={240} className="absolute left-0 bottom-0 h-60 w-auto object-contain object-bottom pointer-events-none scale-x-[-1]" />

            <div className="relative z-10 ml-auto text-right max-w-[55%]">
              <h3 className="text-white text-2xl font-extrabold leading-tight">
                Doručujeme již<br />
                <span className="text-primary">do druhého dne</span>
              </h3>
              <a
                href="/doprava"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all"
              >
                Zjistit více
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}