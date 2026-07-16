"use client";

// components/CookieBanner.tsx
// Lišta se souhlasem. Čtení/zápis volby řeší lib/consent.ts — tady je jen UI.
//
// "Odmítnout vše" musí zůstat stejně dostupné A stejně nápadné jako "Povolit
// vše" (jeden klik, stejná úroveň, stejný vzhled): souhlas, který jde dát
// snadněji než odmítnout, není podle GDPR svobodný. Nedávejte odmítnutí do
// modálu, neschovávejte ho do odkazu ani mu nedávejte bledší styl.
//
// Lišta záměrně nabízí jen tyhle dvě volby. Podrobné nastavení po kategoriích
// (analytika / marketing zvlášť) žije na /cookies, kam vede odkaz "Zobrazit
// detaily" — dřív to samé duplikoval modál za tlačítkem "Upravit".
// POZOR: až se nasadí druhá reálná volitelná kategorie (dnes je jediná
// analytika, marketing se nikde nečte — viz hasMarketingConsent), přestane
// binární volba stačit. GDPR chce souhlas konkrétní pro každý účel, takže
// v tu chvíli musí granulární volba zpátky i do lišty.
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  acceptAll,
  hasDecided,
  hasVisitedDetails as readVisitedDetails,
  markDetailsVisited,
  rejectAll,
} from "@/lib/consent";

export default function CookieBanner() {
  const router = useRouter();
  const pathname = usePathname();

  type State = "idle" | "blocking" | "visible" | "leaving" | "gone";
  const [state, setState] = useState<State>("idle");

  const [hasVisitedDetails, setHasVisitedDetails] = useState(false);

  useEffect(() => {
    if (readVisitedDetails()) {
      setHasVisitedDetails(true);
    }

    if (pathname === "/cookies") {
      markDetailsVisited();
      setHasVisitedDetails(true);
      setState("gone");
      return;
    }

    // V adminu se nic netrackuje (viz PostHogProvider), takže tam lišta nedává smysl.
    if (pathname?.startsWith("/admin")) {
      setState("gone");
      return;
    }

    if (hasDecided()) {
      setState("gone");
      return;
    }
    setState("blocking");
    const t = setTimeout(() => setState("visible"), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  function dismiss() {
    setState("leaving");
    setTimeout(() => setState("gone"), 500);
  }

  function handleAcceptAll() {
    acceptAll();
    dismiss();
  }

  function handleRejectAll() {
    rejectAll();
    dismiss();
  }

  if (state === "idle" || state === "gone") return null;

  const isLeaving = state === "leaving";
  const isBlocking = state === "blocking";

  return (
    <>
      {/* Dynamic Overlay pozadí */}
      <div
        aria-hidden="true"
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-0 z-[199] transition-all duration-500 ${
          isLeaving
            ? "opacity-0 pointer-events-none"
            : isBlocking
            ? "opacity-0 pointer-events-auto"
            : "opacity-100"
        } ${
          hasVisitedDetails
            ? "pointer-events-none"
            : "pointer-events-auto"
        }`}
        style={{
          background: hasVisitedDetails ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.6)",
          backdropFilter: hasVisitedDetails ? "none" : "blur(4px)"
        }}
      />

      {/* DYNAMICKÝ VNĚJŠÍ KONTEJNER */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Souhlas s cookies"
        className={`fixed z-[200] transition-all duration-500 ease-out ${
          hasVisitedDetails
            ? "bottom-0 left-0 w-full"
            : "bottom-6 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4"
        } ${
          isLeaving || isBlocking
            ? hasVisitedDetails ? "translate-y-full opacity-0" : "translate-y-12 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {/* DYNAMICKÉ TĚLO BANNERU */}
        <div
          className={`bg-[#121212] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 ${
            hasVisitedDetails
              ? "border-t border-white/10 w-full p-4 md:py-4 md:px-8 gap-4 md:gap-8 rounded-none"
              : "border border-white/5 rounded-2xl p-6 md:p-8 gap-6 md:gap-12"
          }`}
        >

          {/* Levá textová část */}
          <div className={`flex-1 min-w-0 flex flex-col justify-between h-full ${hasVisitedDetails ? "md:flex-row md:items-center gap-2 md:gap-6" : ""}`}>
            <div>
              <h2 className={`text-white font-bold tracking-wide ${hasVisitedDetails ? "text-sm mb-0.5" : "text-base md:text-lg mb-1.5"}`}>
                Tato webová stránka používá cookies
              </h2>
              <p className={`text-[#a3a3a3] leading-relaxed ${hasVisitedDetails ? "text-[11px] md:text-xs max-w-5xl" : "text-xs md:text-sm max-w-4xl"}`}>
                Technické cookies potřebujeme k fungování košíku a pokladny — ty nejdou vypnout.
                Analytické cookies používáme jen s vaším souhlasem k měření návštěvnosti v nástroji PostHog.
                {!hasVisitedDetails && " Data neprodáváme ani nepředáváme reklamním sítím a bez souhlasu se na PostHog neodešle nic."}
              </p>
            </div>

            {/* Odkaz Zobrazit detaily */}
            <div className={`shrink-0 ${hasVisitedDetails ? "mt-1 md:mt-0" : "mt-4 md:mt-6"}`}>
              <button
                onClick={() => router.push('/cookies')}
                className={`text-primary hover:text-primary/80 font-medium inline-flex items-center transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer whitespace-nowrap ${
                  hasVisitedDetails ? "text-xs gap-1" : "text-xs md:text-sm gap-1.5"
                }`}
              >
                Zobrazit detaily
                <ChevronRight size={hasVisitedDetails ? 12 : 14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Pravá tlačítková část */}
          <div className={`shrink-0 flex items-center ${
            hasVisitedDetails
              ? "flex-row gap-2 w-full md:w-auto justify-end"
              : "flex-col gap-3 w-full md:w-auto min-w-[200px]"
          }`}>

            {/* Obě tlačítka MUSÍ vypadat stejně — ne jen být stejně blízko.
                Souhlas, který je vizuálně nápadnější než odmítnutí, je podle
                GDPR nátlakový (dřív: "Povolit" plné růžové, "Odmítnout" bledý
                obrys). Když sáhneš na styl jednoho, sáhni i na druhý. */}
            {([
              { label: "Povolit vše",   onClick: handleAcceptAll },
              { label: "Odmítnout vše", onClick: handleRejectAll },
            ] as const).map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={`bg-primary hover:bg-primary/80 text-on-primary font-bold tracking-wide transition-colors duration-200 cursor-pointer text-center whitespace-nowrap ${
                  hasVisitedDetails
                    ? "flex-1 md:flex-none py-2 px-5 rounded-lg text-xs"
                    : "w-full md:w-48 py-3 px-6 rounded-xl text-sm"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>
      </div>

    </>
  );
}
