// lib/discounts.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seznam slevových kódů — edituj jen tady, zbytek funguje automaticky
// ─────────────────────────────────────────────────────────────────────────────

export type DiscountType = "percent" | "fixed";

export type Discount = {
  code: string;         // kód (case-insensitive při porovnání)
  type: DiscountType;   // "percent" = 10 % z ceny | "fixed" = 50 Kč fixně
  value: number;        // pro percent: 0–100, pro fixed: částka v CZK
  label: string;        // popisek zobrazený zákazníkovi
  minOrderCZK?: number; // volitelně: minimální cena celého košíku v CZK
  active: boolean | string[]; // true = celý košík | false = vypnutý | ["slug1"] = jen tyto produkty
};

export const discounts: Discount[] = [
  {
    code: "VITEJ10",
    type: "percent",
    value: 10,
    label: "Uvítací sleva 10 %",
    active: ["nahradni-hroty-apple-pencil"], // platí na konkrétní produkt
  },
  {
    code: "LETO2025",
    type: "percent",
    value: 15,
    label: "Letní sleva 15 %",
    minOrderCZK: 500,
    active: true,
  },
  {
    code: "SLEVA50",
    type: "fixed",
    value: 50,
    label: "Sleva 50 Kč",
    minOrderCZK: 300,
    active: true,
  },
  // Příklad: sleva jen na konkrétní produkty
  // {
  //   code: "PENCIL20",
  //   type: "percent",
  //   value: 20,
  //   label: "Sleva 20 % na pouzdra Apple Pencil",
  //   active: ["pouzdro-apple-pencil"],   // jen pro tento produkt
  // },
];

// ── Orientační kurzy pro zobrazení v jiných měnách ───────────────────────────
export const APPROX_RATES: Record<string, number> = {
  EUR: 25,
  USD: 23,
  CZK: 1,
};

export function approxConvert(czk: number, currencyCode: string): number {
  const rate = APPROX_RATES[currencyCode] ?? 1;
  return czk / rate;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Vrátí true pokud je kód aktivní (active !== false) */
export function isActive(discount: Discount): boolean {
  return discount.active !== false;
}

/** Vrátí slugy produktů na které se sleva vztahuje, nebo null = celý košík */
export function getActiveSlugs(discount: Discount): string[] | null {
  if (Array.isArray(discount.active)) return discount.active;
  return null; // true = celý košík
}

/** Najde kód bez ohledu na velká/malá písmena, pouze aktivní */
export function findDiscount(code: string): Discount | undefined {
  return discounts.find(
    (d) => d.code.toUpperCase() === code.trim().toUpperCase() && isActive(d)
  );
}

/**
 * Vypočítá výši slevy v dané měně.
 * eligibleInCurrency = částka způsobilých položek v aktuální měně
 * eligibleCZK        = stejné v CZK (pro přepočet fixed slev)
 */
export function calcDiscount(
  discount: Discount,
  eligibleCZK: number,
  eligibleInCurrency: number,
): number {
  if (discount.type === "percent") {
    return (eligibleInCurrency * discount.value) / 100;
  }
  if (eligibleCZK === 0) return 0;
  const ratio = eligibleInCurrency / eligibleCZK;
  return discount.value * ratio;
}