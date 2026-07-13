// lib/shipping/pricing.ts
// Jediný zdroj pravdy pro ceny dopravy. Používá to jak stránka /objednavka
// (zobrazení výběru), tak /api/checkout a /api/orders, kde server cenu dopravy
// dopočítá podle ZVOLENÉ dopravy — nevěří částce poslané klientem.

export type ShippingId = "zasilkovna_box" | "zasilkovna_adresa";

export const SHIPPING_PRICES: Record<ShippingId, { CZK: number; EUR: number; USD: number }> = {
  zasilkovna_box: { CZK: 89, EUR: 3.49, USD: 3.79 },
  zasilkovna_adresa: { CZK: 129, EUR: 4.99, USD: 5.49 },
};

// Cena dopravy pro daný způsob v dané měně. Neznámý způsob → 0,
// chybějící měna → fallback na CZK.
export function getShippingPrice(dopravaId: string | null | undefined, currencyCode: string): number {
  if (!dopravaId || !(dopravaId in SHIPPING_PRICES)) return 0;
  const price = SHIPPING_PRICES[dopravaId as ShippingId];
  return price[currencyCode as keyof typeof price] ?? price.CZK;
}
