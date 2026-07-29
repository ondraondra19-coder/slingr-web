"use client";

// components/HledaniClient.tsx
// Klientská část stránky /hledani — nad katalogem a skladem ze serveru dělá
// fulltext (sdílené jádro lib/productSearch) a filtry/řazení. Prázdný dotaz =
// režim „procházení" (ukáže všechno). Merchandising: skladem napřed.

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, X, Check, Truck, Search } from "lucide-react";
import type { Product } from "@/lib/products";
import { categories, getProductName, getCategoryName, LOW_STOCK_THRESHOLD } from "@/lib/products";
import { buildFuse, searchProducts, normalize } from "@/lib/productSearch";
import { addRecentSearch } from "@/lib/recentSearches";
import { trackEvent } from "@/lib/analytics";
import { useCurrency } from "@/lib/CurrencyContext";
import { getPrice, formatPrice } from "@/lib/currency";
import { priceFilterBounds } from "@/lib/priceFilter";
import { useModalBehavior, useDismissOnOutside } from "@/lib/useModalBehavior";
import ProductPrice from "./ProductPrice";
import DualRangeSlider from "./DualRangeSlider";
import RatingWidget from "./RatingWidget";
import { useT } from "@/lib/useT";
import { useLang } from "@/lib/LangContext";
import { LOCALE_TAGS } from "@/lib/locale";

const TILE_STYLE: React.CSSProperties = {
  backgroundColor: "#eaf8f4",
  backgroundImage:
    "repeating-linear-gradient(-45deg, rgba(40,191,166,0.07) 0 16px, rgba(40,191,166,0.15) 16px 32px)",
};

function anyInStock(product: Product, stockData: Record<string, number>): boolean {
  const s = stockData[product.slug];
  if (s !== undefined) return s > 0;
  return product.inStock && product.stock > 0;
}

function maxStock(product: Product, stockData: Record<string, number>): number {
  const s = stockData[product.slug];
  if (s !== undefined) return s;
  return product.inStock ? product.stock : 0;
}

