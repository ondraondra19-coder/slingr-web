// lib/fees.ts
// Jediný zdroj pravdy pro poplatky nezávislé na produktovém katalogu.
// Dřív byl příplatek za dobírku natvrdo opsaný na 5 místech (2 API routy +
// 3 stránky pro zobrazení) — jednou už se tím rozjelo (49 Kč vs. 39 Kč).

export const DOBIRKA_FEE: Record<"CZK" | "EUR" | "USD", number> = {
  CZK: 39,
  EUR: 1.59,
  USD: 1.79,
};

export function getDobirkaFee(currencyCode: string): number {
  return DOBIRKA_FEE[currencyCode as keyof typeof DOBIRKA_FEE] ?? DOBIRKA_FEE.CZK;
}
