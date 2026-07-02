// lib/useStockAvailability.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSessionId } from "./session";

const POLL_INTERVAL_MS = 6000;

export type StockAvailability = {
  rawStock: number;
  reservedByOthers: number;
  myReservation: number;      // kolik já sám mám zarezervováno
  available: number;          // sklad − rezervace ostatních (kolik smím mít JÁ celkem)
  canAddMore: number;         // kolik kusů si ještě mohu přidat (available − myReservation)
  loading: boolean;
};

export function useStockAvailability(slug: string, variantKey: string) {
  const [data, setData] = useState<StockAvailability>({
    rawStock: 0,
    reservedByOthers: 0,
    myReservation: 0,
    available: 0,
    canAddMore: 0,
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

      const available = json.available ?? 0;
      const myReservation = json.myReservation ?? 0;
      // Kolik si ještě mohu přidat = celkový limit − co už mám
      const canAddMore = Math.max(0, available - myReservation);

      setData({
        rawStock: json.rawStock ?? 0,
        reservedByOthers: json.reservedByOthers ?? 0,
        myReservation,
        available,
        canAddMore,
        loading: false,
      });
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [slug, variantKey]);

  useEffect(() => {
    fetchAvailability();
    const interval = setInterval(fetchAvailability, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAvailability]);

  const syncReservation = useCallback(async (totalQty: number) => {
    const sessionId = sessionIdRef.current || getSessionId();
    try {
      const res = await fetch("/api/stock-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, variant: variantKey, sessionId, quantity: totalQty }),
      });
      const json = await res.json();
      await fetchAvailability();
      return json;
    } catch {
      return { ok: false };
    }
  }, [slug, variantKey, fetchAvailability]);

  return { ...data, syncReservation, refetch: fetchAvailability };
}