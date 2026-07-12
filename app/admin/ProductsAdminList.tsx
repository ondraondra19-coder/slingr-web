"use client";

import React, { useState, Fragment } from "react";
import type { Product, PriceValue } from "@/lib/products";

function formatPrice(price: Product["price"]): string {
  if (typeof price === "number") {
    return `${price} Kč`;
  }
  return `${price.CZK} Kč`;
}

// Sjednotí PriceValue (může to být holé číslo NEBO objekt {CZK,EUR,USD})
// do plného objektu, ať se s tím v editoru pracuje jednotně.
function normalizePrice(price: PriceValue): { CZK: number; EUR?: number; USD?: number } {
  if (typeof price === "number") return { CZK: price };
  return { CZK: price.CZK, EUR: price.EUR, USD: price.USD };
}

function priceEquals(a: { CZK: number; EUR?: number; USD?: number }, b: { CZK: number; EUR?: number; USD?: number }): boolean {
  return a.CZK === b.CZK && (a.EUR ?? null) === (b.EUR ?? null) && (a.USD ?? null) === (b.USD ?? null);
}

type ProductsAdminListProps = {
  products: Product[];
  stock: Record<string, number>;
};

type Combination = {
  color?: string;
  size?: string;
};

function getProductCombinations(product: Product): Combination[] {
  const combos: Combination[] = [];

  if (product.models && product.models.length > 0) {
    product.models.forEach((model) => {
      if (model.colors && model.colors.length > 0) {
        model.colors.forEach((color) => {
          if (model.layered) {
            combos.push({ color: `${color.value}__body`, size: model.id });
            combos.push({ color: `${color.value}__cap`, size: model.id });
          } else {
            combos.push({ color: color.value, size: model.id });
          }
        });
      } else {
        combos.push({ size: model.id });
      }
    });
  } else {
    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;

    if (hasColors && hasSizes) {
      product.colors!.forEach((color) => {
        product.sizes!.forEach((size) => {
          combos.push({ color: color.value, size: size.value });
        });
      });
    } else if (hasColors) {
      product.colors!.forEach((color) => {
        combos.push({ color: color.value });
      });
    } else if (hasSizes) {
      product.sizes!.forEach((size) => {
        combos.push({ size: size.value });
      });
    } else {
      combos.push({});
    }
  }

  return combos;
}

