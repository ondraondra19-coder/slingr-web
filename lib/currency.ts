// lib/currency.ts
// ─────────────────────────────────────────────────────────────────────────────
// Definice měn — kurzy se NEPOUŽÍVAJÍ, ceny jsou zadané přímo v products.ts
// ─────────────────────────────────────────────────────────────────────────────

export type CurrencyCode = "CZK" | "EUR" | "USD";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  symbolBefore: boolean; // true = $9.99, false = 9 Kč
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  CZK: { code: "CZK", symbol: "Kč", decimals: 0, symbolBefore: false },
  EUR: { code: "EUR", symbol: "€",  decimals: 2, symbolBefore: true  },
  USD: { code: "USD", symbol: "$",  decimals: 2, symbolBefore: true  },
};

/** Formátuje číslo podle měny */
export function formatPrice(amount: number, currency?: Currency): string {
  // Pokud currency chybí, použijeme CZK jako výchozí
  const activeCurrency = currency || CURRENCIES.CZK;
  const safeAmount = amount || 0;

  // toFixed voláme až na zaručeně definovaném objektu
  const rounded = parseFloat(safeAmount.toFixed(activeCurrency.decimals));

  if (activeCurrency.symbolBefore) {
    return `${activeCurrency.symbol}${rounded.toFixed(activeCurrency.decimals)}`;
  }
  return `${rounded.toLocaleString("cs-CZ")} ${activeCurrency.symbol}`;
}
/**
 * Přečte cenu produktu pro danou měnu.
 * price může být číslo (jen CZK) nebo objekt { CZK, EUR, USD }
 */
export function getPrice(
  price: number | Partial<Record<CurrencyCode, number>>,
  currency: Currency,
): number {
  if (typeof price === "number") return price; // jen CZK — fallback
  return price[currency.code] ?? price["CZK"] ?? 0;
}