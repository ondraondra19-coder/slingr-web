// lib/priceFilter.ts
// Meze a krok cenového posuvníku pro filtr kategorie (KategorieClient) i
// výsledky hledání (HledaniClient) — obě stránky mají filtr stejný, takže
// pravidla žijí tady, ne dvakrát v komponentách.
//
// PROČ VE ZVOLENÉ MĚNĚ, NE V KORUNÁCH: dřív filtr počítal i popisoval všechno
// v CZK, takže zákazník s přepnutou měnou viděl u produktů ceny v eurech, ale
// posuvník „0 Kč – 1 290 Kč". Přepočítat jen popisek nejde — ceny nemáme
// odvozené kurzem, ale zadané napevno pro každou měnu zvlášť (viz PriceValue
// v lib/products.ts), takže by se přepočtená hranice s cenou na kartě rozešla.
// Proto se bere stejná cena, jakou vidí zákazník na kartě: getPrice(...).
import type { Product } from "./products";
import { getPrice, type Currency } from "./currency";

/**
 * O kolik se posune úchyt. Koruny jsou celá čísla ve stovkách, takže po
 * desetikorunách; eura/dolary mají řádově menší čísla (deseti- až stokoruna
 * je pár eur), tam by desítka přeskočila půlku sortimentu — jedeme po jedné.
 */
export function priceFilterStep(currency: Currency): number {
  return currency.decimals === 0 ? 10 : 1;
}

export type PriceBounds = { min: number; max: number; step: number };

/**
 * Krajní ceny sortimentu zaokrouhlené VEN na celý krok — díky tomu nejlevnější
 * ani nejdražší produkt z filtru nevypadne (599 Kč: spodní mez drží na 590,
 * ne na 600). Prázdný seznam i sortiment za jednu cenu vrací rozsah, po kterém
 * se dá jezdit, aby posuvník nezůstal zaseknutý na jednom bodě.
 */
export function priceFilterBounds(products: Product[], currency: Currency): PriceBounds {
  const step = priceFilterStep(currency);
  const prices = products.map((p) => getPrice(p.price, currency));
  if (prices.length === 0) return { min: 0, max: step * 100, step };

  const min = Math.floor(Math.min(...prices) / step) * step;
  const max = Math.ceil(Math.max(...prices) / step) * step;
  return { min, max: max > min ? max : min + step, step };
}
