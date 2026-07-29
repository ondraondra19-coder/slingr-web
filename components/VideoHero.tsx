"use client";

// První sekce homepage — celoobrazovkové video s tmavým overlayem a centrovaným
// textem (styl blastro.cz). Klientská komponenta kvůli překladům (jazyk se čte
// z cookie až po hydrataci, viz lib/locale.ts).
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/useT";

export default function VideoHero() {
  const t = useT("videohero");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Kdo si v systému vypnul animace (iOS: Nastavení → Zpřístupnění → Pohyb),
  // nechce ani smyčku videa přes celou obrazovku — u citlivých lidí umí vyvolat
  // nevolnost. Video necháme na prvním snímku místo přehrávání; `currentTime`
  // ho donutí snímek vykreslit, i když se pozastaví hned po načtení metadat.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.autoplay = false;
    video.pause();
    const showFirstFrame = () => { video.currentTime = 0; };
    video.addEventListener("loadedmetadata", showFirstFrame);
    return () => video.removeEventListener("loadedmetadata", showFirstFrame);
  }, []);

  return (
    // Desktop: sekce má stejný poměr stran jako video (832×384 ≈ 13/6), takže se
    // ukáže celé bez ořezu (object-cover se stejným poměrem už nic neusekne).
    // Mobil: video vyplní obrazovku pod hlavičkou (object-cover přijatelně ořízne
    // boky, aby na úzkém displeji nezbyl proužek).
    <section className="relative w-full overflow-hidden bg-header h-[calc(100svh_-_4rem_-_env(safe-area-inset-top))] lg:h-auto lg:aspect-[832/384]">

      {/* Pozadí — video. Dekorativní (obsah nese text vedle), proto aria-hidden.
          muted+playsInline je nutné, aby autoplay prošel na mobilech i v Safari.

          preload="metadata", ne "auto": soubor má 3,7 MB a s "auto" si ho
          prohlížeč stahoval celý hned při načtení stránky — na mobilních datech
          to je zbytečně drahé a zdržuje to vykreslení textu přes video.

          TODO: doplnit `poster` s prvním snímkem videa. Než se video stáhne,
          je hero jen tmavá plocha; s posterem by se rovnou ukázal obrázek.
          Vyrobit se dá jedním příkazem:
            ffmpeg -i public/videos/uvod.mp4 -vframes 1 -q:v 3 public/images/main/hero-poster.jpg
          a pak sem přidat poster="/images/main/hero-poster.jpg". */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/uvod.mp4" type="video/mp4" />
      </video>

      {/* Tmavý overlay pro čitelnost bílého textu — základ + spodní gradient,
          aby text i odznaky měly dost kontrastu i nad světlými záběry videa. */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

      {/* Obsah */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-white font-extrabold tracking-tight leading-[1.05] text-4xl sm:text-6xl lg:text-7xl max-w-4xl drop-shadow-sm">
          {t("headline")}
        </h1>

        <p className="mt-5 text-white/85 text-lg sm:text-xl max-w-xl leading-relaxed">
          {t("sub")}
        </p>

        <Link
          href="/kategorie/zbrane"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-base hover:brightness-105 active:scale-[0.98] transition-all duration-150 shadow-lg"
        >
          {t("cta")}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>

    </section>
  );
}
