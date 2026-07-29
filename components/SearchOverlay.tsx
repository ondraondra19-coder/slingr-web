"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Search, X, ArrowLeft, ArrowUpRight, Clock, Flame, Sparkles,
  CornerDownLeft, LayoutGrid, Lightbulb,
} from "lucide-react";
import { products as staticProducts, categories, isBundle, getProductName, getCategoryName } from "@/lib/products";
import type { Product } from "@/lib/products";
import { buildFuse, searchProducts, didYouMean, normalize } from "@/lib/productSearch";
import { getRecentSearches, addRecentSearch, clearRecentSearches } from "@/lib/recentSearches";
import { trackEvent } from "@/lib/analytics";
import { useCurrency } from "@/lib/CurrencyContext";
import { formatPrice, getPrice } from "@/lib/currency";
import Image from "next/image";
import { useT } from "@/lib/useT";
import { useLang } from "@/lib/LangContext";
import type { Locale } from "@/lib/locale";
import { useModalBehavior } from "@/lib/useModalBehavior";

// ── Helpers ────────────────────────────────────────────────────────────────────

function highlightMatch(text: string, query: string) {
  const idx = normalize(text).indexOf(normalize(query));
  if (idx === -1 || query.length < 2) return <>{text}</>;
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

// Tipy do prázdného stavu — sety napřed (merchandising), pak zbytek. Malý
// katalog nemá „bestsellery" z dat, tak ukážeme kurátorský výběr.
function featuredProducts(all: Product[]): Product[] {
  const bundlesFirst = [...all].sort((a, b) => Number(isBundle(b)) - Number(isBundle(a)));
  return bundlesFirst.slice(0, 4);
}

// ── Overlay ────────────────────────────────────────────────────────────────────

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const { currency } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT("search");
  const { locale } = useLang();

  // Vyhledávání jede hned se statickým katalogem a tiše se přepne na ceny z API.
  const [products, setProducts] = useState<Product[]>(staticProducts);
  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.products) setProducts(data.products); })
      .catch(() => {});
  }, []);

  const fuse = useMemo(() => buildFuse(products), [products]);
  const trimmed = query.trim();
  const showResults = trimmed.length > 1;

  const results = useMemo(
    () => (showResults ? searchProducts(fuse, trimmed, 8) : []),
    [fuse, trimmed, showResults],
  );

  // Kategorie, jejichž název odpovídá dotazu — ukážeme je jako rychlé odkazy.
  const categoryMatches = useMemo(() => {
    if (!showResults) return [];
    const q = normalize(trimmed);
    return categories.filter((c) => normalize(getCategoryName(c, locale)).includes(q)).slice(0, 3);
  }, [showResults, trimmed, locale]);

  // "Mysleli jste…?" jen když dotaz nic nenašel.
  const suggestion = useMemo(
    () => (showResults && results.length === 0 ? didYouMean(products, trimmed, locale) : null),
    [showResults, results.length, products, trimmed, locale],
  );

  // Textové návrhy z nalezených produktů (kategorie + názvy) — dopisují dotaz.
  const suggestions = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      set.add(getCategoryLabel(r.categories[0], locale));
      set.add(getProductName(r, locale));
      if (set.size >= 6) break;
    }
    return Array.from(set).slice(0, 6);
  }, [results, locale]);

  const featured = useMemo(() => featuredProducts(products), [products]);
  const popular = useMemo(() => categories.map((c) => getCategoryName(c, locale)), [locale]);

  // Fokus do inputu při otevření; zamknout scroll; načíst poslední hledání.
  // Úklid po zavření vyprázdní dotaz, ať příště startuje čistě.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(getRecentSearches());
    return () => {
      cancelAnimationFrame(id);
      setQuery("");
      setActiveIndex(-1);
    };
  }, [open]);

  // Zamknutí rolování (dřív rovnou tady) žije v lib/useModalBehavior.ts, ať se
  // všechny překryvy chovají stejně. Escape si overlay řeší po svém níž —
  // nejdřív maže rozepsaný dotaz a teprve prázdný zavírá.
  useModalBehavior(open);

  // Analytika hledání — až po prodlevě v psaní (jeden dotaz = jeden event),
  // ne po každém stisku. `firedRef` brání dvojímu odeslání téhož dotazu, i když
  // se počet výsledků změní po doběhnutí /api/products.
  const firedRef = useRef<string>("");
  useEffect(() => {
    if (!showResults) return;
    const q = normalize(trimmed);
    const id = setTimeout(() => {
      if (firedRef.current === q) return;
      firedRef.current = q;
      trackEvent("search_performed", { query: q, results: results.length });
      if (results.length === 0) trackEvent("search_zero_results", { query: q });
    }, 600);
    return () => clearTimeout(id);
  }, [showResults, trimmed, results.length]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Otevře produkt: uloží dotaz do posledních hledání a pošle klik do analytiky.
  const openProduct = useCallback((slug: string, position: number) => {
    addRecentSearch(trimmed);
    trackEvent("search_result_clicked", { query: normalize(trimmed), slug, position });
    window.location.href = `/produkt/${slug}`;
  }, [trimmed]);

  const goToSearchPage = useCallback(() => {
    if (trimmed.length < 2) return;
    addRecentSearch(trimmed);
    window.location.href = `/hledani?q=${encodeURIComponent(trimmed)}`;
  }, [trimmed]);

  // Klávesnice v overlayi:
  //   Enter  — bez vybraného produktu jde na stránku výsledků /hledani (i když
  //            overlay nic nenašel — tam se dá dofiltrovat). Se šipkami vybraným
  //            produktem otevře rovnou ten produkt.
  //   ← →    — pohyb po výsledcích. Pravá šipka bere z textu na první produkt
  //            jen když je kurzor na konci dotazu, levá z prvního produktu vrací
  //            zpět do textu — díky tomu jde dotaz pořád normálně opravovat
  //            šipkami, dokud se člověk nezačne pohybovat po výsledcích.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") { handleClose(); return; }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) openProduct(results[activeIndex].slug, activeIndex);
        else goToSearchPage();
        return;
      }

      if (!showResults || results.length === 0) return;

      if (e.key === "ArrowRight") {
        const input = e.currentTarget;
        const caretAtEnd =
          input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
        if (activeIndex < 0 && !caretAtEnd) return; // kurzor je v textu — nech ho psát
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowLeft") {
        if (activeIndex < 0) return; // ještě jsme v textu — normální posun kurzoru
        e.preventDefault();
        setActiveIndex((i) => i - 1); // z prvního produktu (0 → −1) zpět do textu
      }
    },
    [showResults, results, activeIndex, handleClose, openProduct, goToSearchPage],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={t("label")}>
      {/* Ztmavené pozadí — klik zavře */}
      <button
        aria-label={t("close")}
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-default"
      />

      {/* Panel: horní lišta + obsah, vysouvá se odshora */}
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
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder={t("barPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            aria-label={t("label")}
            role="combobox"
            aria-expanded={showResults}
            aria-controls="search-results"
            aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
            // Při pohybu po výsledcích schováme blikající kurzor — fokus zůstává
            // v inputu (jinak by nefungovaly další šipky ani psaní), jen už
            // nebliká, protože „pozornost" je vidět na zvýrazněném produktu.
            className={`flex-1 bg-transparent text-lg text-white placeholder-white/40 focus:outline-none ${
              activeIndex >= 0 ? "caret-transparent" : ""
            }`}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setActiveIndex(-1); inputRef.current?.focus(); }}
              aria-label={t("clear")}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
          <Search size={20} aria-hidden="true" className="text-white/60 shrink-0" />
        </div>

        {/* ── Obsah ── */}
        <div id="search-results" className="overflow-y-auto px-4 lg:px-12 py-5">

          {/* ══ Prázdný stav (než se píše) ══ */}
          {!showResults ? (
            <div className="space-y-7 pb-2">
              {/* Poslední hledání */}
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
                      <Clock size={13} aria-hidden="true" /> {t("recentTitle")}
                    </h3>
                    <button
                      onClick={() => { clearRecentSearches(); setRecent([]); }}
                      className="text-white/40 hover:text-white/80 text-xs transition-colors"
                    >
                      {t("recentClear")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/75 text-sm hover:text-white hover:border-primary/40 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Oblíbená hledání (kategorie) */}
              <div>
                <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                  <Flame size={13} aria-hidden="true" /> {t("popularTitle")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setQuery(p); inputRef.current?.focus(); }}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/75 text-sm hover:text-white hover:border-primary/40 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipy — produkty */}
              <div>
                <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={13} aria-hidden="true" /> {t("featuredTitle")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  {featured.map((product) => (
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
                          {getProductName(product, locale)}
                        </p>
                        <p className="text-white/50 text-xs mt-0.5 capitalize">{getCategoryLabel(product.categories[0], locale)}</p>
                      </div>
                      <span className="text-primary font-bold text-sm shrink-0">
                        {formatPrice(getPrice(product.price, currency), currency)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ══ Stav výsledků ══ */
            <>
              {/* Řádek s počtem + odkaz na stránku výsledků */}
              <div className="flex items-center justify-between mb-4">
                <span aria-live="polite" className="text-white/55 text-sm">
                  {t.plural(results.length, "resultsFor", { query: trimmed })}
                </span>
                {results.length > 0 && (
                  <button
                    onClick={goToSearchPage}
                    className="inline-flex items-center gap-1 text-primary-ink text-sm font-medium hover:text-primary transition-colors"
                  >
                    {t("showAll")}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                /* ── Nic nenalezeno ── */
                <div className="py-6">
                  <div className="text-center mb-6">
                    <p className="text-white/60 text-sm">{t("noResults")}</p>
                    <p className="text-white/90 text-base font-semibold mt-1">&bdquo;{trimmed}&ldquo;</p>
                    {suggestion && (
                      <p className="text-white/60 text-sm mt-3">
                        {t("didYouMean")}{" "}
                        <button
                          onClick={() => { setQuery(suggestion); inputRef.current?.focus(); }}
                          className="text-primary-ink font-semibold hover:text-primary transition-colors underline underline-offset-2"
                        >
                          {suggestion}
                        </button>
                        ?
                      </p>
                    )}
                  </div>

                  {/* Kategorie k prokliku */}
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                      <LayoutGrid size={13} aria-hidden="true" /> {t("categoriesTitle")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <a
                          key={c.slug}
                          href={`/kategorie/${c.slug}`}
                          onClick={handleClose}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/75 text-sm hover:text-white hover:border-primary/40 transition-colors"
                        >
                          {getCategoryName(c, locale)}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Tipy místo prázdna */}
                  <div>
                    <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
                      <Sparkles size={13} aria-hidden="true" /> {t("featuredTitle")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      {featured.map((product) => (
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
                              {getProductName(product, locale)}
                            </p>
                            <p className="text-white/50 text-xs mt-0.5 capitalize">{getCategoryLabel(product.categories[0], locale)}</p>
                          </div>
                          <span className="text-primary font-bold text-sm shrink-0">
                            {formatPrice(getPrice(product.price, currency), currency)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Návrhy + kategorie */}
                  {(suggestions.length > 0 || categoryMatches.length > 0) && (
                    <div className="mb-6 space-y-4">
                      {categoryMatches.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-2.5">
                            <LayoutGrid size={13} aria-hidden="true" /> {t("categoriesTitle")}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {categoryMatches.map((c) => (
                              <a
                                key={c.slug}
                                href={`/kategorie/${c.slug}`}
                                onClick={handleClose}
                                className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-white text-xs hover:border-primary/50 transition-colors"
                              >
                                {getCategoryName(c, locale)}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-2.5">
                            <Lightbulb size={13} aria-hidden="true" /> {t("suggestions")}
                          </h3>
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
                    </div>
                  )}

                  {/* Produkty — klávesová navigace šipkami, Enter otevře zvýrazněný */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1" role="listbox">
                    {results.map((product, i) => (
                      <button
                        key={product.slug}
                        id={`search-option-${i}`}
                        type="button"
                        role="option"
                        aria-selected={i === activeIndex}
                        onClick={() => openProduct(product.slug, i)}
                        className={`group flex items-center gap-4 py-3 border-b border-white/5 rounded-lg px-2 -mx-2 transition-colors text-left w-full ${
                          i === activeIndex ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl border border-white/10 bg-white/5 shrink-0 overflow-hidden">
                          <Image src={product.img} alt="" fill sizes="56px" className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white">
                            {highlightMatch(getProductName(product, locale), trimmed)}
                          </p>
                          <p className="text-white/50 text-xs mt-0.5 capitalize">{getCategoryLabel(product.categories[0], locale)}</p>
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
                      </button>
                    ))}
                  </div>

                  {/* Nápověda ke klávesnici — jen desktop */}
                  <div className="hidden md:flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-white/35 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans">←</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans">→</kbd>
                      {t("navigate")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans"><CornerDownLeft size={11} aria-hidden="true" /></kbd>
                      {t("openHint")}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
