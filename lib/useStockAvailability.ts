// lib/useStockAvailability.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSessionId } from "./session";

const POLL_INTERVAL_MS = 6000; // jak často kontrolujeme cizí rezervace

export type StockAvailability = {
  rawStock: number;        // co je fyzicky na skladě (ze Sheets)
  reservedByOthers: number; // kolik si zarezervovali JINÍ uživatelé
  myReservation: number;    // kolik mám já sám v košíku (z pohledu rezervace)
  available: number;        // kolik si JEŠTĚ může kdokoliv přidat
  loading: boolean;
};

/**
 * Sleduje dostupnost konkrétní varianty produktu v reálném čase (polling).
 * variantKey = "barva|velikost" stejně jako klíče v Google Sheets stock mapě.
 */
export function useStockAvailability(slug: string, variantKey: string) {
  const [data, setData] = useState<StockAvailability>({
    rawStock: 0,
    reservedByOthers: 0,
    myReservation: 0,
    available: 0,
    loading: true,
  });
  const sessionIdRef = useRef<string>("");

  const fetchAvailability = useCallback(async () => {
    if (!slug) return;
    const sessionId = sessionIdRef.current || getSessionId();
    sessionIdRef.current = sessionId;

    try {
      const res = await fetch(
        `/api/stock-availability?slug=${encodeURIComponent(slug)}&variant=${encodeURIComponent(variantKey)}&sessionId=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = await res.json();
      setData({
        rawStock: json.rawStock ?? 0,
        reservedByOthers: json.reservedByOthers ?? 0,
        myReservation: json.myReservation ?? 0,
        available: json.available ?? 0,
        loading: false,
      });
    } catch {
      // tichý fail — necháme poslední známý stav, neblokujeme UI
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [slug, variantKey]);

  useEffect(() => {
    fetchAvailability();
    const interval = setInterval(fetchAvailability, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAvailability]);

  /**
   * Zavolat po addItem do košíku — pošle rezervaci na server.
   * totalQty = celkové množství této varianty, které teď uživatel
   * v košíku má (ne jen "+1", ale výsledné číslo).
   */
  const syncReservation = useCallback(async (totalQty: number) => {
    const sessionId = sessionIdRef.current || getSessionId();
    try {
      const res = await fetch("/api/stock-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, variant: variantKey, sessionId, quantity: totalQty }),
      });
      const json = await res.json();
      await fetchAvailability(); // refresh hned po zápisu, nečekat na další poll
      return json;
    } catch {
      return { ok: false };
    }
  }, [slug, variantKey, fetchAvailability]);

  return { ...data, syncReservation, refetch: fetchAvailability };
}