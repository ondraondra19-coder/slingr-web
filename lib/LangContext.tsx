"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Locale = "cs" | "sk" | "en";

function readLocale(): Locale {
  if (typeof document === "undefined") return "cs";
  const match = document.cookie.match(/googtrans=\/\w+\/(\w+)/);
  const code = match?.[1];
  if (code === "en" || code === "sk") return code;
  return "cs";
}

const LangContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "cs", setLocale: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  // ← Vždy začínáme s "cs" — stejně na serveru i klientovi
  const [locale, setLocale] = useState<Locale>("cs");

  // ← Cookie čteme až po mountu na klientovi
  useEffect(() => {
    setLocale(readLocale());
  }, []);

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}