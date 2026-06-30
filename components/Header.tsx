"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Phone, Mail, ChevronDown, Menu, X, Globe } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/CurrencyContext";
import { type CurrencyCode } from "@/lib/currency";
import SearchBar from "./SearchBar";
import { products, categories } from "@/lib/products";
import { useT } from "@/lib/useT";
import { useLang } from "@/lib/LangContext";

const languages = [
  { code: "cs", label: "Čeština", gtCode: "cs" },
  { code: "sk", label: "Slovenčina", gtCode: "sk" },
  { code: "en", label: "English", gtCode: "en" },
];

const navRight = [
  { label: "Blog", href: "/blog" },
  { label: "O nás", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];

function readLangFromCookie(): typeof languages[0] {
  if (typeof document === "undefined") return languages[0];
  const match = document.cookie.match(/googtrans=\/\w+\/(\w+)/);
  if (!match) return languages[0];
  return languages.find(l => l.gtCode === match[1]) ?? languages[0];
}

function switchGoogleTranslate(langCode: string) {
  if (langCode === "cs") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
    window.location.reload();
    return;
  }
  const select = document.querySelector<HTMLSelectElement>(
    ".goog-te-combo, #google_translate_element select"
  );
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    return;
  }
  setTimeout(() => switchGoogleTranslate(langCode), 500);
}

