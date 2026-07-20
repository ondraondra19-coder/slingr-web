"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  getProductBySlug,
  getProductCombinations,
  isBundle,
  type Product,
  type PriceValue,
} from "@/lib/products";

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
  // Slevy: klíč "slug" nebo "slug::modelId" → procento slevy. Z něj + základní
  // ceny se v editoru dopočítá zlevněná cena, kterou admin může přímo přepsat.
  discounts: Record<string, number>;
  initialQuery?: string;
};

// Z procenta slevy a základní CZK ceny dopočítá zlevněnou cenu (zaokrouhlenou
// na celé koruny). 0 = bez slevy.
function saleFromPercent(baseCZK: number, percent: number | undefined): number {
  if (!percent || percent < 1 || baseCZK <= 0) return 0;
  return Math.max(0, Math.round(baseCZK * (1 - percent / 100)));
}

// Z původní a zlevněné CZK ceny dopočítá procento slevy. <= 0 nebo >= základ
// znamená „bez slevy" (0).
function percentFromSale(baseCZK: number, saleCZK: number): number {
  if (saleCZK <= 0 || baseCZK <= 0 || saleCZK >= baseCZK) return 0;
  return (1 - saleCZK / baseCZK) * 100;
}

export default function ProductsAdminList({ products, stock, discounts, initialQuery }: ProductsAdminListProps) {
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

  // Zlevněné ceny (CZK) — stejný klíč jako ceny. 0 = bez slevy. Init z předaných
  // procent slev + základní CZK ceny.
  const buildInitialSale = () => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      initial[p.slug] = saleFromPercent(normalizePrice(p.price).CZK, discounts[p.slug]);
      p.models?.forEach((m) => {
        const key = `${p.slug}::${m.id}`;
        initial[key] = saleFromPercent(normalizePrice(m.price).CZK, discounts[key]);
      });
    });
    return initial;
  };

  const [currentSale, setCurrentSale] = useState<Record<string, number>>(buildInitialSale);
  const [savedSale, setSavedSale] = useState<Record<string, number>>(buildInitialSale);

  const [savingAll, setSavingAll] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery ?? "");

  const changedStockKeys = Object.keys(currentStock).filter((k) => currentStock[k] !== savedStock[k]);
  const changedPriceKeys = Object.keys(currentPrices).filter((k) => !priceEquals(currentPrices[k], savedPrices[k]));
  const changedSaleKeys = Object.keys(currentSale).filter((k) => (currentSale[k] ?? 0) !== (savedSale[k] ?? 0));
  const changedCount = changedStockKeys.length + changedPriceKeys.length + changedSaleKeys.length;

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

  const handleSaleChange = (key: string, value: number) => {
    setCurrentSale((prev) => ({ ...prev, [key]: Math.max(0, value) }));
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

      if (changedSaleKeys.length > 0) {
        // Zlevněnou cenu (CZK) převedeme na procento z aktuální základní ceny.
        // 0 / >= základ = sleva se zruší (percent 0 → server smaže).
        const entries = changedSaleKeys.map((key) => {
          const [slug, modelId] = key.split("::");
          const baseCZK = currentPrices[key]?.CZK ?? 0;
          const percent = percentFromSale(baseCZK, currentSale[key] ?? 0);
          return { slug, modelId: modelId || undefined, percent };
        });
        requests.push(
          fetch("/api/admin/product-discounts", {
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
      setSavedSale((prev) => ({ ...prev, ...currentSale }));
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

    // Sklad setu se needituje — dopočítává se z komponent (lib/stock.ts).
    // Ukazujeme ho jen pro čtení, ať je vidět, kolik setů zrovna jde složit;
    // server by zápis stejně zahodil a editovatelné pole by jen mátlo.
    const slug = comboKey.split("|")[0];
    const product = getProductBySlug(slug);
    if (product && isBundle(product)) {
      const parts = product.bundle!.map((b) => `${b.quantity}× ${b.slug}`).join(" + ");
      return (
        <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
          <div
            title={`Dopočítáno ze skladu komponent: ${parts}`}
            className="flex items-center gap-1.5 border border-dashed border-zinc-300 rounded-lg px-2.5 py-1 bg-zinc-50"
          >
            <span className="text-xs font-bold font-mono text-zinc-700">{currentQty}</span>
            <span className="text-[10px] text-zinc-400 font-medium">ze setu</span>
          </div>
        </div>
      );
    }

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

    // Zlevněná cena (CZK) + dopočítané procento pro tenhle klíč.
    const baseCZK = current.CZK ?? 0;
    const saleCZK = currentSale[priceKey] ?? 0;
    const saleChanged = (currentSale[priceKey] ?? 0) !== (savedSale[priceKey] ?? 0);
    const salePercent = Math.round(percentFromSale(baseCZK, saleCZK));
    const saleActive = salePercent >= 1;

    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
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

        {/* Zlevněná cena — admin zadá cílovou CZK cenu, procento se dopočítá
            a při uložení se aplikuje na EUR/USD. Prázdné / 0 = bez slevy. */}
        <div className="flex items-center gap-1 pl-1.5 ml-0.5 border-l border-[#e5e7eb]">
          <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400">Sleva</span>
          <div
            className={`flex items-center border rounded-lg px-1.5 py-0.5 transition-colors ${
              saleChanged ? "bg-rose-100 border-rose-300" : saleActive ? "bg-rose-50 border-rose-200" : "bg-[#f1f1f1] border-[#e5e7eb]"
            }`}
          >
            <input
              type="number"
              step="1"
              min={0}
              placeholder="—"
              value={saleCZK || ""}
              onChange={(e) => handleSaleChange(priceKey, parseFloat(e.target.value) || 0)}
              className="w-12 bg-transparent text-right text-xs font-bold font-mono text-rose-700 placeholder-zinc-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] font-mono text-rose-300 ml-0.5">Kč</span>
          </div>
          <span className={`text-[10px] font-bold font-mono w-10 text-left ${saleActive ? "text-rose-600" : "text-zinc-300"}`}>
            {saleActive ? `−${salePercent} %` : "—"}
          </span>
        </div>
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
              <th className="pb-3 text-right">Cena / sleva</th>
              <th className="pb-3 text-right pr-2 w-40">Skladem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-xs text-zinc-400 font-mono">
                  Žádné produkty neodpovídají vyhledávání.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                // Katalog praků nemá barvy, velikosti ani modely — každý produkt
                // je jediná skladová položka pod klíčem `slug|-|-`, takže se cena
                // i sklad edituje rovnou v řádku a nic se nerozklikává.
                const comboKey = `${product.slug}|-|-`;
                const qty = currentStock[comboKey] ?? 0;

                // Pojistka pro případ, že by někdo do katalogu vrátil varianty:
                // řádek by editoval jen první kombinaci a zbytek by tiše zmizel,
                // proto radši řekneme rovnou, že na tenhle produkt tabulka nestačí.
                const hasVariants = getProductCombinations(product).length > 1;

                return (
                  <tr key={product.slug} className="group hover:bg-[#fcfbf9]/60 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f1f1f3] border border-[#e5e7eb] overflow-hidden flex-shrink-0 relative">
                          <Image src={product.img} alt={product.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#0f0f10] leading-tight truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5 truncate">
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      {hasVariants ? (
                        <div className="text-right text-[10px] font-mono text-amber-700">
                          produkt má varianty — uprav v kódu
                        </div>
                      ) : (
                        renderPriceControls(product.slug)
                      )}
                    </td>

                    <td className="py-3 pr-2">
                      <div className="flex items-center justify-end gap-2">
                        {!hasVariants && qty === 0 && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 uppercase tracking-wider">
                            Vyprodáno
                          </span>
                        )}
                        {!hasVariants && renderVariantControls(comboKey)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}