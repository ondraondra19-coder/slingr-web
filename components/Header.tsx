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
import { clearGoogtransCookie, loadGoogleTranslate, readGoogtransLang } from "@/lib/googleTranslate";
import Logo from "@/components/Logo";

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
  const code = readGoogtransLang();
  if (!code) return languages[0];
  return languages.find(l => l.gtCode === code) ?? languages[0];
}

// Widget se objeví až chvíli po stažení skriptu — než se dole vyrobí <select>,
// musíme počkat. Pokus je omezený (~10 s): když Google nedojede (blokovaný
// skript, výpadek), nemá smysl zkoušet donekonečna na pozadí.
const GT_SELECT_RETRY_MS = 500;
const GT_SELECT_MAX_ATTEMPTS = 20;

function switchGoogleTranslate(langCode: string, attempt = 0) {
  if (langCode === "cs") {
    clearGoogtransCookie();
    window.location.reload();
    return;
  }

  // Až tady se skript z translate.google.com vůbec stáhne — návštěvník si
  // překlad výslovně vyžádal kliknutím na jazyk.
  loadGoogleTranslate();

  const select = document.querySelector<HTMLSelectElement>(
    ".goog-te-combo, #google_translate_element select"
  );
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    return;
  }
  if (attempt >= GT_SELECT_MAX_ATTEMPTS) return;
  setTimeout(() => switchGoogleTranslate(langCode, attempt + 1), GT_SELECT_RETRY_MS);
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
    /* OPRAVA: pt-[env(safe-area-inset-top)] zajistí, že na mobilu černé pozadí proteče až pod notch */
    <header className="w-full bg-header relative z-50 pt-[env(safe-area-inset-top)]">

      {/* ── TOP BAR — pouze desktop ── */}
      <div className="hidden lg:block pt-3">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-5 text-white/60 text-xs">
            <a href="tel:+420737565577" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} />
              <span>+420 737 565 577</span>
            </a>
            <a href="mailto:info@dodelat.cz" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} />
              <span>info@dodelat.cz</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { setCurrencyOpen(v => !v); setLangOpen(false); }}
                aria-label={`Změnit měnu — vybráno ${currencyMounted ? currency.code : ""}`}
                aria-expanded={currencyOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1 min-h-11 text-white/60 text-xs hover:text-white transition-colors"
              >
                <span className="notranslate" translate="no">{currencyMounted ? currency.code : "···"}</span>
                <ChevronDown size={11} aria-hidden="true" className={`transition-transform duration-150 ${currencyOpen ? "rotate-180" : ""}`} />
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
            <span aria-hidden="true" className="text-white/50">|</span>
            <div className="relative">
              <button
                onClick={() => { setLangOpen(v => !v); setCurrencyOpen(false); }}
                aria-label={`Změnit jazyk — vybráno ${language.label}`}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1 min-h-11 text-white/60 text-xs hover:text-white transition-colors"
              >
                <Globe size={11} aria-hidden="true" />
                <span className="notranslate" translate="no">{language.label}</span>
                <ChevronDown size={11} aria-hidden="true" className={`transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`} />
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
          className="shrink-0 flex items-center"
        >
          <Image
            src="/images/main/logo-white.png"
            alt="Logo"
            width={1000} // Nastav šířku podle potřeby
            height={300}  // Nastav výšku podle potřeby (odpovídá h-12)
            className="h-25 w-auto object-contain"
            priority // Zajistí rychlé načtení loga jako LCP elementu
          />
        </a>

        {/* SearchBar — pouze desktop */}
        <div className="hidden lg:flex flex-1 max-w-xl relative z-[60]">
          <SearchBar />
        </div>

        {/* Pravá strana */}
        <div className="flex items-center gap-2">
          {/* Popisek "Košík" je pod sm: schovaný, takže na mobilu by z odkazu
              zbyla holá ikona bez názvu — aria-label ho drží vždy. */}
          <a
            href="/kosik"
            aria-label={totalItems > 0 ? `Otevřít košík — ${totalItems} ${totalItems === 1 ? "položka" : totalItems < 5 ? "položky" : "položek"}` : "Otevřít košík — prázdný"}
            className="relative flex items-center gap-2 px-3 lg:px-4 py-2 min-h-11 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-105 transition-all"
          >
            <ShoppingCart size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{t("cart")}</span>
            {totalItems > 0 && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-header text-primary text-[10px] font-bold flex items-center justify-center border border-primary">
                {totalItems}
              </span>
            )}
          </a>

          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SEARCHBAR ── */}
      {/* OPRAVA: Změněno pb-3 na pb-5 pro opticky vyváženější odsazení od spodního okraje na mobilu */}
      <div className="lg:hidden px-4 pb-5">
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
                <a href={item.href} className="inline-flex items-center px-3 py-3.5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Nav dropdown */}
        {openMenu && (() => {
          const active = navItems.find(i => i.label === openMenu);
          if (!active) return null;
          return (
            <div className="absolute left-0 right-0 z-40 bg-header border-t border-b border-white/10 shadow-xl">
              <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-white font-semibold text-sm">{active.label}</span>
                  <span className="text-white/55 text-xs">— {active.children.length} {t("products")}</span>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  {active.children.map(child => (
                    <a key={child.label} href={child.href} className="group flex flex-col items-center gap-2.5">
                      <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-white shadow-sm group-hover:shadow-md transition-shadow duration-150">
                        {/* Dropdown má 6 sloupců v max-w-screen-2xl (1536px) → ~240px */}
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
                    className="px-4 py-4 min-w-11 min-h-11 text-white/55 hover:text-white transition-colors"
                    onClick={() => setMobileExpanded(v => v === item.label ? null : item.label)}
                    aria-label={mobileExpanded === item.label ? `Sbalit ${item.label}` : `Rozbalit ${item.label}`}
                    aria-expanded={mobileExpanded === item.label}
                  >
                    <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180 text-primary" : ""}`} />
                  </button>
                </div>
                {mobileExpanded === item.label && (
                  <ul className="bg-white/5 pb-2">
                    {item.children.map(child => (
                      <li key={child.label}>
                        <a href={child.href} className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
                          <div className="w-8 h-8 rounded-lg shrink-0 relative overflow-hidden bg-white shadow-sm">
                            {/* alt="" — název produktu je hned vedle jako text odkazu */}
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

          {/* Přepínač měny a jazyka — na desktopu je v horní liště (hidden lg:block),
              která je na mobilu skrytá celá, takže sem patří jediná mobilní varianta. */}
          <div className="border-t border-white/10 px-5 py-4 space-y-3">
            <div>
              <p className="text-white/55 text-[11px] font-medium uppercase tracking-wide mb-2">Měna</p>
              <div className="flex gap-2">
                {(["CZK", "EUR", "USD"] as CurrencyCode[]).map(code => (
                  <button
                    key={code}
                    translate="no"
                    onClick={() => setCurrency(code)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${code === currency.code ? "bg-primary text-on-primary" : "bg-white/5 text-white/50 hover:text-white"}`}
                  >
                    <span className="notranslate">{code}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/55 text-[11px] font-medium uppercase tracking-wide mb-2">Jazyk</p>
              <div className="flex gap-2">
                {languages.map(l => (
                  <button
                    key={l.code}
                    translate="no"
                    onClick={() => {
                      setLanguage(l);
                      setLocale(l.gtCode as "cs" | "sk" | "en");
                      switchGoogleTranslate(l.gtCode);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${l.code === language.code ? "bg-primary text-on-primary" : "bg-white/5 text-white/50 hover:text-white"}`}
                  >
                    <span className="notranslate">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

    </header>
  );
}