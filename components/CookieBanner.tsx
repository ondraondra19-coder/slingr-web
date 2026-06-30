"use client";

import { useState, useEffect } from "react";
import { Check, ShieldCheck, ArrowUpRight } from "lucide-react";

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
  type State = "idle" | "blocking" | "visible" | "leaving" | "gone";
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (getConsent()) {
      setState("gone");
      return;
    }
    // Okamžitě blokuj — overlay se vyrendruje PŘED jakýmkoliv kliknutím
    setState("blocking");
    const t = setTimeout(() => setState("visible"), 50);
    return () => clearTimeout(t);
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setState("leaving");
    setTimeout(() => setState("gone"), 500);
  }

  if (state === "idle" || state === "gone") return null;

  const isLeaving  = state === "leaving";
  const isBlocking = state === "blocking";

  return (
    <>
      {/*
        Overlay:
        - "blocking" → opacity-0 ale pointer-events-auto = neviditelný, klikání zablokováno
        - "visible"  → opacity-100 + pointer-events-auto = viditelný, klikání zablokováno
        - "leaving"  → opacity-0 + pointer-events-none = mizí, klikání odblokováno
      */}
      <div
        aria-hidden="true"
        onClick={e => e.stopPropagation()}
        className={`fixed inset-0 z-[199] transition-opacity duration-500 ${
          isLeaving
            ? "opacity-0 pointer-events-none"
            : isBlocking
            ? "opacity-0 pointer-events-auto"
            : "opacity-100 pointer-events-auto"
        }`}
        style={{ background: "rgba(0,0,0,0.4)" }}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Souhlas s cookies"
        className={`fixed bottom-0 left-0 right-0 z-[200] transition-all duration-700 ease-out ${
          isLeaving || isBlocking ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="bg-header border-t-2 border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,0.4)]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">

              {/* Vlevo */}
              <div className="flex items-start md:items-center gap-6 flex-1 min-w-0">
                <div className="shrink-0 hidden md:flex w-16 h-16 rounded-3xl bg-white/5 border border-white/10 items-center justify-center text-primary transform -rotate-2">
                  <ShieldCheck size={32} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-black text-xl md:text-2xl mb-2 tracking-tight uppercase italic">
                    Soukromí a funkčnost košíku
                  </h2>
                  <p className="text-white/50 text-sm md:text-lg leading-relaxed">
                    Tento web používá výhradně nezbytné technické cookies pro fungování{" "}
                    <span className="text-white font-bold">
                      košíku, zabezpečení relace a dokončení objednávky
                    </span>
                    . Bez jejich přijetí není možné v našem obchodě nakupovat. Žádné reklamy, pouze čistý nákupní proces.{" "}
                    <a
                      href="/cookies"
                      className="text-primary hover:text-white inline-flex items-center gap-1 transition-all duration-200 font-bold underline decoration-primary/30 underline-offset-8"
                    >
                      Zásady cookies
                      <ArrowUpRight size={14} />
                    </a>
                  </p>
                </div>
              </div>

              {/* Vpravo */}
              <div className="w-full lg:w-auto shrink-0">
                <button
                  onClick={accept}
                  className="w-full lg:w-auto min-w-[300px] inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-primary text-dark font-black text-base md:text-xl uppercase italic hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-[0_15px_40px_rgba(220,20,60,0.3)]"
                >
                  <Check size={25} strokeWidth={3} />
                  <span>Rozumím a přijímám</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}