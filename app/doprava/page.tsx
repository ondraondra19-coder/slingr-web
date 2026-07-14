import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronRight, Truck, MapPin, CreditCard, Wallet,
  Banknote, ShieldCheck, Clock, Package, ArrowRight,
  CheckCircle2, Zap, HelpCircle, Building2,
} from "lucide-react";
import { SHIPPING_PRICES } from "@/lib/shipping/pricing";
import { DOBIRKA_FEE } from "@/lib/fees";
import { formatPrice, CURRENCIES } from "@/lib/currency";

export const metadata = {
  title: "Doprava a platba | HackPack",
  description: "Přehled způsobů dopravy, platby a informace o expedici objednávek.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

// Ceny a dopravci ZDE musí odpovídat dopravyOptions v app/objednavka/page.tsx —
// jsou to jediné dopravce, které checkout skutečně nabízí.
const shippingMethods = [
  {
    icon: MapPin,
    title: "Zásilkovna — výdejní místo",
    tag: "Nejoblíbenější",
    tagColor: "text-primary bg-primary/10",
    desc: "Vyzvedněte si balíček na jednom z tisíců Z-Boxů a výdejních míst po celé ČR a SR. Čekací e-mail zašleme obratem.",
    price: formatPrice(SHIPPING_PRICES.zasilkovna_box.CZK, CURRENCIES.CZK),
    freeOver: 0,
    detail: "Více než 7 000 výdejních míst",
  },
  {
    icon: Truck,
    title: "Zásilkovna — na adresu",
    tag: "Komfortní",
    tagColor: "text-text-base bg-secondary",
    desc: "Kurýr Zásilkovny přiveze zásilku přímo ke dveřím. Doručení 1–2 pracovní dny.",
    price: formatPrice(SHIPPING_PRICES.zasilkovna_adresa.CZK, CURRENCIES.CZK),
    freeOver: 0,
    detail: "Doručení 1–2 pracovní dny",
  },
];

const paymentMethods = [
  {
    icon: CreditCard,
    title: "Platba kartou online",
    desc: "Rychlá a bezpečná platba přes certifikovanou bránu. Podporujeme Visa a Mastercard.",
    price: "Zdarma",
    isFree: true,
  },
  {
    icon: Wallet,
    title: "Apple Pay / Google Pay",
    desc: "Okamžitá platba jedním dotykem. Dostupná v Safari a Chrome na všech zařízeních.",
    price: "Zdarma",
    isFree: true,
  },    
  {
    icon: Building2,
    title: "Bankovní převod",
    desc: "Pokyny k platbě obdržíte v potvrzovacím e-mailu. Zásilku expedujeme po připsání.",
    price: "Zdarma",
    isFree: true,
  },
  {
    icon: Banknote,
    title: "Dobírka",
    desc: "Při doručení na adresu platíte hotově nebo kartou kurýrovi. U výdejního Z-BOXu se dobírka platí předem v aplikaci Zásilkovna nebo přes odkaz z e-mailu.",
    price: `+ ${formatPrice(DOBIRKA_FEE.CZK, CURRENCIES.CZK)}`,
    isFree: false,
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Expedice tentýž den",
    text: "Objednávky přijaté do 14:00 odesíláme ještě tentýž pracovní den.",
  },
  {
    icon: ShieldCheck,
    title: "Pojištěné zásilky",
    text: "Každý balíček je pojištěn proti poškození nebo ztrátě během přepravy.",
  },
  {
    icon: Package,
    title: "Pečlivé balení",
    text: "Každý produkt balíme do ochranného obalu tak, aby dorazil v perfektním stavu.",
  },
  {
    icon: Clock,
    title: "Sledování zásilky",
    text: "Po odeslání obdržíte odkaz pro sledování zásilky v reálném čase.",
  },
];

// ── Komponenty ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-subtle mb-3">
      {children}
    </p>
  );
}

// ── Stránka ───────────────────────────────────────────────────────────────────

