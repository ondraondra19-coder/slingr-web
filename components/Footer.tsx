"use client";

import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock,
  Instagram, Facebook, Youtube,
  ArrowRight, Check, Truck, RotateCcw, ShieldCheck,
} from "lucide-react";
import Image from "next/image";

// ── Nav data ──────────────────────────────────────────────────────────────────

const footerNav = [
  {
    heading: "Kategorie",
    links: [
      { label: "Pouzdra & Obaly",     href: "/kategorie/pouzdra-obaly"  },
      { label: "iPad & Apple Pencil", href: "/kategorie/ipad-pencil"    },
      { label: "Apple Watch",         href: "/kategorie/apple-watch"    },
      { label: "Příslušenství",       href: "/kategorie/prislusenstvi"  },
      { label: "Čištění",             href: "/kategorie/cisteni"        },
    ],
  },
  {
    heading: "Zákaznická zóna",
    links: [
      { label: "Stav objednávky",  href: "/objednavky"          },
      { label: "Vrácení zboží",    href: "/reklamace"             },
      { label: "Reklamace",        href: "/reklamace"           },
      { label: "Doprava a platba", href: "/doprava"             },
      { label: "FAQ",              href: "/faq"                 },
    ],
  },
  {
    heading: "O nás",
    links: [
      { label: "O HackPack", href: "/o-nas"    },
      { label: "Blog",          href: "/blog"     },
      { label: "Kontakt",       href: "/kontakt"  },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/hackpack.cz" },
  { icon: Facebook,  label: "Facebook",  href: "https://facebook.com/hackpack.cz"  },
  { icon: Youtube,   label: "YouTube",   href: "https://youtube.com/@hackpack"     },
];

const trustItems = [
  { icon: Truck,       label: "Expedice do 24 h"    },
  { icon: RotateCcw,   label: "30 dní na vrácení"   },
  { icon: ShieldCheck, label: "Záruka 2 roky"        },
];

// ── Newsletter ────────────────────────────────────────────────────────────────

// ── Newsletter ────────────────────────────────────────────────────────────────

function Newsletter() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState(false);

  function handleSubmit() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  }

  return (
    <div className="border-b border-white/8">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Left */}
          <div className="flex-1">
            <p className="text-white font-bold text-base mb-1">
              Buďte první, kdo se dozví o novinkách
            </p>
            <p className="text-white/40 text-sm">
              Slevy, nové produkty a tipy přímo do schránky. Odhlásit se lze kdykoliv.
            </p>
          </div>

          {/* Form */}
          <div className="w-full lg:w-auto">
            {submitted ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium w-full sm:w-auto justify-center sm:justify-start">
                <Check size={15} strokeWidth={2.5} />
                <span>Přihlášení proběhlo úspěšně</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(false); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="váš@email.cz"
                    className={`w-full sm:w-64 bg-white/6 border rounded-full px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/60 transition-colors ${
                      error ? "border-red-500/60" : "border-white/12"
                    }`}
                  />
                  {error && (
                    <p className="absolute -bottom-5 left-4 text-red-400 text-[10px]">
                      Zadejte platný e-mail
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-dark font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all shrink-0 w-full sm:w-auto"
                >
                  <span>Odebírat</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-header">

      {/* Newsletter */}
      <Newsletter />

      {/* Main grid */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Brand column — 2/6 */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col gap-6">

            {/* Logo */}
            <a
              href="/"
              onClick={e => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="inline-block"
            >
              <Image
                src="/images/main/logo-white.png"
                alt="HackPack"
                width={1024}
                height={559}
                className="h-20 w-auto object-contain"
              />
            </a>

            {/* Popis */}
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
              Originální Apple příslušenství za férové ceny. Každý kus testován a připraven k expedici do 24 hodin.
            </p>

            {/* Trust pills */}
            <div className="flex flex-col gap-2">
              {trustItems.map(item => (
                <div key={item.label} className="inline-flex items-center gap-2.5 text-white/40 text-xs">
                  <item.icon size={13} className="text-primary shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Kontakty */}
            <div className="flex flex-col gap-2.5 pt-1 border-t border-white/8">
              <a
                href="tel:+420737565577"
                className="inline-flex items-center gap-2.5 text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                <Phone size={13} className="text-primary shrink-0" />
                <span>+420 737 565 577</span>
              </a>
              <a
                href="mailto:info@dodelat.cz"
                className="inline-flex items-center gap-2.5 text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                <Mail size={13} className="text-primary shrink-0" />
                <span>info@dodelat.cz</span>
              </a>
              <div className="inline-flex items-start gap-2.5 text-white/40 text-sm">
                <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                <span>Václavské nám. 1, 110 00 Praha 1</span>
              </div>
              <div className="inline-flex items-start gap-2.5 text-white/40 text-sm">
                <Clock size={13} className="text-primary shrink-0 mt-0.5" />
                <span>Po–Pá 9–18 h · So 10–14 h</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Separator — desktop only */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Nav columns — 3/6 */}
          {footerNav.map(col => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="text-white/70 font-semibold text-xs uppercase tracking-widest">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/35 text-sm hover:text-white/75 transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} HackPack s.r.o. — Všechna práva vyhrazena.
          </p>
          <div className="flex items-center gap-1">
            {[
              { label: "Obchodní podmínky",        href: "/obchodni-podminky"       },
              { label: "Ochrana osobních údajů",   href: "/ochrana-osobnich-udaju"  },
              { label: "Cookies",                  href: "/cookies"                 },
            ].map((link, i, arr) => (
              <span key={link.label} className="flex items-center gap-1">
                <a
                  href={link.href}
                  className="text-white/25 text-xs hover:text-white/55 transition-colors"
                >
                  {link.label}
                </a>
                {i < arr.length - 1 && (
                  <span className="text-white/15 text-xs select-none">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}