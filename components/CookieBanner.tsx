"use client";

import { useState, useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "techgadgets-cookie-consent";

export function getConsent(): "accepted" | null {
  if (typeof window === "undefined") return null;
  try {
    return (localStorage.getItem(STORAGE_KEY) as "accepted") ?? null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const router = useRouter();
  const pathname = usePathname();
  
  type State = "idle" | "blocking" | "visible" | "leaving" | "gone";
  const [state, setState] = useState<State>("idle");
  
  // Stavy pro modální okno a výběr cookies
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    // Pokud je uživatel na stránce s detaily o cookies, lištu úplně skryjeme
    if (pathname === "/cookies") {
      setState("gone");
      return;
    }

    if (getConsent()) {
      setState("gone");
      return;
    }
    setState("blocking");
    const t = setTimeout(() => setState("visible"), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    setState("leaving");
    setTimeout(() => setState("gone"), 500);
  }

  // Uložení vlastního nastavení z modálu
  function saveCustomSettings() {
    try {
      const customConsent = {
        essential: true,
        analytics: analyticsAllowed,
        marketing: marketingAllowed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customConsent));
    } catch {}
    setIsModalOpen(false);
    setState("leaving");
    setTimeout(() => setState("gone"), 500);
  }

  if (state === "idle" || state === "gone") return null;

  const isLeaving = state === "leaving";
  const isBlocking = state === "blocking";

  return (
    <>
      {/* Overlay pozadí */}
      <div
        aria-hidden="true"
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-0 z-[199] transition-opacity duration-500 ${
          isLeaving
            ? "opacity-0 pointer-events-none"
            : isBlocking
            ? "opacity-0 pointer-events-auto"
            : "opacity-100 pointer-events-auto"
        }`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      />

      {/* Kontajner pro vycentrování banneru na spodu obrazovky */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Souhlas s cookies"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-[200] transition-all duration-500 ease-out ${
          isLeaving || isBlocking
            ? "translate-y-12 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {/* Tělo banneru — tvůj původní tmavě šedý design */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
          
          {/* Levá textová část */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-white font-bold text-base md:text-lg mb-1.5 tracking-wide">
                Tato webová stránka používá cookies
              </h2>
              <p className="text-[#a3a3a3] text-xs md:text-sm leading-relaxed max-w-4xl">
                K personalizaci obsahu a reklam, poskytování funkcí sociálních médií a analýze naší návštěvnosti využíváme soubory cookie. 
                Informace o tom, jak náš web používáte, sdílíme se svými partnery pro sociální média, inzerci a analýzy. Partneři tyto údaje 
                mohou zkombinovat s dalšími informacemi, které jste jim poskytli nebo které získali v důsledku toho, že používáte jejich služby.
              </p>
            </div>
            
            {/* Odkaz Zobrazit detaily */}
            <div className="mt-4 md:mt-6">
              <button 
                onClick={() => router.push('/cookies')}
                className="text-[#dc143c] hover:text-[#ff2e5b] text-xs md:text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer"
              >
                Zobrazit detaily
                <ChevronRight size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Pravá tlačítková část */}
          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 min-w-[200px]">
            {/* Tlačítko Povolit vše — plná červená */}
            <button
              onClick={accept}
              className="w-full md:w-48 py-3 px-6 rounded-xl bg-[#dc143c] hover:bg-[#b00f2e] text-black font-bold text-sm tracking-wide transition-colors duration-200 cursor-pointer text-center"
            >
              Povolit vše
            </button>

            {/* Tlačítko Upravit — obrysové s šipkou */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-48 py-3 px-6 rounded-xl border-2 border-[#dc143c] hover:bg-[#dc143c]/10 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-1 transition-colors duration-200 cursor-pointer"
            >
              <span>Upravit</span>
              <ChevronRight size={14} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      {/* MODÁLNÍ OKNO UPRAVIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[300] backdrop-blur-md">
          <div className="bg-[#121212] border border-white/5 text-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            
            {/* Křížek na zavření */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#a3a3a3] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-white font-bold text-lg md:text-xl mb-2 tracking-wide">
              Nastavení cookies
            </h3>
            <p className="text-[#a3a3a3] text-xs md:text-sm mb-6 leading-relaxed">
              Zde si můžete vybrat, jaké typy cookies chcete povolit. Technické jsou nezbytné pro pohyb v košíku.
            </p>

            {/* List kategorií */}
            <div className="space-y-4 mb-6">
              {/* Technické */}
              <div className="flex items-start justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="pr-4">
                  <span className="font-bold text-sm block text-white">Technické (Nezbytné)</span>
                  <span className="text-[#a3a3a3] text-xs block mt-0.5">Nutné pro fungování košíku a přihlášení.</span>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-transparent text-[#dc143c] focus:ring-[#dc143c] disabled:opacity-50 cursor-not-allowed accent-[#dc143c]"
                />
              </div>

              {/* Analytické */}
              <div className="flex items-start justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="pr-4">
                  <label htmlFor="modal-analytics" className="font-bold text-sm block text-white cursor-pointer">Analytické cookies</label>
                  <span className="text-[#a3a3a3] text-xs block mt-0.5">Pomáhají nám analyzovat návštěvnost e-shopu.</span>
                </div>
                <input
                  id="modal-analytics"
                  type="checkbox"
                  checked={analyticsAllowed}
                  onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-transparent text-[#dc143c] focus:ring-[#dc143c] cursor-pointer accent-[#dc143c]"
                />
              </div>

              {/* Marketingové */}
              <div className="flex items-start justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="pr-4">
                  <label htmlFor="modal-marketing" className="font-bold text-sm block text-white cursor-pointer">Marketingové cookies</label>
                  <span className="text-[#a3a3a3] text-xs block mt-0.5">Umožňují nám zobrazovat vám relevantní reklamu.</span>
                </div>
                <input
                  id="modal-marketing"
                  type="checkbox"
                  checked={marketingAllowed}
                  onChange={(e) => setMarketingAllowed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-transparent text-[#dc143c] focus:ring-[#dc143c] cursor-pointer accent-[#dc143c]"
                />
              </div>
            </div>

            {/* Tlačítko na uložení */}
            <div className="flex justify-end pt-2">
              <button
                onClick={saveCustomSettings}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#dc143c] hover:bg-[#b00f2e] text-black font-bold text-sm tracking-wide transition-colors duration-200 cursor-pointer text-center"
              >
                Uložit výběr
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}