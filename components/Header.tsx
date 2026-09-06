"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ShoppingBag, Phone, ChevronDown, Menu, X, Globe, Coins, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/CurrencyContext";
import { type CurrencyCode } from "@/lib/currency";
import SearchOverlay from "./SearchOverlay";
import { products, categories } from "@/lib/products";
import { useT } from "@/lib/useT";
import { useLang } from "@/lib/LangContext";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/locale";
import { getCategoryName, getProductName } from "@/lib/products";
import { useModalBehavior } from "@/lib/useModalBehavior";

// Popisek, který se u ikonky rozbalí zleva doprava při najetí myší (nebo když
// je `show` true — třeba když je otevřený její dropdown). Trik grid-cols
// 0fr→1fr plynule animuje šířku i pro obsah neznámé délky.
function HoverLabel({ label, show }: { label: string; show?: boolean }) {
  return (
    <span
      className={`grid transition-[grid-template-columns] duration-200 ease-out ${
        show ? "grid-cols-[1fr]" : "grid-cols-[0fr] group-hover:grid-cols-[1fr]"
      }`}
    >
      <span className="overflow-hidden whitespace-nowrap">
        <span className="block pl-2 text-sm font-medium">{label}</span>
      </span>
    </span>
  );
}

const iconBtnClass =
  "group inline-flex items-center h-10 px-3 rounded-full text-white/65 hover:text-white hover:bg-white/10 transition-colors";

