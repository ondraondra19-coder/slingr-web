// lib/useCartSync.ts
"use client";

import { useCallback } from "react";
import { getSessionId } from "./session";

function buildVariantKey(slug: string, variants?: Record<string, string>): string {
  if (!variants || Object.keys(variants).length === 0) return "-|-";
  const values = Object.values(variants);
  if (values.length === 1) return `${values[0]}|-`;
  return `${values[0]}|${values[1]}`;
}

export function useCartSync() {
  /**
   * Zavolat při odebrání položky z košíku.
   * Okamžitě uvolní rezervaci (quantity=0 = smaž).
   */
  const releaseOnRemove = useCallback(async (
    slug: string,
    variants?: Record<string, string>,
  ) => {
    const sessionId = getSessionId();
    const variantKey = buildVariantKey(slug, variants);
    try {
      await fetch("/api/stock-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, variant: variantKey, sessionId, quantity: 0 }),
      });
    } catch {}
  }, []);

  /**
   * Zavolat při změně množství v košíku (+/-).
   * Pošle serveru celkové požadované množství.
   * Server odečte pouze rezervace OSTATNÍCH a vrátí max povolené.
   * Vrátí skutečně přidělené množství (může být nižší pokud jiní zarezervovali).
   */
  const checkAndSync = useCallback(async (
    slug: string,
    variants: Record<string, string> | undefined,
    newQuantity: number,
  ): Promise<number> => {
    const sessionId = getSessionId();
    const variantKey = buildVariantKey(slug, variants);
    try {
      const res = await fetch("/api/stock-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, variant: variantKey, sessionId, quantity: newQuantity }),
      });
      const json = await res.json();
      if (json.ok) return json.reservedQuantity ?? newQuantity;
      if (json.reason === "out_of_stock") return 0;
    } catch {}
    return newQuantity; // fallback při síťové chybě
  }, []);

  return { releaseOnRemove, checkAndSync };
}