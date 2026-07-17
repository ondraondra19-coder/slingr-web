"use client";

// lib/variantLabels.ts
// Překlad variant produktu (barvy, velikosti, generace) a názvů jejich
// atributů.
//
// PROČ: katalog v lib/products.ts drží varianty jako dvojici syrové hodnoty
// ("darkblue", "gen2") a českého popisku ("Tmavě modrá"). Do košíku se ukládá
// ta syrová hodnota, takže obojí se dá přeložit přes jeden namespace `variants`
// klíčovaný hodnotou — bez zásahu do katalogu.
//
// Když hodnota v překladech není (admin přidá novou barvu), použije se to, co
// přišlo z katalogu. Radši český popisek v anglickém UI než "variants.neco".

import type { T } from "./useT";

/** Popisek varianty podle syrové hodnoty ("darkblue" → "Tmavě modrá"). */
export function variantLabel(tv: T, value: string, fallback?: string): string {
  const translated = tv(value);
  if (translated !== `variants.${value}`) return translated;
  return fallback ?? value;
}

/** Název atributu varianty ("Tělo" → "Body"). */
export function variantAttr(tv: T, attr: string): string {
  const translated = tv(`attr_${attr}`);
  return translated === `variants.attr_${attr}` ? attr : translated;
}

/** Přeloží seznam voleb z katalogu — hodnotu nechá, popisek přebije překladem. */
export function translateOptions<O extends { label: string; value: string }>(
  tv: T,
  options: O[],
): O[] {
  return options.map((o) => ({ ...o, label: variantLabel(tv, o.value, o.label) }));
}