export default function Header() {
  const { totalItems } = useCart();
  const { currency, setCurrency, mounted: currencyMounted } = useCurrency();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utilityRef = useRef<HTMLDivElement>(null);

  // Mega menu — otevře se AŽ po krátké prodlevě (0,5 s) od najetí na kategorii.
  // Brání to náhodnému rozbalení při pouhém přejetí myší přes hlavičku: zákazník
  // musí nad kategorií chvíli zůstat. Zavírá se s malým zpožděním (ať se dá myší
  // přejet z položky dolů do panelu, aniž by zmizel).
  const OPEN_DELAY_MS = 250;
  function openMega(label: string) {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    if (openTimeout.current) clearTimeout(openTimeout.current);
    openTimeout.current = setTimeout(() => setOpenMenu(label), OPEN_DELAY_MS);
  }
  // Myš odjela z kategorie dřív, než uplynula prodleva — čekající otevření zrušíme.
  function cancelOpenMega() {
    if (openTimeout.current) clearTimeout(openTimeout.current);
  }
  function scheduleCloseMega() {
    if (openTimeout.current) clearTimeout(openTimeout.current); // zruš i čekající otevření
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpenMenu(null), 120);
  }
  function cancelCloseMega() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }

  const t = useT("header");
  const tn = useT("nav");
  const { locale, setLocale } = useLang();

  function switchLanguage(l: Locale) {
    setLocale(l);
    setLangOpen(false);
  }

  // Klik mimo utility oblast zavře otevřené dropdowny měny/jazyka.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (utilityRef.current && !utilityRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Úklid časovačů mega menu při odmountování.
  useEffect(() => () => {
    if (openTimeout.current) clearTimeout(openTimeout.current);
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }, []);

  // Rozbalené mobilní menu zabírá většinu obrazovky — pod ním se nesmí rolovat
  // stránka a musí jít zavřít Escapem (stejně jako ostatní překryvy).
  const closeMobile = useCallback(() => { setMobileOpen(false); setMobileExpanded(null); }, []);
  useModalBehavior(mobileOpen, closeMobile);

  const navRight = [
    { label: tn("contact"), href: "/kontakt" },
  ];

  const navItems = categories.map(cat => ({
    label: getCategoryName(cat, locale),
    href: `/kategorie/${cat.slug}`,
    children: products
      .filter(p => p.categories.includes(cat.slug))
      .map(p => ({ label: getProductName(p, locale), href: `/produkt/${p.slug}`, img: p.img })),
  }));

  return (
    <header className="w-full bg-header relative z-50 pt-[env(safe-area-inset-top)]">

      {/* ── MAIN HEADER — logo · kategorie · ikonky v jedné řadě ── */}
      <div className="relative max-w-screen-2xl mx-auto px-4 lg:px-12 flex items-center justify-between h-16 lg:h-28 gap-4">

        {/* Logo */}
        <Link
          href="/"
          onClick={e => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="shrink-0 flex items-center"
        >
          {/* Jediné logo webu (public/images/main/logo.png) — na tmavé i světlé
              pozadí, průhledné okolí. Soubor je oříznutý natěsno, takže výška
              v CSS = skutečná výška značky; kdyby se logo znovu exportovalo
              s prázdným okrajem, zmenší se a je potřeba okraj zase odříznout. */}
          <Image
            src="/images/main/logo.png"
            alt={t("logoAlt")}
            width={567}
            height={179}
            className="h-12 lg:h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Kategorie — absolutně vycentrované, aby je rozbalování ikon neposouvalo */}
        <nav
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          onMouseLeave={scheduleCloseMega}
        >
          <ul className="flex items-center gap-1">
            {navItems.map(item => (
              <li
                key={item.label}
                onMouseEnter={() => { if (item.children.length > 0) openMega(item.label); }}
                onMouseLeave={cancelOpenMega}
              >
                <a
                  href={item.href}
                  className={`inline-flex items-center gap-1 px-4 py-2.5 text-base font-medium transition-colors ${openMenu === item.label ? "text-primary" : "text-white/70 hover:text-white"}`}
                >
                  {item.label}
                  {item.children.length > 0 && (
                    <ChevronDown size={15} className={`transition-transform duration-200 ${openMenu === item.label ? "rotate-180 text-primary" : ""}`} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Pravá strana — 5 jednotných ikonek. Popisek se rozbalí při najetí myší. */}
        <div ref={utilityRef} className="flex items-center gap-0.5 lg:gap-1">

          {/* Vyhledávání — otevře lištu odshora (jako blastro) */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label={t("search")}
            className={iconBtnClass}
          >
            <Search size={20} aria-hidden="true" className="shrink-0" />
            <HoverLabel label={t("search")} />
          </button>

          {/* Měna — jen desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => { setCurrencyOpen(v => !v); setLangOpen(false); }}
              aria-label={t("changeCurrency", { code: currencyMounted ? currency.code : "" })}
              aria-expanded={currencyOpen}
              aria-haspopup="menu"
              className={iconBtnClass}
            >
              <Coins size={20} aria-hidden="true" className="shrink-0" />
              <HoverLabel label={currencyMounted ? currency.code : "···"} show={currencyOpen} />
            </button>
            {currencyOpen && (
              <div className="absolute right-0 top-full mt-2 bg-header border border-white/10 rounded-lg py-1 z-50 min-w-[80px] shadow-md">
                {(["CZK", "EUR", "USD"] as CurrencyCode[]).map(code => (
                  <button key={code} onClick={() => { setCurrency(code); setCurrencyOpen(false); }} className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${code === currency.code ? "text-primary" : "text-white/50 hover:text-white"}`}>
                    <span>{code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Jazyk — jen desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => { setLangOpen(v => !v); setCurrencyOpen(false); }}
              aria-label={t("changeLanguage", { current: LOCALE_LABELS[locale] })}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              className={iconBtnClass}
            >
              <Globe size={20} aria-hidden="true" className="shrink-0" />
              <HoverLabel label={LOCALE_LABELS[locale]} show={langOpen} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-header border border-white/10 rounded-lg py-1 z-50 min-w-[120px] shadow-md">
                {LOCALES.map(l => (
                  <button
                    key={l}
                    lang={l}
                    onClick={() => switchLanguage(l)}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${l === locale ? "text-primary" : "text-white/50 hover:text-white"}`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kontakt — jen desktop */}
          <Link href="/kontakt" aria-label={tn("contact")} className={`${iconBtnClass} hidden lg:inline-flex`}>
            <Phone size={20} aria-hidden="true" className="shrink-0" />
            <HoverLabel label={tn("contact")} />
          </Link>

          {/* Košík — ikonka s počtem, na všech zařízeních */}
          <Link
            href="/kosik"
            aria-label={totalItems > 0 ? t.plural(totalItems, "openCart") : t("openCartEmpty")}
            className={`${iconBtnClass} relative`}
          >
            <span className="relative shrink-0">
              <ShoppingBag size={20} aria-hidden="true" />
              {totalItems > 0 && (
                <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
            <HoverLabel label={t("cart")} />
          </Link>

          {/* Hamburger — jen mobil */}
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center text-white/65 hover:text-white transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── DESKTOP MEGA MENU — panel pod hlavičkou (top-full) ── */}
      {openMenu && (() => {
        const active = navItems.find(i => i.label === openMenu);
        if (!active || active.children.length === 0) return null;
        return (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full z-40 bg-header border-t border-b border-white/10 shadow-xl"
            onMouseEnter={cancelCloseMega}
            onMouseLeave={scheduleCloseMega}
          >
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-white font-semibold text-sm">{active.label}</span>
                <span className="text-white/55 text-xs">— {active.children.length} {t("products")}</span>
              </div>
              <div className="grid grid-cols-6 gap-4">
                {active.children.map(child => (
                  <a key={child.label} href={child.href} className="group flex flex-col items-center gap-2.5">
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-white shadow-sm group-hover:shadow-md transition-shadow duration-150">
                      <Image src={child.img} alt="" fill sizes="240px" className="object-contain p-3" />
                    </div>
                    <p className="text-white/60 text-xs text-center leading-tight group-hover:text-white transition-colors line-clamp-2 w-full">{child.label}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MOBILE NAV ──
          dvh: strop se dopočítá k tomu, co je z okna reálně vidět teď — s `vh`
          mohlo menu vylézt pod adresní řádek a spodní položky byly nedostupné. */}
      {mobileOpen && (
        <nav className="lg:hidden bg-header border-t border-white/10 max-h-[70dvh] overflow-y-auto overscroll-contain">
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
                  {item.children.length > 0 && (
                    <button
                      className="px-4 py-4 min-w-11 min-h-11 text-white/55 hover:text-white transition-colors"
                      onClick={() => setMobileExpanded(v => v === item.label ? null : item.label)}
                      aria-label={mobileExpanded === item.label ? t("collapse", { name: item.label }) : t("expand", { name: item.label })}
                      aria-expanded={mobileExpanded === item.label}
                    >
                      <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180 text-primary" : ""}`} />
                    </button>
                  )}
                </div>
                {mobileExpanded === item.label && (
                  <ul className="bg-white/5 pb-2">
                    {item.children.map(child => (
                      <li key={child.label}>
                        <a href={child.href} className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
                          <div className="w-8 h-8 rounded-lg shrink-0 relative overflow-hidden bg-white shadow-sm">
                            <Image src={child.img} alt="" fill sizes="32px" className="object-contain p-1" />
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
                <a href={item.href} className="block px-5 py-4 text-sm font-medium text-white/60 hover:text-white transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Přepínač měny a jazyka — na mobilu jediná varianta (v horní liště nejsou). */}
          <div className="border-t border-white/10 px-5 py-4 space-y-3">
            <div>
              <p className="text-white/55 text-[11px] font-medium uppercase tracking-wide mb-2">{t("currency")}</p>
              <div className="flex gap-2">
                {(["CZK", "EUR", "USD"] as CurrencyCode[]).map(code => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    aria-pressed={code === currency.code}
                    className={`flex-1 py-2 min-h-11 rounded-lg text-xs font-semibold transition-colors ${code === currency.code ? "bg-primary text-on-primary" : "bg-white/5 text-white/50 hover:text-white"}`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/55 text-[11px] font-medium uppercase tracking-wide mb-2">{t("language")}</p>
              <div className="flex gap-2">
                {LOCALES.map(l => (
                  <button
                    key={l}
                    lang={l}
                    onClick={() => switchLanguage(l)}
                    aria-pressed={l === locale}
                    className={`flex-1 py-2 min-h-11 rounded-lg text-xs font-semibold transition-colors ${l === locale ? "bg-primary text-on-primary" : "bg-white/5 text-white/50 hover:text-white"}`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ── VYHLEDÁVACÍ LIŠTA (overlay odshora) ── */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

    </header>
  );
}
