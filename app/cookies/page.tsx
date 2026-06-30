// app/cookies/page.tsx
// Metadata export musí být v Server Componentu — tlačítko "Změnit nastavení"
// je v oddělené Client komponentě níže.

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Cookie, Settings, BarChart2, Megaphone } from "lucide-react";
import ResetConsentButton from "./Resetconsentbutton";

export const metadata = {
  title: "Zásady cookies | TechGadgets",
  description: "Informace o tom, jaké cookies TechGadgets používá.",
};

const categories = [
  {
    icon: Settings,
    color: "text-blue-600",
    bg: "bg-blue-50",
    name: "Nezbytné cookies",
    required: true,
    description:
      "Tyto cookies jsou nezbytné pro správné fungování webu a nelze je vypnout. Zajišťují obsah košíku, zvolenou měnu a jazykové nastavení.",
    examples: [
      { name: "techgadgets-cart",           purpose: "Obsah nákupního košíku",            expiry: "Lokální úložiště" },
      { name: "techgadgets-currency",        purpose: "Vybraná měna zobrazení cen",         expiry: "Lokální úložiště" },
      { name: "techgadgets-cookie-consent",  purpose: "Uložení vašeho souhlasu s cookies",  expiry: "Lokální úložiště" },
      { name: "googtrans",                   purpose: "Jazyková volba (Google Translate)",   expiry: "Relace"           },
    ],
  },
  {
    icon: BarChart2,
    color: "text-green-600",
    bg: "bg-green-50",
    name: "Analytické cookies",
    required: false,
    description:
      "Pomáhají nám pochopit, jak návštěvníci web používají. Aktuálně tyto cookies nepoužíváme — plánujeme je v budoucnu (Google Analytics 4). Budou aktivovány pouze po vašem souhlasu.",
    examples: [
      { name: "Google Analytics 4", purpose: "Sledování návštěvnosti (plánováno)", expiry: "Do 2 let" },
    ],
  },
  {
    icon: Megaphone,
    color: "text-orange-600",
    bg: "bg-orange-50",
    name: "Marketingové cookies",
    required: false,
    description:
      "Marketingové cookies umožňují zobrazovat personalizované reklamy. Tyto cookies aktuálně nepoužíváme ani neplánujeme.",
    examples: [
      { name: "—", purpose: "Momentálně žádné marketingové cookies nepoužíváme", expiry: "—" },
    ],
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-text-base mb-4 pb-3 border-b border-border">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-text-muted text-base leading-relaxed [&_strong]:text-text-base [&_a]:text-primary [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:text-sm">
        {children}
      </div>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={11} className="text-border" />
            <span className="text-text-muted">Zásady cookies</span>
          </nav>

          {/* Hero */}
          <div className="flex items-start gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
              <Cookie size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-base tracking-tight mb-1.5">
                Zásady cookies
              </h1>
              <p className="text-text-subtle text-sm">Naposledy aktualizováno: 1. 1. 2024</p>
            </div>
          </div>

          <Section title="Co jsou cookies?">
            <p>
              Cookies jsou malé textové soubory ukládané do vašeho prohlížeče při návštěvě webové stránky.
              Slouží k zapamatování vašich preferencí, obsahu košíku nebo zvoleného jazyka.
              Na webu TechGadgets používáme výhradně vlastní cookies uložené v lokálním úložišti
              prohlížeče (localStorage). Nepoužíváme cookies třetích stran pro reklamní účely.
            </p>
          </Section>

          <Section title="Jaké cookies používáme">
            <div className="flex flex-col gap-5 mt-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.name} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                      <div className={`w-8 h-8 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={15} className={cat.color} />
                      </div>
                      <span className="text-text-base font-bold text-sm flex-1">{cat.name}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        cat.required ? "text-primary bg-primary/8" : "text-text-subtle bg-border"
                      }`}>
                        {cat.required ? "Vždy aktivní" : "Volitelné"}
                      </span>
                    </div>
                    <div className="px-5 py-4 border-b border-border">
                      <p className="text-text-muted text-sm leading-relaxed">{cat.description}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-surface">
                            <th className="text-left text-text-subtle font-semibold px-5 py-2.5 w-1/3">Název</th>
                            <th className="text-left text-text-subtle font-semibold px-5 py-2.5">Účel</th>
                            <th className="text-left text-text-subtle font-semibold px-5 py-2.5 whitespace-nowrap">Platnost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.examples.map((ex, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-5 py-3 font-mono text-text-base text-[11px] align-top">{ex.name}</td>
                              <td className="px-5 py-3 text-text-muted align-top">{ex.purpose}</td>
                              <td className="px-5 py-3 text-text-subtle whitespace-nowrap align-top">{ex.expiry}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Správa souhlasu">
            <p>
              Svůj souhlas s cookies lze kdykoliv odvolat kliknutím na tlačítko níže.
              Po odvolání se banner znovu zobrazí a budete moci rozhodnout znovu.
              Souhlas je uložen v lokálním úložišti vašeho prohlížeče.
            </p>
            {/* Client komponenta — pouze tlačítko s onClick */}
            <ResetConsentButton />
          </Section>

          <Section title="Správa cookies v prohlížeči">
            <p>Cookies lze blokovat nebo smazat přímo v nastavení prohlížeče:</p>
            <ul>
              {[
                { name: "Google Chrome",   href: "https://support.google.com/chrome/answer/95647" },
                { name: "Mozilla Firefox", href: "https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies" },
                { name: "Safari (macOS)", href: "https://support.apple.com/cs-cz/guide/safari/sfri11471/mac" },
                { name: "Microsoft Edge", href: "https://support.microsoft.com/cs-cz/microsoft-edge" },
              ].map(b => (
                <li key={b.name}>
                  <a href={b.href} target="_blank" rel="noopener noreferrer">{b.name}</a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Kontakt">
            <p>
              Máte-li otázky k používání cookies,{" "}
              kontaktujte nás na{" "}
              <a href="mailto:info@techgadgets.cz">info@techgadgets.cz</a>{" "}
              nebo přes <a href="/kontakt">kontaktní formulář</a>.
            </p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}