export default function DopravaAPlatbaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface">

        {/* ── Hero — vráceno na tmavý styl (text-white) ── */}
        <div className="bg-header relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-14 lg:py-20 relative z-10">
            <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <a href="/" className="hover:text-white/60 transition-colors">Domů</a>
              <ChevronRight size={11} />
              <span className="text-white/60">Doprava a platba</span>
            </nav>

            <div className="max-w-2xl">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.18em] mb-4">
                Informace pro zákazníky
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                Doprava & Platba
              </h1>
              <p className="text-white/50 text-base leading-relaxed">
                Záleží nám na tom, aby k vám balíček dorazil rychle a bezpečně.
                Vyberte si způsob dopravy a platby, který vám nejlépe vyhovuje.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

          {/* ── Benefity ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {benefits.map(b => (
              <div
                key={b.title}
                className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                  <b.icon size={17} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-base font-bold text-sm mb-1">{b.title}</p>
                  <p className="text-text-muted text-xs leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Doprava ── */}
          <section className="mb-16">
            <SectionLabel>Způsoby dopravy</SectionLabel>
            <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-8">
              Jak vám zásilku doručíme
            </h2>

            <div className="flex flex-col gap-4">
              {shippingMethods.map(s => (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
                      <s.icon size={24} className="text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-text-base font-bold text-base">{s.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.tagColor}`}>
                          {s.tag}
                        </span>
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed mb-2">{s.desc}</p>
                      <p className="text-text-subtle text-xs font-medium">{s.detail}</p>
                    </div>
                    <div className="shrink-0 text-right sm:min-w-[120px]">
                      <p className="text-2xl font-extrabold text-text-base leading-none mb-1.5">
                        {s.price}
                      </p>
                      {s.freeOver > 0 && (
                        <div className="inline-flex items-center gap-1 text-primary text-[11px] font-bold">
                          <CheckCircle2 size={11} />
                          Zdarma nad {s.freeOver} Kč
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Platba ── */}
          <section className="mb-16">
            <SectionLabel>Způsoby platby</SectionLabel>
            <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-8">
              Jak za objednávku zaplatit
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paymentMethods.map(p => (
                <div
                  key={p.title}
                  className="flex gap-5 p-6 bg-white rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-all duration-200"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <p.icon size={20} className="text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-text-base font-bold text-sm">{p.title}</h3>
                      <span className={`shrink-0 text-sm font-extrabold leading-none ${
                        p.isFree ? "text-primary" : "text-text-base"
                      }`}>
                        {p.price}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Zabezpečení ── */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2 bg-primary shrink-0" />
                <div className="flex-1 p-8 flex flex-col sm:flex-row items-start gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                    <ShieldCheck size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-text-base font-bold text-base mb-2">
                      Bezpečné platby — chráníme vaše údaje
                    </p>
                    <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                      Online platby kartou jsou realizovány přes zabezpečenou platební bránu
                      s certifikací <strong className="text-text-base">PCI DSS</strong> a protokolem{" "}
                      <strong className="text-text-base">3D Secure</strong>.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {["Visa", "Mastercard", "Apple Pay", "Google Pay"].map(brand => (
                        <span
                          key={brand}
                          className="px-3 py-1.5 rounded-lg border border-border bg-surface text-text-muted text-xs font-semibold"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA — vráceno na tmavý styl (text-white) ── */}
          <div className="rounded-2xl bg-header relative overflow-hidden p-10 lg:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
            <HelpCircle className="absolute -bottom-10 -left-10 w-48 h-48 text-white/[0.03]" />

            <div className="relative z-10">
              <p className="text-white font-extrabold text-2xl mb-2">Máte dotaz k dopravě?</p>
              <p className="text-white/70 text-sm">
                Rádi poradíme — Po–Pá 9–18 h, So 10–14 h.
              </p>
            </div>

            <a
              href="/kontakt"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
            >
              Kontaktovat nás
              <ArrowRight size={15} />
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}