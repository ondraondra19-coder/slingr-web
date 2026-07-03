// lib/useStockPolling.ts
"use client";

import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL_MS = 6000;

export type StockData = Record<string, number>;

export function useStockPolling(slug: string) {
  const [stockData, setStockData] = useState<StockData>({});
  const [loading, setLoading] = useState(true);

  const fetchStock = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(
        `/api/stock?slug=${encodeURIComponent(slug)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = await res.json();
      setStockData(json.stockData ?? {});
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStock]);

  return { stockData, loading, refetch: fetchStock };
}