// lib/productSafety.ts
// Údaje, které u online nabídky vyžaduje GPSR — nařízení (EU) 2023/988
// o obecné bezpečnosti výrobků, použitelné od 13. 12. 2024. U každého
// výrobku musí být:
//   a) jméno výrobce, jeho poštovní a elektronická adresa,
//   b) je-li výrobce mimo EU, i odpovědná osoba usazená v EU,
//   c) údaje k identifikaci výrobku (typ, model, případně vyobrazení),
//   d) varování a bezpečnostní informace.
//
// Slingr uvádí výrobky na trh pod vlastním jménem, takže je podle nařízení
// výrobcem on — údaje se proto berou z lib/udaje.ts a není potřeba je psát
// u každého produktu zvlášť. Když se to u některého výrobku liší (cizí značka),
// dá se to přebít polem `safety` na produktu.
//
// POZOR: tohle pokrývá jen INFORMAČNÍ povinnost webu. Pokud jsou praky určené
// dětem do 14 let, jde právně o hračky a platí na ně navíc směrnice o bezpečnosti
// hraček — CE, prohlášení o shodě a technická dokumentace. To řeší dodavatel,
// web to nevyřeší.

import { UDAJE, adresaSidlaPlna, companyField } from "./udaje";

export type ProductSafety = {
  /** Doporučený věk od (roky). Bez vyplnění platí DEFAULT_AGE_MIN. */
  ageMin?: number;
  /** Typové označení, když se liší od názvu produktu. */
  model?: string;
  /** Výrobce, když jím není Slingr (cizí značka). */
  manufacturer?: { name: string; address: string; email: string };
};

/** Věk, od kterého výrobky doporučujeme, když produkt neurčí jinak. */
export const DEFAULT_AGE_MIN = 6;

export type ManufacturerInfo = { name: string; address: string; email: string };

/**
 * Výrobce k zobrazení u produktu. Chybějící název firmy se ukáže jako
 * „[DOPLNIT: …]" stejně jako v obchodních podmínkách — v nabídce, kde ten údaj
 * zákonem být musí, je lepší vidět mezeru než tiché nic.
 */
export function manufacturerFor(safety?: ProductSafety): ManufacturerInfo {
  if (safety?.manufacturer) return safety.manufacturer;
  return {
    name: companyField(UDAJE.name, "NÁZEV VÝROBCE"),
    address: adresaSidlaPlna,
    email: UDAJE.email,
  };
}

export function ageMinFor(safety?: ProductSafety): number {
  return safety?.ageMin ?? DEFAULT_AGE_MIN;
}
