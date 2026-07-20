"use client";

// components/WelcomeDiscountPopup.tsx
// Uvítací nabídka: e-mail výměnou za slevový kód. Vyskočí při první návštěvě,
// pak už jen na vyžádání přes bublinu vlevo dole.
//
// SOUŽITÍ S COOKIE LIŠTOU: obojí je na obrazovce naráz (lišta dole, popup nad
// ní). Proto tenhle popup NESMÍ lištu překrýt ani zablokovat:
//  - z-index je pod lištou (ta má z-[200]), takže ztmavení jde pod ni a
//    tlačítka souhlasu zůstanou klikatelná,
//  - dokud lišta visí, popup se odsadí od spodku, aby ji nezakryl, a bublina
//    pro znovuotevření se vůbec nekreslí (spodek patří liště).
// Kdyby se sahalo na výšku lišty v CookieBanner.tsx, projeď i odsazení tady.
//
// Zavření křížkem i klikem vedle = "dismissed", popup se sám znovu neotevře.
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Tag, MailCheck } from "lucide-react";
import { useT } from "@/lib/useT";
import { hasDecided, CONSENT_CHANGED_EVENT } from "@/lib/consent";
import { isValidEmail } from "@/lib/emailValidation";
import {
  readWelcomeDiscountState,
  writeWelcomeDiscountState,
  WELCOME_DISCOUNT_PERCENT,
} from "@/lib/welcomeDiscount";

// Prodleva, než popup vyskočí — ať nenaskočí do rozjeté animace hero sekce.
const OPEN_DELAY_MS = 1500;

export default function WelcomeDiscountPopup() {
  const t = useT("welcomeDiscount");
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [cookieBarVisible, setCookieBarVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Jen "odesláno / neodesláno" — kód sám se sem nikdy nedostane, chodí
  // výhradně e-mailem (viz lib/welcomeDiscount.ts).
  const [sent, setSent] = useState(false);

  // Lišta se souhlasem je vidět, dokud návštěvník nerozhodl. Posloucháme i
  // změnu, aby se popup po kliknutí na "Povolit / Odmítnout" hned přesunul dolů.
  useEffect(() => {
    function sync() {
      setCookieBarVisible(!hasDecided());
    }
    sync();
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (isAdmin) return; // v adminu nic nenabízíme (stejně jako ChatWidget a lišta)
    const saved = readWelcomeDiscountState();
    if (saved) {
      if (saved.status === "claimed") setSent(true);
      setShowBubble(true);
      return;
    }
    // Dokud běží lišta se souhlasem, popup nevyskočí — dva blokující překryvy
    // přes sebe se na první návštěvě rvaly o místo (popup se ořízl) a hlavně
    // odváděly pozornost od volby cookies. Po rozhodnutí lišta zmizí, sync()
    // výš přepne cookieBarVisible a popup naskočí sám o OPEN_DELAY_MS později.
    if (cookieBarVisible) return;
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isAdmin, cookieBarVisible]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setShowBubble(true);
    // Přidělený kód přebíjí "dismissed" — kdo e-mail zadal, ať o kód nepřijde.
    const saved = readWelcomeDiscountState();
    if (saved?.status === "claimed") return;
    writeWelcomeDiscountState({ status: "dismissed" });
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  // API vrací kód chyby, ne hotovou větu — text vybíráme podle jazyka tady.
  function messageForCode(errCode: unknown): string {
    switch (errCode) {
      case "invalid_email":  return t("errorInvalidEmail");
      case "rate_limited":   return t("errorRateLimited");
      case "not_configured": return t("errorUnavailable");
      case "send_failed":    return t("errorSendFailed");
      default:               return t("errorFailed");
    }
  }

  async function handleSubmit() {
    if (loading) return;
    if (!isValidEmail(email)) {
      setError(t("errorInvalidEmail"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/welcome-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSent(true);
        writeWelcomeDiscountState({ status: "claimed" });
      } else {
        setError(messageForCode(data?.code));
      }
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin) return null;

  if (!open) {
    // Bublina se nekreslí, dokud dole visí cookie lišta — spodek obrazovky
    // v tu chvíli patří jí. Objeví se hned, jak návštěvník o cookies rozhodne.
    if (!showBubble || cookieBarVisible) return null;
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-[195] inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-bold text-sm pl-4 pr-5 py-3 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all"
      >
        <Tag size={16} strokeWidth={2.5} />
        {t("bubble", { percent: WELCOME_DISCOUNT_PERCENT })}
      </button>
    );
  }

  return (
    <div
      // Klik na podklad (vedle panelu) zavírá. Panel má vlastní onClick se
      // stopPropagation, aby klik uvnitř formuláře popup nezavřel.
      onClick={dismiss}
      className={`fixed inset-0 z-[190] flex justify-center overflow-y-auto bg-black/60 backdrop-blur-[2px] px-4 transition-opacity duration-300 ${
        // Spodní odsazení musí být vyšší než lišta se souhlasem, jinak popup
        // překryje. Lišta se skládá do řádku (a zkracuje) až na xl — proto se
        // i tady zmenšuje až tam, ne na md. Viz components/CookieBanner.tsx.
        cookieBarVisible
          ? "items-start pt-8 pb-[24rem] sm:items-center sm:pt-4 sm:pb-72 xl:pb-56"
          : "items-start py-8 sm:items-center"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("dialogLabel")}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-primary text-on-primary shadow-2xl p-8 md:p-10 my-auto"
      >
        <button
          onClick={dismiss}
          aria-label={t("close")}
          className="absolute top-4 right-4 p-1.5 rounded-full text-on-primary/70 hover:text-on-primary hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {sent ? (
          /* ── Hotovo: kód je na cestě do schránky ── */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-on-primary/10 mb-4">
              <MailCheck size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              {t("successTitle")}
            </h2>
            <p className="text-on-primary/80 text-sm md:text-base mb-6">
              {t("successDesc")}
            </p>

            <button
              onClick={dismiss}
              className="w-full rounded-xl bg-on-primary text-white font-bold py-3.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              {t("startShopping")}
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-on-primary/70">
              {t("successSpamNote")}
            </p>
          </div>
        ) : (
          /* ── Formulář ── */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-on-primary/10 mb-4">
              <Tag size={26} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              {t("title", { percent: WELCOME_DISCOUNT_PERCENT })}
            </h2>
            <p className="text-on-primary/80 text-sm md:text-base mb-6">
              {t("desc")}
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
              placeholder={t("emailPlaceholder")}
              aria-label={t("emailLabel")}
              aria-invalid={!!error}
              autoComplete="email"
              className={`w-full rounded-xl bg-white border-2 px-4 py-3.5 text-base text-on-primary placeholder-black/40 focus:outline-none transition-colors disabled:opacity-60 ${
                error ? "border-red-600" : "border-transparent focus:border-on-primary/40"
              }`}
            />
            {error && (
              <p className="mt-2 text-left text-xs font-semibold text-red-800">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-on-primary text-white font-bold py-3.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? t("sending") : t("submit")}
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-on-primary/70">
              {t("consent")}{" "}
              <a href="/ochrana-osobnich-udaju" className="underline hover:no-underline">
                {t("privacyLink")}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