export default function HledaniClient({
  products,
  stockData = {},
  initialQuery = "",
}: {
  products: Product[];
  stockData?: Record<string, number>;
  initialQuery?: string;
}) {
  const { currency } = useCurrency();
  const t = useT("searchPage");
  const tc = useT("category");
  const ts = useT("search");
  const tp = useT("productrow");
  const { locale } = useLang();

  const [query, setQuery] = useState(initialQuery);
  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;

  // ── Filtry ─────────────────────────────────────────────────────────────────
  // Ve zvolené měně, stejně jako na kategorii — viz lib/priceFilter.ts.
  const { min: PRICE_MIN, max: PRICE_MAX, step: PRICE_STEP } =
    useMemo(() => priceFilterBounds(products, currency), [products, currency]);

  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  // Filtr na mobilu je překryv — zamkne stránku pod sebou, zavírá se Escapem.
  const closeMobileFilter = useCallback(() => setMobileFilterOpen(false), []);
  useModalBehavior(mobileFilterOpen, closeMobileFilter);

  // Rozbalené řazení se zavře ťuknutím vedle — viz KategorieClient.
  const sortRef = useRef<HTMLDivElement>(null);
  const closeSort = useCallback(() => setSortOpen(false), []);
  useDismissOnOutside(sortOpen, sortRef, closeSort);

  const sortOptions = [
    { label: t("sortRelevance"), value: "default" },
    { label: tc("sortPriceAsc"), value: "price-asc" },
    { label: tc("sortPriceDesc"), value: "price-desc" },
    { label: tc("sortNameAsc"), value: "name-asc" },
  ];

  const fuse = useMemo(() => buildFuse(products), [products]);

  // Základ: dotaz → fulltext, jinak celý katalog (režim procházení).
  const base = useMemo<Product[]>(
    () => (isSearching ? searchProducts(fuse, trimmed, 50) : products),
    [fuse, trimmed, isSearching, products],
  );

  // ── URL sync — ať je dotaz sdílitelný a funguje zpětné tlačítko. Neposouvá
  // historii (replaceState), jen aktualizuje ?q=. ─────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      if (trimmed) url.searchParams.set("q", trimmed);
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", url.toString());
    }, 400);
    return () => clearTimeout(id);
  }, [trimmed]);

  // ── Analytika (stejný vzor jako overlay) ────────────────────────────────────
  const firedRef = useRef<string>("");
  const resultsLen = base.length;
  useEffect(() => {
    if (!isSearching) return;
    const q = normalize(trimmed);
    const id = setTimeout(() => {
      if (firedRef.current === q) return;
      firedRef.current = q;
      trackEvent("search_performed", { query: q, results: resultsLen });
      if (resultsLen === 0) trackEvent("search_zero_results", { query: q });
    }, 600);
    return () => clearTimeout(id);
  }, [isSearching, trimmed, resultsLen]);

  // Po přepnutí měny jsou uložené meze ještě v té staré — zahodíme je, jinak
  // by filtr vyhodil celý sortiment. Viz stejný vzor v KategorieClient.
  const [prevCurrencyCode, setPrevCurrencyCode] = useState(currency.code);
  if (currency.code !== prevCurrencyCode) {
    setPrevCurrencyCode(currency.code);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
  }

  const priceOf = (p: Product) => getPrice(p.price, currency);

  // ── Filtrování + řazení ─────────────────────────────────────────────────────
  let filtered = base.filter((p) => {
    const price = priceOf(p);
    const inPrice = price >= priceMin && price <= priceMax;
    const inCat = selectedCats.size === 0 || p.categories.some((c) => selectedCats.has(c));
    const inStockOk = onlyInStock ? anyInStock(p, stockData) : true;
    return inPrice && inCat && inStockOk;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => priceOf(a) - priceOf(b));
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => priceOf(b) - priceOf(a));
  else if (sort === "name-asc") {
    filtered = [...filtered].sort((a, b) =>
      getProductName(a, locale).localeCompare(getProductName(b, locale), LOCALE_TAGS[locale]),
    );
  } else {
    // Relevance (default): skladem napřed, uvnitř skupiny se zachová pořadí
    // podle skóre / katalogu (stabilní rozdělení).
    filtered = [
      ...filtered.filter((p) => anyInStock(p, stockData)),
      ...filtered.filter((p) => !anyInStock(p, stockData)),
    ];
  }

  const activeFilters =
    selectedCats.size > 0 || priceMin > PRICE_MIN || priceMax < PRICE_MAX || onlyInStock;
  const currentSort = sortOptions.find((s) => s.value === sort)!;

  function resetFilters() {
    setSelectedCats(new Set());
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    setOnlyInStock(false);
  }

  function toggleCat(slug: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function FilterContent() {
    return (
      <div className="flex flex-col divide-y divide-border">
        {/* Kategorie */}
        <div>
          <button
            onClick={() => setCatOpen((v) => !v)}
            aria-expanded={catOpen}
            className="w-full flex items-center justify-between px-5 py-4 min-h-11 text-sm font-semibold text-text-base hover:text-primary-ink transition-colors"
          >
            {t("categoryFilter")}
            <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
          </button>
          {catOpen && (
            <div className="px-5 pb-5 flex flex-col gap-2.5">
              {categories.map((c) => {
                const checked = selectedCats.has(c.slug);
                return (
                  <button
                    key={c.slug}
                    onClick={() => toggleCat(c.slug)}
                    role="checkbox"
                    aria-checked={checked}
                    className="flex items-center gap-3 text-sm text-text-muted hover:text-text-base transition-colors w-full min-h-11"
                  >
                    <span aria-hidden="true" className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                      checked ? "bg-primary border-primary" : "border-border-strong"
                    }`}>
                      {checked && <Check size={11} strokeWidth={3} className="text-on-primary" />}
                    </span>
                    {getCategoryName(c, locale)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cena */}
        <div>
          <button
            onClick={() => setPriceOpen((v) => !v)}
            aria-expanded={priceOpen}
            className="w-full flex items-center justify-between px-5 py-4 min-h-11 text-sm font-semibold text-text-base hover:text-primary-ink transition-colors"
          >
            {tc("price")}
            <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${priceOpen ? "rotate-180" : ""}`} />
          </button>
          {priceOpen && (
            <div className="px-5 pb-5">
              <DualRangeSlider
                min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                formatValue={v => formatPrice(v, currency)}
                valueMin={priceMin} valueMax={priceMax}
                onChangeMin={setPriceMin} onChangeMax={setPriceMax}
                labelMin={tc("priceMin")} labelMax={tc("priceMax")}
              />
            </div>
          )}
        </div>

        {/* Dostupnost */}
        <div>
          <button
            onClick={() => setAvailOpen((v) => !v)}
            aria-expanded={availOpen}
            className="w-full flex items-center justify-between px-5 py-4 min-h-11 text-sm font-semibold text-text-base hover:text-primary-ink transition-colors"
          >
            {tc("availability")}
            <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${availOpen ? "rotate-180" : ""}`} />
          </button>
          {availOpen && (
            <div className="px-5 pb-5">
              <button
                onClick={() => setOnlyInStock((v) => !v)}
                role="checkbox"
                aria-checked={onlyInStock}
                className="flex items-center gap-3 text-sm text-text-muted hover:text-text-base transition-colors w-full min-h-11"
              >
                <span aria-hidden="true" className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                  onlyInStock ? "bg-primary border-primary" : "border-border-strong"
                }`}>
                  {onlyInStock && <Check size={11} strokeWidth={3} className="text-on-primary" />}
                </span>
                {tc("onlyInStock")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-subtle mb-5 lg:mb-8">
          <Link href="/" className="hover:text-text-muted transition-colors">{tc("home")}</Link>
          <span aria-hidden="true" className="text-border">/</span>
          <span className="text-text-muted">{t("breadcrumb")}</span>
        </nav>

        {/* Header + vyhledávací pole */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-base tracking-tight mb-4">
            {isSearching ? t("resultsHeading", { query: trimmed }) : t("title")}
          </h1>
          <div className="flex items-center gap-2 max-w-xl border border-border rounded-xl bg-white px-4 shadow-sm focus-within:border-primary/50 transition-colors">
            <Search size={18} className="text-text-subtle shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={ts("label")}
              className="flex-1 bg-transparent py-3 text-sm text-text-base placeholder-text-subtle focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label={ts("clear")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-text-subtle hover:text-text-base transition-colors shrink-0"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Počet + řazení */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-text-subtle text-sm">
            {isSearching
              ? ts.plural(filtered.length, "resultsFor", { query: trimmed })
              : tc.plural(filtered.length, "productCount")}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileFilterOpen(true)}
              aria-label={activeFilters ? tc("filterActive") : tc("filter")}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 min-h-11 rounded-xl bg-white border border-border text-text-muted text-sm hover:text-text-base transition-colors shadow-sm"
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              <span className="hidden sm:inline">{tc("filter")}</span>
              {activeFilters && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((v) => !v)}
                aria-label={tc("sortLabel", { current: currentSort.label })}
                aria-expanded={sortOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 min-h-11 rounded-xl bg-white border border-border text-text-muted text-sm hover:text-text-base transition-colors shadow-sm"
              >
                <span className="hidden sm:inline">{currentSort.label}</span>
                <span className="sm:hidden">{tc("sort")}</span>
                <ChevronDown size={13} aria-hidden="true" className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-border rounded-xl py-1.5 z-30 min-w-[180px] shadow-lg">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        sort === opt.value ? "text-primary-ink" : "text-text-muted hover:text-text-base"
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* Sidebar desktop */}
          <aside className="hidden lg:flex flex-col gap-5 w-60 xl:w-64 shrink-0 sticky top-6 self-start">
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-primary-ink" />
                  <span className="text-text-base font-semibold text-sm">{tc("filter")}</span>
                </div>
                {activeFilters && (
                  <button onClick={resetFilters} className="text-text-subtle hover:text-primary-ink text-xs transition-colors">
                    {tc("resetAll")}
                  </button>
                )}
              </div>
              {FilterContent()}
            </div>
            <RatingWidget />
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center mb-4 shadow-sm">
                  <Search size={22} className="text-text-subtle" />
                </div>
                <p className="text-text-base font-semibold">{t("noResultsTitle")}</p>
                <p className="text-text-muted text-sm mt-1">{t("noResultsDesc")}</p>
                {(activeFilters || isSearching) && (
                  <button
                    onClick={() => { resetFilters(); setQuery(""); }}
                    className="mt-5 px-5 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-105 transition-all"
                  >
                    {t("clearAll")}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filtered.map((product, i) => {
                  const inStock = anyInStock(product, stockData);
                  const best = maxStock(product, stockData);

                  const stockLabel = !inStock
                    ? { dot: "bg-red-400", text: tc("stockNone"), cls: "text-red-500" }
                    : best <= LOW_STOCK_THRESHOLD
                    ? { dot: "bg-amber-400 animate-pulse", text: tc("stockLow"), cls: "text-amber-500" }
                    : { dot: "bg-green-500", text: tc("stockOk"), cls: "text-green-600" };

                  return (
                    <a
                      key={product.slug}
                      href={`/produkt/${product.slug}`}
                      onClick={() => {
                        if (isSearching) {
                          addRecentSearch(trimmed);
                          trackEvent("search_result_clicked", { query: normalize(trimmed), slug: product.slug, position: i });
                        }
                        trackEvent("product_clicked", {
                          slug: product.slug,
                          name: product.name,
                          price: getPrice(product.price, currency),
                          currency: currency.code,
                        });
                      }}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="relative aspect-square overflow-hidden" style={TILE_STYLE}>
                        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2.5 pointer-events-none">
                          {product.discountPercent ? (
                            <span className="text-[11px] leading-none text-white bg-rose-600 rounded-lg px-2 py-1 shadow-sm">
                              {tp("sale")} <b className="font-extrabold">−{product.discountPercent}&nbsp;%</b>
                            </span>
                          ) : (
                            <span />
                          )}
                          {inStock && best > 0 && best <= LOW_STOCK_THRESHOLD && (
                            <span className="text-[11px] font-bold leading-none text-white bg-header rounded-lg px-2 py-1 shadow-sm">
                              {tp("lastPieces")}
                            </span>
                          )}
                        </div>
                        <Image
                          src={product.img}
                          alt=""
                          fill
                          className="object-contain p-5 sm:p-6 transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>

                      {/* `flex-1` + `mt-auto` u tlačítka drží tlačítka Detail
                          zarovnaná v celé řadě, i když u vyprodaného produktu
                          chybí řádek „odeslání do 24 h". */}
                      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2 border-t border-border">
                        <p className="text-text-base text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
                          {getProductName(product, locale)}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <ProductPrice
                            product={product}
                            badge={false}
                            priceClassName="text-primary-ink font-extrabold text-2xl leading-none"
                          />
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stockLabel.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stockLabel.dot}`} />
                            <span>{stockLabel.text}</span>
                          </span>
                        </div>
                        {inStock && (
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <Truck size={14} aria-hidden="true" />
                            {tp("ship24")}
                          </p>
                        )}
                        <div className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold transition-all duration-150 group-hover:brightness-105">
                          <span>{tc("detail")}</span>
                          <ChevronDown size={14} aria-hidden="true" className="-rotate-90" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          {/* Viz stejná úprava v KategorieClient — dvh, overscroll-contain a
              odsazení pod gesto-lištu iPhonu. */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[80dvh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-primary-ink" />
                <span className="text-text-base font-semibold">{tc("filter")}</span>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                aria-label={tc("closeFilters")}
                className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-text-muted hover:text-text-base hover:bg-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden bg-surface">
              {FilterContent()}
            </div>
            {activeFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 w-full py-2.5 rounded-xl border border-border text-text-muted text-sm hover:text-text-base transition-colors"
              >
                {tc("resetAllFilters")}
              </button>
            )}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-3 w-full px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:brightness-105 transition-all"
            >
              {tc("showResults", { count: filtered.length })}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
