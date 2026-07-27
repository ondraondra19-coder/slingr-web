// lib/productSearch.ts
// Sdílené jádro vyhledávání produktů — používá ho overlay v hlavičce
// (components/SearchOverlay.tsx) i stránka výsledků (app/hledani). Díky tomu
// mají OBĚ místa stejnou relevanci, stejná synonyma i stejnou normalizaci
// diakritiky; dřív žila logika jen v overlayi a stránka výsledků neexistovala.
//
// Katalog je malý (jednotky produktů), takže fuzzy hledání na klientu přes
// Fuse.js bohatě stačí — žádný externí search engine (Algolia/Typesense) ani
// vektory nedávají u téhle velikosti smysl (viz research v plánu). „Chytrost"
// je tady v porozumění dotazu (synonyma, překlepy, diakritika) a v UX.

import Fuse from "fuse.js";
import type { Product } from "./products";
import { categories, getCategoryName, getProductName } from "./products";
import type { Locale } from "./locale";

export type ScoredProduct = Product & { score: number };

// ── Normalizace ─────────────────────────────────────────────────────────────
// Sundá diakritiku (kombinující znaky U+0300–U+036F), ať „balonky" najde
// „balónky" a naopak. Regex se skládá z kódů, aby soubor neobsahoval
// neviditelné kombinující znaky.
export function normalize(str: string): string {
  const combiningMarks = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");
  return str.toLowerCase().normalize("NFD").replace(combiningMarks, "");
}

// ── Synonyma ────────────────────────────────────────────────────────────────
// Mapuje, co člověk NAPÍŠE (anglicky, slovensky, hovorově, s překlepem v
// terminologii), na kanonické CZ termíny, které reálně jsou v názvech a tazích
// produktů. Klíč i hodnoty jsou bez diakritiky malými písmeny.
//
// UDRŽOVÁNÍ: nejcennější synonyma vycházejí z reálných dotazů BEZ VÝSLEDKU —
// admin report „Hledání bez výsledku" (AnalyticsPanel) je zdroj, ze kterého se
// sem doplňuje. Projít ho jednou za čas a přidat, co lidi hledají jinak.
export const SEARCH_SYNONYMS: Record<string, string> = {
  // ── prak ──
  slingshot: "prak",
  sling: "prak",
  catapult: "prak",
  katapult: "prak",
  prakovnice: "prak",
  // ── munice / míčky ──
  ammo: "munice naboje micky",
  ammunition: "munice naboje",
  naboje: "munice micky",
  projektily: "munice micky",
  balls: "micky kulicky",
  ball: "micek kulicka",
  kulicky: "micky",
  lopticky: "micky",
  koule: "micky",
  // ── vodní balónky ──
  water: "voda vodni",
  balloon: "balonky balonek",
  balloons: "balonky",
  bomby: "balonky vodni",
  "vodni bomby": "balonky vodni",
  "water bombs": "balonky vodni",
  waterbomb: "balonky vodni",
  // ── terč ──
  target: "terc cil",
  cil: "terc",
  targets: "terc",
  // ── plechovky / pěna ──
  cans: "plechovky",
  can: "plechovka",
  tin: "plechovky",
  foam: "penove pena",
  pena: "penove",
  molitan: "penove",
  // ── sety ──
  bundle: "set sada balicek",
  kit: "set sada",
  package: "set sada balicek",
  sada: "set",
  balicek: "set",
  starter: "startovaci set",
  // ── kategorie / vlastnosti ──
  weapon: "zbrane prak",
  weapons: "zbrane prak",
  blaster: "zbrane prak",
  accessories: "prislusenstvi",
  doplnky: "prislusenstvi",
  gift: "darek",
  present: "darek",
  darkovy: "darek",
  kids: "deti detsky",
  children: "deti",
  detsky: "deti",
  garden: "zahrada venku",
  yard: "zahrada venku",
  outdoor: "venku zahrada",
  summer: "leto letni",
  letni: "leto",
  // ── SK → CZ ──
  munícia: "munice",
  balóniky: "balonky",
  penové: "penove",
  darček: "darek",
  deti: "deti",
  záhrada: "zahrada",
  leto: "leto",
};

/** Rozšíří dotaz o synonyma (po slovech), vše bez diakritiky. */
export function expandQuery(q: string): string {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();
  for (const word of words) {
    expanded.add(word);
    const synonyms = SEARCH_SYNONYMS[word];
    if (synonyms) synonyms.split(" ").forEach((s) => expanded.add(s));
  }
  return Array.from(expanded).join(" ");
}

// ── Fuse ────────────────────────────────────────────────────────────────────
// Váhy: název > tagy > sekundární názvy > popis. `threshold 0.4` = přátelské
// k překlepům, `ignoreLocation` = shoda kdekoli v textu, ne jen na začátku.
export function buildFuse(products: Product[]): Fuse<Product> {
  return new Fuse(products, {
    keys: [
      { name: "name", weight: 3 },
      { name: "name_en", weight: 1.5 },
      { name: "name_sk", weight: 1.5 },
      { name: "tags", weight: 2 },
      { name: "description", weight: 1 },
      { name: "description_en", weight: 0.5 },
      { name: "description_sk", weight: 0.5 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

/**
 * Vyhledá produkty pro daný dotaz. Hledá jak přesně zadaný text, tak každou
 * jeho synonymickou variantu, a bere pro každý produkt nejlepší dosažené skóre
 * (0–1, vyšší = lepší). Řadí sestupně podle skóre.
 */
export function searchProducts(
  fuse: Fuse<Product>,
  query: string,
  limit = 8,
): ScoredProduct[] {
  const variants = Array.from(
    new Set([normalize(query), ...expandQuery(query).split(" ")]),
  ).filter((v) => v.length >= 2);

  const best = new Map<string, ScoredProduct>();
  for (const variant of variants) {
    for (const r of fuse.search(variant)) {
      const score = 1 - (r.score ?? 1);
      const existing = best.get(r.item.slug);
      if (!existing || score > existing.score) best.set(r.item.slug, { ...r.item, score });
    }
  }
  return Array.from(best.values()).sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * „Mysleli jste…?" — pro dotaz bez výsledků najde nejbližší reálný termín
 * (název produktu, tag nebo název kategorie) v aktuálním jazyce. Vrací null,
 * když ani volnější shoda nic nenajde.
 */
export function didYouMean(products: Product[], query: string, locale: Locale): string | null {
  const terms = new Map<string, string>(); // normalizovaný -> originál k zobrazení
  const add = (t?: string) => { if (t) terms.set(normalize(t), t); };

  for (const p of products) {
    add(getProductName(p, locale));
    (p.tags ?? []).forEach(add);
  }
  categories.forEach((c) => add(getCategoryName(c, locale)));

  const dict = Array.from(terms, ([norm, term]) => ({ norm, term }));
  const fuse = new Fuse(dict, {
    keys: ["norm"],
    threshold: 0.5,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });

  const hit = fuse.search(normalize(query))[0];
  return hit ? hit.item.term : null;
}