export default function ProductsAdminList({ products, stock }: ProductsAdminListProps) {
  const buildInitialStock = () => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      const combos = getProductCombinations(p);
      combos.forEach((c) => {
        const key = `${p.slug}|${c.color ?? "-"}|${c.size ?? "-"}`;
        initial[key] = stock[key] ?? 0;
      });
    });
    return initial;
  };

  const [currentStock, setCurrentStock] = useState<Record<string, number>>(buildInitialStock);
  // Poslední potvrzený (uložený) stav — proti tomuhle se porovnává, jestli je varianta "změněná".
  const [savedStock, setSavedStock] = useState<Record<string, number>>(buildInitialStock);

  // Ceny — klíč je buď "slug" (základní cena produktu), nebo "slug::modelId"
  // (cena konkrétního modelu u produktů s variantami typu "models").
  const buildInitialPrices = () => {
    const initial: Record<string, { CZK: number; EUR?: number; USD?: number }> = {};
    products.forEach((p) => {
      initial[p.slug] = normalizePrice(p.price);
      p.models?.forEach((m) => {
        initial[`${p.slug}::${m.id}`] = normalizePrice(m.price);
      });
    });
    return initial;
  };

  const [currentPrices, setCurrentPrices] = useState(buildInitialPrices);
  const [savedPrices, setSavedPrices] = useState(buildInitialPrices);

  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>({});
  const [expandedSubKeys, setExpandedSubKeys] = useState<Record<string, boolean>>({});
  const [savingAll, setSavingAll] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const changedStockKeys = Object.keys(currentStock).filter((k) => currentStock[k] !== savedStock[k]);
  const changedPriceKeys = Object.keys(currentPrices).filter((k) => !priceEquals(currentPrices[k], savedPrices[k]));
  const changedCount = changedStockKeys.length + changedPriceKeys.length;

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleSubExpand = (subKey: string) => {
    setExpandedSubKeys((prev) => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const handleStockChange = (key: string, value: number) => {
    setCurrentStock((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const handlePriceChange = (key: string, currency: "CZK" | "EUR" | "USD", value: number) => {
    setCurrentPrices((prev) => ({
      ...prev,
      [key]: { ...prev[key], [currency]: Math.max(0, value) },
    }));
  };

  // Uloží VŠECHNY změněné varianty i ceny napříč všemi produkty najednou.
  const handleSaveAll = async () => {
    if (changedCount === 0) return;
    setSavingAll(true);
    setSaveError(null);
    try {
      const requests: Promise<Response>[] = [];

      if (changedStockKeys.length > 0) {
        const entries = changedStockKeys.map((key) => {
          const [slug, color, size] = key.split("|");
          return {
            slug,
            color: color === "-" ? undefined : color,
            size: size === "-" ? undefined : size,
            value: currentStock[key],
          };
        });
        requests.push(
          fetch("/api/admin/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries }),
          }),
        );
      }

      if (changedPriceKeys.length > 0) {
        const entries = changedPriceKeys.map((key) => {
          const [slug, modelId] = key.split("::");
          return { slug, modelId: modelId || undefined, price: currentPrices[key] };
        });
        requests.push(
          fetch("/api/admin/prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries }),
          }),
        );
      }

      const results = await Promise.all(requests);
      for (const res of results) {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Uložení se nezdařilo.");
        }
      }

      setSavedStock((prev) => ({ ...prev, ...currentStock }));
      setSavedPrices((prev) => ({ ...prev, ...currentPrices }));
    } catch (error) {
      console.error("Chyba při ukládání:", error);
      setSaveError(error instanceof Error ? error.message : "Uložení se nezdařilo.");
    } finally {
      setSavingAll(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderVariantControls = (comboKey: string) => {
    const currentQty = currentStock[comboKey] ?? 0;
    const hasChanged = currentQty !== (savedStock[comboKey] ?? 0);

    return (
      <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
        <div
          className={`flex items-center border rounded-lg p-0.5 w-24 justify-between transition-colors ${
            hasChanged ? "bg-zinc-200 border-zinc-400" : "bg-[#f1f1f1] border-[#e5e7eb]"
          }`}
        >
          <button
            type="button"
            onClick={() => handleStockChange(comboKey, currentQty - 1)}
            className="w-5 h-5 rounded bg-white flex items-center justify-center text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 shadow-sm active:scale-95 transition-all"
          >
            –
          </button>
          <input
            type="number"
            value={currentQty}
            onChange={(e) => handleStockChange(comboKey, parseInt(e.target.value) || 0)}
            className="w-8 bg-transparent text-center text-xs font-bold font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => handleStockChange(comboKey, currentQty + 1)}
            className="w-5 h-5 rounded bg-white flex items-center justify-center text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 shadow-sm active:scale-95 transition-all"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const renderPriceControls = (priceKey: string) => {
    const current = currentPrices[priceKey] ?? { CZK: 0 };
    const saved = savedPrices[priceKey] ?? { CZK: 0 };
    const hasChanged = !priceEquals(current, saved);

    const fields: { code: "CZK" | "EUR" | "USD"; symbol: string }[] = [
      { code: "CZK", symbol: "Kč" },
      { code: "EUR", symbol: "€" },
      { code: "USD", symbol: "$" },
    ];

    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {fields.map(({ code, symbol }) => {
          // EUR/USD nemusí být u produktu vyplněné vůbec — pak pole nezobrazujeme,
          // ať editor nenutí zadávat měny, které produkt v katalogu nemá.
          if (code !== "CZK" && current[code] === undefined && saved[code] === undefined) return null;
          return (
            <div
              key={code}
              className={`flex items-center border rounded-lg px-1.5 py-0.5 transition-colors ${
                hasChanged ? "bg-zinc-200 border-zinc-400" : "bg-[#f1f1f1] border-[#e5e7eb]"
              }`}
            >
              <input
                type="number"
                step="0.01"
                value={current[code] ?? 0}
                onChange={(e) => handlePriceChange(priceKey, code, parseFloat(e.target.value) || 0)}
                className="w-12 bg-transparent text-right text-xs font-bold font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] font-mono text-zinc-400 ml-0.5">{symbol}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Plovoucí lišta — "fixed" (ne "sticky"), takže nepatří do normálního toku stránky
          a její objevení/zmizení nezpůsobí posun zbytku obsahu. Zůstává viditelná a klikatelná
          i po scrollu, protože je ukotvená k viewportu, ne ke kontejneru seznamu. */}
      {changedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-[calc(100vw-2rem)] bg-[#1c1c1c] text-white rounded-3xl sm:rounded-full pl-5 pr-2 py-2 shadow-2xl">
          <span className="text-xs font-semibold whitespace-nowrap">
            {changedCount} {changedCount === 1 ? "neuložená změna" : changedCount >= 2 && changedCount <= 4 ? "neuložené změny" : "neuložených změn"}
          </span>
          {saveError && <span className="text-[11px] text-rose-300">{saveError}</span>}
          <button
            type="button"
            disabled={savingAll}
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-full text-[11px] font-bold bg-white text-[#0f0f10] hover:bg-zinc-200 disabled:opacity-60 transition-all whitespace-nowrap"
          >
            {savingAll ? "Ukládám…" : "Uložit všechny změny"}
          </button>
        </div>
      )}

      <div className="flex gap-4 justify-between items-center border-b border-[#e5e7eb] pb-5">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Hledat produkt podle názvu nebo slugu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f1f3] border border-[#e5e7eb] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0f0f10] placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
          />
        </div>
        <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
          Nalezeno produktů: {filteredProducts.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5e7eb] text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-mono">
              <th className="pb-3 pl-2">Produkt</th>
              <th className="pb-3 hidden md:table-cell">Základní cena</th>
              <th className="pb-3 text-center w-36">Počet variant</th>
              <th className="pb-3 text-center w-36">Vyprodané var.</th>
              <th className="pb-3 text-right pr-2">Správa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 font-mono">
                  Žádné produkty neodpovídají vyhledávání.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const combos = getProductCombinations(product);
                const isExpanded = !!expandedSlugs[product.slug];

                const emptyVariantsCount = combos.reduce((count, c) => {
                  const key = `${product.slug}|${c.color ?? "-"}|${c.size ?? "-"}`;
                  return (currentStock[key] ?? 0) === 0 ? count + 1 : count;
                }, 0);

                return (
                  <Fragment key={product.slug}>
                    <tr 
                      onClick={() => toggleExpand(product.slug)}
                      className={`group cursor-pointer transition-colors ${isExpanded ? "bg-[#fcfbf9]" : "hover:bg-[#fcfbf9]/60"}`}
                    >
                      <td className="py-4 pl-2 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f1f1f3] border border-[#e5e7eb] overflow-hidden flex-shrink-0 relative">
                          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0f0f10] leading-tight group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{product.slug}</span>
                        </div>
                      </td>

                      <td className="py-4 text-xs font-semibold text-[#0f0f10] hidden md:table-cell">
                        {formatPrice(product.price)}
                      </td>

                      <td className="py-4 text-center text-xs font-mono font-medium text-zinc-600">
                        {combos.length}x
                      </td>

                      <td className="py-4 text-center">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          emptyVariantsCount === combos.length
                            ? "bg-rose-50 text-rose-700" 
                            : emptyVariantsCount > 0
                            ? "bg-amber-50 text-amber-700" 
                            : "bg-zinc-100 text-zinc-400 font-normal" 
                        }`}>
                          {emptyVariantsCount} {emptyVariantsCount === 1 ? "varianta" : emptyVariantsCount >= 2 && emptyVariantsCount <= 4 ? "varianty" : "variant"}
                        </span>
                      </td>

                      <td className="py-4 text-right pr-2">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] bg-white text-[11px] font-semibold text-zinc-600 hover:bg-[#f1f1f3] hover:text-[#0f0f10] transition-all flex items-center space-x-1 ml-auto"
                        >
                          <span>{isExpanded ? "Zavřít" : "Upravit sklad a cenu"}</span>
                          <svg 
                            className={`w-3 h-3 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-[#fdfdfd] border-l-2 border-[#1c1c1c] p-0">
                          <div className="px-4 py-4 bg-[#fcfbf9]/40 border-b border-[#e5e7eb]/60 space-y-4">

                            {(!product.models || product.models.length === 0) && (
                              <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0f0f10]">Základní cena</span>
                                {renderPriceControls(product.slug)}
                              </div>
                            )}

                            {product.models && product.models.length > 0 ? (
                              product.models.map((model) => (
                                <div key={model.id} className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden shadow-sm">
                                  <div className="bg-[#f1f1f3]/50 px-3 py-2 border-b border-[#e5e7eb] flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-bold text-[#0f0f10] font-mono uppercase tracking-wider">
                                      {model.label}
                                    </span>
                                    {renderPriceControls(`${product.slug}::${model.id}`)}
                                  </div>
                                  
                                  <div className="divide-y divide-[#e5e7eb]/50">
                                    {model.colors?.map((color) => {
                                      if (model.layered) {
                                        const subKey = `${product.slug}|${model.id}|${color.value}`;
                                        const isSubExpanded = !!expandedSubKeys[subKey];
                                        const bodyKey = `${product.slug}|${color.value}__body|${model.id}`;
                                        const capKey = `${product.slug}|${color.value}__cap|${model.id}`;
                                        
                                        // Využití Math.min pro reálnou sestavitelnost kompletního produktu
                                        const colorAvailable = Math.min(
                                          currentStock[bodyKey] ?? 0,
                                          currentStock[capKey] ?? 0
                                        );

                                        return (
                                          <div key={color.value} className="flex flex-col">
                                            <div 
                                              onClick={() => toggleSubExpand(subKey)}
                                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#faf9f6]/40 transition-colors"
                                            >
                                              <div className="flex items-center space-x-2.5">
                                                {color.hex && <span className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: color.hex }} />}
                                                <span className="text-xs font-bold text-[#0f0f10]">{color.label}</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                                  colorAvailable === 0 ? "bg-rose-50 text-rose-600" : "bg-zinc-100 text-zinc-600"
                                                }`}>
                                                  {colorAvailable} ks
                                                </span>
                                                <svg 
                                                  className={`w-3 h-3 text-zinc-400 transform transition-transform duration-150 ${isSubExpanded ? "rotate-180" : ""}`} 
                                                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                              </div>
                                            </div>

                                            {isSubExpanded && (
                                              <div className="bg-[#fcfbf9]/60 border-t border-[#e5e7eb]/40 divide-y divide-[#e5e7eb]/40 pl-8 pr-3 py-0.5">
                                                <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                                                  <div className="space-y-0.5">
                                                    <div className="text-xs font-semibold text-zinc-700">{color.label} — Tělo</div>
                                                    <div className="text-[9px] font-mono text-zinc-400">{bodyKey}</div>
                                                  </div>
                                                  {renderVariantControls(bodyKey)}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                                                  <div className="space-y-0.5">
                                                    <div className="text-xs font-semibold text-zinc-700">{color.label} — Hlava</div>
                                                    <div className="text-[9px] font-mono text-zinc-400">{capKey}</div>
                                                  </div>
                                                  {renderVariantControls(capKey)}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } else {
                                        const comboKey = `${product.slug}|${color.value}|${model.id}`;
                                        return (
                                          <div key={color.value} className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-[#faf9f6]/30 transition-colors">
                                            <div className="flex items-center space-x-2.5">
                                              {color.hex && <span className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: color.hex }} />}
                                              <div>
                                                <span className="text-xs font-bold text-[#0f0f10]">{color.label}</span>
                                                <span className="text-[9px] font-mono text-zinc-400 block">{comboKey}</span>
                                              </div>
                                            </div>
                                            {renderVariantControls(comboKey)}
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              ))
                            ) : (
                              (() => {
                                const hasColors = product.colors && product.colors.length > 0;
                                const hasSizes = product.sizes && product.sizes.length > 0;

                                if (hasColors && hasSizes) {
                                  return product.sizes!.map((size) => (
                                    <div key={size.value} className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden shadow-sm">
                                      <div className="bg-[#f1f1f3]/50 px-3 py-2 border-b border-[#e5e7eb] text-[10px] font-bold text-[#0f0f10] font-mono uppercase tracking-wider">
                                        {size.label}
                                      </div>
                                      <div className="divide-y divide-[#e5e7eb]/50">
                                        {product.colors!.map((color) => {
                                          const comboKey = `${product.slug}|${color.value}|${size.value}`;
                                          return (
                                            <div key={color.value} className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-[#faf9f6]/30 transition-colors">
                                              <div className="flex items-center space-x-2.5">
                                                {color.hex && <span className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: color.hex }} />}
                                                <div>
                                                  <span className="text-xs font-bold text-[#0f0f10]">{color.label}</span>
                                                  <span className="text-[9px] font-mono text-zinc-400 block">{comboKey}</span>
                                                </div>
                                              </div>
                                              {renderVariantControls(comboKey)}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ));
                                } else if (hasColors) {
                                  return (
                                    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-[#e5e7eb]/50">
                                      {product.colors!.map((color) => {
                                        const comboKey = `${product.slug}|${color.value}|-`;
                                        return (
                                          <div key={color.value} className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-[#faf9f6]/30 transition-colors">
                                            <div className="flex items-center space-x-2.5">
                                              {color.hex && <span className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: color.hex }} />}
                                              <div>
                                                <span className="text-xs font-bold text-[#0f0f10]">{color.label}</span>
                                                <span className="text-[9px] font-mono text-zinc-400 block">{comboKey}</span>
                                              </div>
                                            </div>
                                            {renderVariantControls(comboKey)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                } else if (hasSizes) {
                                  return (
                                    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-[#e5e7eb]/50">
                                      {product.sizes!.map((size) => {
                                        const comboKey = `${product.slug}|-|${size.value}`;
                                        return (
                                          <div key={size.value} className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-[#faf9f6]/30 transition-colors">
                                            <div>
                                              <span className="text-xs font-bold text-[#0f0f10]">{size.label}</span>
                                              <span className="text-[9px] font-mono text-zinc-400 block">{comboKey}</span>
                                            </div>
                                            {renderVariantControls(comboKey)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                } else {
                                  const comboKey = `${product.slug}|-|-`;
                                  return (
                                    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden shadow-sm p-3 flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <span className="text-xs font-bold text-[#0f0f10]">Základní varianta</span>
                                        <span className="text-[9px] font-mono text-zinc-400 block">{comboKey}</span>
                                      </div>
                                      {renderVariantControls(comboKey)}
                                    </div>
                                  );
                                }
                              })()
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}