"use client";

// components/CookieBanner.tsx
// Lišta se souhlasem. Čtení/zápis volby řeší lib/consent.ts — tady je jen UI.
//
// "Odmítnout vše" musí zůstat stejně dostupné A stejně nápadné jako "Povolit
// vše" (jeden klik, stejná úroveň, stejný vzhled): souhlas, který jde dát
// snadněji než odmítnout, není podle GDPR svobodný. Nedávejte odmítnutí do
// modálu, neschovávejte ho do odkazu ani mu nedávejte bledší styl.
//
// Lišta má jeden vzhled pro všechny návštěvy — spodní pruh přes celou šířku,
// bez překryvu a bez blokování stránky. (Dřív byl první zobrazení modálnější:
// vycentrovaná karta nad ztmavlým pozadím.)
//
// Lišta záměrně nabízí jen dvě volby. Podrobné nastavení po kategoriích
// (analytika / marketing zvlášť) žije na /cookies, kam vede odkaz "Zobrazit
// detaily" — dřív to samé duplikoval modál za tlačítkem "Upravit".
// POZOR: až se nasadí druhá reálná volitelná kategorie (dnes je jediná
// analytika, marketing se nikde nečte — viz hasMarketingConsent), přestane
// binární volba stačit. GDPR chce souhlas konkrétní pro každý účel, takže
// v tu chvíli musí granulární volba zpátky i do lišty.
import { useState, useEffect, useSyncExternalStore } from "react";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/useT";
import { useRouter, usePathname } from "next/navigation";
import { acceptAll, hasDecided, rejectAll, CONSENT_CHANGED_EVENT } from "@/lib/consent";

// Souhlas je externí stav (localStorage), takže se čte přes useSyncExternalStore,
// ne přes useState+useEffect. Odběr zachytí i odvolání souhlasu ze stránky
// /cookies (CONSENT_CHANGED_EVENT) a změnu z jiného panelu (storage).
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export default function CookieBanner() {
  const t = useT("cookieBanner");
  const router = useRouter();
  const pathname = usePathname();

  // Na serveru se tváříme, že návštěvník rozhodl — lišta se tak nevykreslí do
  // HTML a nevzniká hydration mismatch. Po mountu se přečte skutečná hodnota.
  const decided = useSyncExternalStore(subscribeConsent, hasDecided, () => true);

  const [entered, setEntered] = useState(false); // vstupní animace zdola
  const [leaving, setLeaving] = useState(false); // odchozí animace po kliknutí
  const [gone, setGone] = useState(false);       // po doběhnutí odchodu

  // Na /cookies je plné nastavení, tam by lišta překážela. V adminu se nic
  // netrackuje (viz PostHogProvider), takže tam nedává smysl.
  const suppressed = pathname === "/cookies" || !!pathname?.startsWith("/admin");
  const hidden = suppressed || decided || gone;

  // První snímek vykreslíme zasunutou a hned poté ji pustíme nahoru, ať je
  // vidět animace. setState je v callbacku timeru, ne v těle efektu.
  useEffect(() => {
    if (hidden || entered) return;
    const timer = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(timer);
  }, [hidden, entered]);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => setGone(true), 500);
  }

  function handleAcceptAll() {
    acceptAll();
    dismiss();
  }

  function handleRejectAll() {
    rejectAll();
    dismiss();
  }

  if (hidden) return null;

  const isHidden = leaving || !entered;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("dialogLabel")}
      className={`fixed bottom-0 left-0 w-full z-[200] transition-all duration-500 ease-out ${
        isHidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {/* Do řádku (text | detaily | tlačítka) se přepíná až na xl. Tři sloupce
          vedle sebe potřebují ~1200 px; na užším desktopu se textový sloupec
          smrskl na ~180 px, popis se zalomil do 8 řádků a lišta zabrala 74 %
          výšky okna. Ve sloupci má text celou šířku a lišta je nižší. */}
      <div className="bg-[#121212] shadow-2xl border-t border-white/10 w-full p-6 md:py-7 md:px-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 xl:gap-10">

        {/* Levá textová část */}
        <div className="w-full xl:flex-1 min-w-0 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-8">
          {/* flex-1 min-w-0 tu musí zůstat: bez něj se textový sloupec smrskne
              na šířku obsahu, popis se zalomí do ~11 řádků a lišta vyroste přes
              půl obrazovky — pak přeteče i uvítací popup, který si pod sebe
              rezervuje jen pevných md:pb-56 (viz WelcomeDiscountPopup). */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold tracking-wide text-lg md:text-xl mb-1.5">
              {t("title")}
            </h2>
            <p className="text-[#a3a3a3] leading-relaxed text-sm md:text-base max-w-5xl">
              {t("desc")} {t("descExtra")}
            </p>
          </div>

          {/* Odkaz Zobrazit detaily */}
          <div className="shrink-0">
            <button
              onClick={() => router.push('/cookies')}
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1.5 text-sm md:text-base transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
            >
              {t("showDetails")}
              <ChevronRight size={18} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Pravá tlačítková část */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

          {/* Obě tlačítka MUSÍ vypadat stejně — ne jen být stejně blízko.
              Souhlas, který je vizuálně nápadnější než odmítnutí, je podle
              GDPR nátlakový (dřív: "Povolit" plné růžové, "Odmítnout" bledý
              obrys). Když sáhneš na styl jednoho, sáhni i na druhý. */}
          {([
            { label: t("acceptAll"), onClick: handleAcceptAll },
            { label: t("rejectAll"), onClick: handleRejectAll },
          ] as const).map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-on-primary font-bold tracking-wide transition-colors duration-200 cursor-pointer text-center whitespace-nowrap py-3 px-8 rounded-xl text-sm md:text-base"
            >
              {btn.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
