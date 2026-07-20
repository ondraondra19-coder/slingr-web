"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { Search, X, ArrowLeft, ArrowUpRight } from "lucide-react";
import { products as staticProducts } from "@/lib/products";
import { useCurrency } from "@/lib/CurrencyContext";
import { formatPrice, getPrice } from "@/lib/currency";
import Image from "next/image";
import { useT } from "@/lib/useT";
import { useLang } from "@/lib/LangContext";
import { getProductName, getCategoryName, categories } from "@/lib/products";
import type { Locale } from "@/lib/locale";

type SearchResult = typeof staticProducts[0] & { score: number };

// ── Helpers (fuzzy logika je stejná jako měl původní SearchBar) ────────────────

function normalize(str: string): string {
  // Odstraní diakritiku (kombinující znaky U+0300–U+036F) — regex se skládá
  // z kódů, ať soubor neobsahuje neviditelné kombinující znaky.
  const combiningMarks = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");
  return str.toLowerCase().normalize("NFD").replace(combiningMarks, "");
}

const SEARCH_SYNONYMS: Record<string, string> = {
  // EN → CZ
  "slingshot": "prak",
  "sling": "prak",
  "ammo": "munice náboje míčky",
  "ammunition": "munice náboje",
  "balls": "míčky kuličky",
  "ball": "míček kulička",
  "water": "voda vodní",
  "balloon": "balónky balónek",
  "balloons": "balónky",
  "target": "terč cíl",
  "cans": "plechovky",
  "can": "plechovka",
  "foam": "pěnové pěna",
  "bundle": "set sada",
  // SK → CZ
  "prak": "prak",
  "munícia": "munice",
  "loptičky": "míčky",
  "balóniky": "balónky",
  "terč": "terč",
  "plechovky": "plechovky",
  "penové": "pěnové",
};

function expandQuery(q: string): string {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();
  for (const word of words) {
    expanded.add(word);
    const synonyms = SEARCH_SYNONYMS[word];
    if (synonyms) synonyms.split(" ").forEach((s) => expanded.add(s));
  }
  return Array.from(expanded).join(" ");
}

function buildFuse(products: typeof staticProducts) {
  return new Fuse(products, {
    keys: [
      { name: "name", weight: 3 },
      { name: "name_en", weight: 1.5 },
      { name: "name_sk", weight: 1.5 },
      { name: "tags", weight: 2 },
      { name: "description", weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

function searchProducts(fuse: Fuse<typeof staticProducts[0]>, query: string): SearchResult[] {
  const variants = Array.from(new Set([query, ...expandQuery(query).split(" ")])).filter((v) => v.length >= 2);
  const best = new Map<string, SearchResult>();
  for (const variant of variants) {
    for (const r of fuse.search(variant)) {
      const score = 1 - (r.score ?? 1);
      const existing = best.get(r.item.slug);
      if (!existing || score > existing.score) best.set(r.item.slug, { ...r.item, score });
    }
  }
  return Array.from(best.values()).sort((a, b) => b.score - a.score).slice(0, 8);
}

function highlightMatch(text: string, query: string) {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);
  const idx = normalizedText.indexOf(normalizedQuery);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function getCategoryLabel(slug: string, locale: Locale): string {
  const category = categories.find((c) => c.slug === slug);
  return category ? getCategoryName(category, locale) : slug.replace(/-/g, " ");
}

// ── Overlay ────────────────────────────────────────────────────────────────────

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { currency } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT("search");
  const { locale } = useLang();

  // Vyhledávání jede hned se statickým katalogem a tiše se přepne na ceny z API.
  const [products, setProducts] = useState(staticProducts);
  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.products) setProducts(data.products); })
      .catch(() => {});
  }, []);

  const fuse = useMemo(() => buildFuse(products), [products]);
  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed.length > 1 ? searchProducts(fuse, trimmed) : []),
    [fuse, trimmed],
  );

  // Textové návrhy ("Návrhy") — unikátní názvy kategorií z nalezených produktů
  // plus názvy produktů. Klik návrh dopíše do dotazu.
  const suggestions = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      set.add(getCategoryLabel(r.categories[0], locale));
      set.add(getProductName(r, locale));
      if (set.size >= 6) break;
    }
    return Array.from(set).slice(0, 6);
  }, [results, locale]);

  // Fokus do inputu při otevření; zamknout scroll pozadí. Úklid po zavření
  // vyprázdní i dotaz, ať příště overlay startuje čistě.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      setQuery("");
    };
  }, [open]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        window.location.href = `/produkt/${results[0].slug}`;
      }
    },
    [results, handleClose],
  );

  if (!open) return null;

  const showResults = trimmed.length > 1;
  const showAllHref = results.length > 0 ? `/kategorie/${results[0].categories[0]}` : "/";

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={t("label")}>
      {/* Ztmavené pozadí — klik zavře */}
      <button
        aria-label={t("close")}
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-default"
      />

      {/* Panel: horní lišta + výsledky, vysouvá se odshora */}
      <div className="absolute top-0 left-0 right-0 bg-header shadow-2xl animate-[slideDown_.18s_ease-out] max-h-screen flex flex-col">
        {/* ── Horní lišta ── */}
        <div className="flex items-center gap-3 px-4 lg:px-12 h-16 border-b border-white/10 shrink-0">
          <button
            onClick={handleClose}
            aria-label={t("close")}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("barPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            aria-label={t("label")}
            className="flex-1 bg-transparent text-lg text-white placeholder-white/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label={t("clear")}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
          <Search size={20} aria-hidden="true" className="text-white/60 shrink-0" />
        </div>

        {/* ── Výsledky ── */}
        {showResults && (
          <div className="overflow-y-auto px-4 lg:px-12 py-5">
            {/* Řádek s počtem + odkaz na všechny výsledky */}
            <div className="flex items-center justify-between mb-4">
              <span aria-live="polite" className="text-white/55 text-sm">
                {t.plural(results.length, "resultsFor", { query: trimmed })}
              </span>
              {results.length > 0 && (
                <a
                  href={showAllHref}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 text-primary-ink text-sm font-medium hover:text-primary transition-colors"
                >
                  {t("showAll")}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              )}
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-white/60 text-sm">{t("noResults")}</p>
                <p className="text-white/90 text-base font-semibold mt-1">&bdquo;{trimmed}&ldquo;</p>
              </div>
            ) : (
              <>
                {/* Návrhy */}
                {suggestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white text-base font-bold mb-3">{t("suggestions")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs hover:text-white hover:border-primary/40 transition-colors"
                        >
                          {highlightMatch(s, trimmed)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produkty — 2 sloupce jako blastro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  {results.map((product) => (
                    <a
                      key={product.slug}
                      href={`/produkt/${product.slug}`}
                      onClick={handleClose}
                      className="group flex items-center gap-4 py-3 border-b border-white/5 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="relative w-14 h-14 rounded-xl border border-white/10 bg-white/5 shrink-0 overflow-hidden">
                        <Image src={product.img} alt="" fill sizes="56px" className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white">
                          {highlightMatch(getProductName(product, locale), trimmed)}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5 capitalize">
                          {getCategoryLabel(product.categories[0], locale)}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-1.5 shrink-0 text-right">
                        <span className="text-primary font-bold text-sm">
                          {formatPrice(getPrice(product.price, currency), currency)}
                        </span>
                        {product.discountPercent && product.originalPrice && (
                          <span className="text-white/40 line-through text-[11px] font-medium">
                            {formatPrice(getPrice(product.originalPrice, currency), currency)}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
