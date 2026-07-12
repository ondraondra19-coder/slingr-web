"use client";

// lib/CurrencyContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CURRENCIES, type Currency, type CurrencyCode } from "@/lib/currency";

const STORAGE_KEY = "hackpack-currency";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  mounted: boolean;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.CZK,
  setCurrency: () => {},
  mounted: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES.CZK);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(CURRENCIES[saved]);
      }
    } catch {}
    setMounted(true);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    const c = CURRENCIES[code] ?? CURRENCIES.CZK;
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, mounted }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}