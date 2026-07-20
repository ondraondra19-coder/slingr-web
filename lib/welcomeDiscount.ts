// lib/welcomeDiscount.ts
// Uvítací sleva za e-mail — popup, který vyskočí při první návštěvě
// (components/WelcomeDiscountPopup.tsx).
//
// Tenhle modul je záměrně bez Redisu i bez Reactu, takže ho může importovat
// klientská komponenta i serverová route (/api/welcome-discount). Samotné
// založení kódu v Redisu řeší ensureWelcomeDiscount() v lib/discountsStore.ts.
//
// Kód je JEDEN SDÍLENÝ pro všechny — ne unikátní per e-mail. Počítá se s tím,
// že ho lidi budou přeposílat; je to uvítací sleva, ne osobní kupón. Až by
// vadilo, že koluje po internetu, musí se generovat per kontakt a evidovat
// použití (dnes žádný kód nemá počítadlo uplatnění).
//
// KÓD SE POSÍLÁ VÝHRADNĚ E-MAILEM a nikde v UI se nezobrazuje. Dřív ho popup
// ukazoval rovnou po odeslání, jenže validovat jde jen TVAR adresy, ne jestli
// schránka existuje — takže `fjwoei@isf.jn` prošel a slevu dostal někdo, komu
// e-mail nikdy nedojde. Doručení do schránky je jediné ověření, které opravdu
// něco znamená. Nevracet kód v odpovědi API ani ho neukládat do localStorage.

// POZOR: WELCOME_DISCOUNT_PERCENT se do titulku popupu vykreslí JEŠTĚ NEŽ se
// zavolá API — popup v tu chvíli obsah Redisu nezná. Když se tedy kód založí
// ručně v adminu (nebo se tam dodatečně přepíše), musí zůstat typu "percent"
// a mít stejnou hodnotu jako tahle konstanta. Jinak popup slíbí jedno číslo
// a v košíku i v potvrzovacím e-mailu vyjde jiné.
export const WELCOME_DISCOUNT_CODE = "SLINGR5";
export const WELCOME_DISCOUNT_PERCENT = 5;
export const WELCOME_DISCOUNT_LABEL = "Uvítací sleva 5 %";

const STORAGE_KEY = "slingr-welcome-discount";

// "claimed" = e-mail odeslaný, kód putuje do schránky (popup se sám už
// neotevře). "dismissed" = zavřel křížkem nebo klikem vedle, aniž by e-mail
// zadal. Samotný kód se sem NEUKLÁDÁ — žije jen v odeslaném e-mailu.
export type WelcomeDiscountStatus = "claimed" | "dismissed";

export type WelcomeDiscountState = {
  status: WelcomeDiscountStatus;
};

export function readWelcomeDiscountState(): WelcomeDiscountState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.status !== "claimed" && parsed?.status !== "dismissed") return null;
    return { status: parsed.status };
  } catch {
    // Rozbitá hodnota nebo zakázané úložiště (Safari v privátním režimu) =
    // jako by ještě nic nebylo. Popup se ukáže znovu — otravnější než tiché
    // schování, ale lepší než přijít o kontakt.
    return null;
  }
}

export function writeWelcomeDiscountState(state: WelcomeDiscountState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