export default function Header() {
  const { totalItems } = useCart();
  const { currency, setCurrency, mounted: currencyMounted } = useCurrency();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [language, setLanguage] = useState(languages[0]);
  const [langOpen, setLangOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useT("header");
  const { setLocale } = useLang();

  const navItems = categories.map(cat => ({
    label: cat.name,
    href: `/kategorie/${cat.slug}`,
    children: products
      .filter(p => p.categories.includes(cat.slug))
      .map(p => ({ label: p.name, href: `/produkt/${p.slug}`, img: p.img })),
  }));

  useEffect(() => {
    setLanguage(readLangFromCookie());
  }, []);

  return (
    <header className="w-full bg-header relative z-50">

      {/* ── TOP BAR — pouze desktop ── */}
      <div className="hidden lg:block pt-3">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-5 text-white/40 text-xs">
            <a href="tel:+420737565577" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} />
              <span>+420 737 565 577</span>
            </a>
            <a href="mailto:info@techgadgets.cz" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} />
              <span>info@techgadgets.cz</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setCurrencyOpen(v => !v); setLangOpen(false); }} className="inline-flex items-center gap-1 text-white/40 text-xs hover:text-white transition-colors">
                <span className="notranslate" translate="no">{currencyMounted ? currency.code : "···"}</span>
                <ChevronDown size={11} className={`transition-transform duration-150 ${currencyOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 bg-header border border-white/10 rounded-lg py-1 z-50 min-w-[72px] shadow-md">
                  {(["CZK", "EUR", "USD"] as CurrencyCode[]).map(code => (
                    <button key={code} translate="no" onClick={() => { setCurrency(code); setCurrencyOpen(false); }} className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${code === currency.code ? "text-primary" : "text-white/50 hover:text-white"}`}>
                      <span className="notranslate">{code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-white/20">|</span>
            <div className="relative">
              <button onClick={() => { setLangOpen(v => !v); setCurrencyOpen(false); }} className="inline-flex items-center gap-1 text-white/40 text-xs hover:text-white transition-colors">
                <Globe size={11} />
                <span className="notranslate" translate="no">{language.label}</span>
                <ChevronDown size={11} className={`transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-header border border-white/10 rounded-lg py-1 z-50 min-w-[120px] shadow-md">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      translate="no"
                      onClick={() => {
                        setLanguage(l);
                        setLocale(l.gtCode as "cs" | "sk" | "en");
                        setLangOpen(false);
                        switchGoogleTranslate(l.gtCode);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${l.code === language.code ? "text-primary" : "text-white/50 hover:text-white"}`}
                    >
                      <span className="notranslate">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 flex items-center justify-between h-16 lg:h-20 gap-4 lg:gap-6">

        {/* Logo */}
        <a
          href="/"
          onClick={e => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="shrink-0"
        >
          <Image
            src="/images/logo-white.png"
            alt="TechGadgets"
            width={1024}
            height={559}
            className="h-8 lg:h-12 w-auto object-contain"
            priority
          />
        </a>

        {/* SearchBar — pouze desktop
            z-[60] zajistí že search dropdown překryje nav dropdown (z-40) */}
        <div className="hidden lg:flex flex-1 max-w-xl relative z-[60]">
          <SearchBar />
        </div>

        {/* Pravá strana */}
        <div className="flex items-center gap-2">
          <a href="/kosik" className="relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-primary text-dark font-semibold text-sm hover:brightness-105 transition-all">
            <ShoppingCart size={15} />
            <span className="hidden sm:inline">{t("cart")}</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-header text-primary text-[10px] font-bold flex items-center justify-center border border-primary">
                {totalItems}
              </span>
            )}
          </a>

          <button
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SEARCHBAR ── */}
      <div className="lg:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {/* ── DESKTOP NAV ── */}
      <nav
        className="hidden lg:block pb-1"
        onMouseLeave={() => {
          if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
          setOpenMenu(null);
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <ul className="flex items-center gap-1">
            {navItems.map(item => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  if (openMenu) {
                    setOpenMenu(item.label);
                  } else {
                    hoverTimeout.current = setTimeout(() => setOpenMenu(item.label), 500);
                  }
                }}
              >
                <a
                  href={item.href}
                  className={`inline-flex items-center gap-1 px-3 py-3.5 text-sm font-medium transition-colors ${openMenu === item.label ? "text-primary" : "text-white/70 hover:text-white"}`}
                >
                  {item.label}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${openMenu === item.label ? "rotate-180 text-primary" : ""}`} />
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex items-center gap-1">
            {navRight.map(item => (
              <li key={item.label}>
                <a href={item.href} className="inline-flex items-center px-3 py-3.5 text-sm font-medium text-white/40 hover:text-white transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Nav dropdown — z-40, pod search dropdownem (z-[60]) */}
        {openMenu && (() => {
          const active = navItems.find(i => i.label === openMenu);
          if (!active) return null;
          return (
            <div className="absolute left-0 right-0 z-40 bg-header border-t border-b border-white/10 shadow-xl">
              <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-white font-semibold text-sm">{active.label}</span>
                  <span className="text-white/30 text-xs">— {active.children.length} {t("products")}</span>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  {active.children.map(child => (
                    <a key={child.label} href={child.href} className="group flex flex-col items-center gap-2.5">
                      <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-white shadow-sm group-hover:shadow-md transition-shadow duration-150">
                        <Image src={child.img} alt={child.label} fill className="object-contain p-3" />
                      </div>
                      <p className="text-white/60 text-xs text-center leading-tight group-hover:text-white transition-colors line-clamp-2 w-full">{child.label}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </nav>

      {/* ── MOBILE NAV ── */}
      {mobileOpen && (
        <nav className="lg:hidden bg-header border-t border-white/10 max-h-[70vh] overflow-y-auto">
          <ul className="divide-y divide-white/10">
            {navItems.map(item => (
              <li key={item.label}>
                <div className="flex items-center justify-between border-b border-white/10">
                  <a
                    href={item.href}
                    className="flex-1 px-5 py-4 text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                  <button
                    className="px-4 py-4 text-white/30 hover:text-white transition-colors"
                    onClick={() => setMobileExpanded(v => v === item.label ? null : item.label)}
                    aria-label={`Rozbalit ${item.label}`}
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180 text-primary" : ""}`} />
                  </button>
                </div>
                {mobileExpanded === item.label && (
                  <ul className="bg-white/5 pb-2">
                    {item.children.map(child => (
                      <li key={child.label}>
                        <a href={child.href} className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
                          <div className="w-8 h-8 rounded-lg shrink-0 relative overflow-hidden bg-white shadow-sm">
                            <Image src={child.img} alt={child.label} fill className="object-contain p-1" />
                          </div>
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="border-t border-white/10" />
            {navRight.map(item => (
              <li key={item.label}>
                <a href={item.href} className="block px-5 py-4 text-sm font-medium text-white/40 hover:text-white transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

    </header>
  );
}