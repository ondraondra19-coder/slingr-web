"use client";

// Stránka /doprava — psaná ve stejném duchu jako /reklamace: obsah leží přímo
// na světlém pozadí, oddělují ho jen vlasové linky a mezery. Žádné bílé karty
// s rámečkem. Jediný "blok" na stránce je tmavé CTA dole, stejně jako tam.
//
// Nadpisy sekcí drží vlastní sloupec vlevo (na lg lepivý), obsah teče vpravo —
// odtud ten klidný, přehledný rytmus. Na mobilu se sloupce složí pod sebe.
//
// Ceny se NIKDY nepíšou do textů v messages/*.json — berou se z jediného
// zdroje pravdy (lib/shipping/pricing, lib/fees), ať se nerozejdou s tím, co
// reálně spočítá checkout. Stejně tak nabídka plateb respektuje feature flag,
// takže tu nesvítí způsob platby, který si zákazník v objednávce nevybere.
import Link from "next/link";
import { ChevronRight, Clock, MapPin, BellRing, RotateCcw, ArrowRight, HelpCircle } from "lucide-react";
import { SHIPPING_PRICES } from "@/lib/shipping/pricing";
import { DOBIRKA_FEE } from "@/lib/fees";
import { isBankTransferEnabled } from "@/lib/featureFlags";
import { formatPrice, getPrice, type Currency } from "@/lib/currency";
import { useCurrency } from "@/lib/CurrencyContext";
import { useT, type T } from "@/lib/useT";

type Option = {
  id: string;
  name: string;
  desc: string;
  meta: string;
  price: string;
  free?: boolean;
};

function buildShipping(t: T, currency: Currency): Option[] {
  return [
    {
      id: "zasilkovna_box",
      name: t("ship1Name"),
      desc: t("ship1Desc"),
      meta: t("ship1Meta"),
      price: formatPrice(getPrice(SHIPPING_PRICES.zasilkovna_box, currency), currency),
    },
    {
      id: "zasilkovna_adresa",
      name: t("ship2Name"),
      desc: t("ship2Desc"),
      meta: t("ship2Meta"),
      price: formatPrice(getPrice(SHIPPING_PRICES.zasilkovna_adresa, currency), currency),
    },
  ];
}

function buildPayment(t: T, currency: Currency): Option[] {
  const options: Option[] = [
    {
      id: "karta",
      name: t("pay1Name"),
      desc: t("pay1Desc"),
      meta: t("pay1Meta"),
      price: t("free"),
      free: true,
    },
    {
      id: "dobirka",
      name: t("pay3Name"),
      desc: t("pay3Desc"),
      meta: t("pay3Meta"),
      price: `+ ${formatPrice(getPrice(DOBIRKA_FEE, currency), currency)}`,
    },
  ];

  // Bankovní převod je v produkci dočasně vypnutý (chybí IČO na dokladu).
  // Dokud si ho zákazník nemůže vybrat v objednávce, nemá co slibovat ani tady.
  if (isBankTransferEnabled()) {
    options.splice(1, 0, {
      id: "prevod",
      name: t("pay2Name"),
      desc: t("pay2Desc"),
      meta: t("pay2Meta"),
      price: t("free"),
      free: true,
    });
  }

  return options;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-subtle mb-3">
      {children}
    </p>
  );
}

// Nadpis sekce v levém sloupci, obsah v pravém. Na lg zůstává nadpis při
// rolování na místě, ať je pořád vidět, u čeho zákazník je.
//
// Linka nahoře jde přes OBA sloupce — nadpis i obsah pod ní tak čtou jako
// jedna skupina. Je o odstín silnější než linky uvnitř sekce, ať je jasné,
// která dělí sekce a která jen řádky.
function Section({
  eyebrow, title, lead, children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t-2 border-text-base/25 pt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-16">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2 className="text-2xl font-extrabold text-text-base tracking-tight leading-tight">{title}</h2>
        {lead && <p className="text-text-muted text-sm leading-relaxed mt-3">{lead}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

// Řádek ceníku: název + popis vlevo, cena vpravo. Odděluje ho vlasová linka,
// ne rámeček — proto je celá sekce jen `divide-y`.
function PriceRow({ option }: { option: Option }) {
  return (
    <div className="flex items-start justify-between gap-6 sm:gap-10 py-7 first:pt-0">
      <div className="min-w-0">
        <p className="text-text-base font-bold text-lg leading-snug">{option.name}</p>
        <p className="text-text-muted text-sm leading-relaxed mt-1.5 max-w-xl">{option.desc}</p>
        <p className="flex items-center gap-1.5 text-text-subtle text-xs mt-3">
          <Clock size={12} aria-hidden="true" />
          {option.meta}
        </p>
      </div>
      <p className={`shrink-0 text-xl sm:text-2xl font-extrabold tabular-nums whitespace-nowrap ${option.free ? "text-primary-ink" : "text-text-base"}`}>
        {option.price}
      </p>
    </div>
  );
}

export default function DopravaClient() {
  const t = useT("shipping");
  const { currency } = useCurrency();

  const shipping = buildShipping(t, currency);
  const payment = buildPayment(t, currency);

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
    { title: t("step4Title"), desc: t("step4Desc") },
  ];

  const facts = [
    { icon: MapPin, title: t("fact1Title"), desc: t("fact1Desc") },
    { icon: Clock, title: t("fact2Title"), desc: t("fact2Desc") },
    { icon: BellRing, title: t("fact3Title"), desc: t("fact3Desc") },
    { icon: RotateCcw, title: t("fact4Title"), desc: t("fact4Desc") },
  ];

  return (
    <main className="min-h-screen bg-surface">

      {/* ── Hero ── */}
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
            <Link href="/" className="hover:text-white/60 transition-colors">{t("home")}</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <span className="text-white/60">{t("breadcrumb")}</span>
          </nav>

          <div className="max-w-2xl">
            <p className="text-primary-ink text-xs font-bold uppercase tracking-[0.18em] mb-4">{t("eyebrow")}</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              {t("title")}
            </h1>
            <p className="text-white/50 text-base leading-relaxed">{t("intro")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16 flex flex-col gap-14 lg:gap-20">

        {/* ── Doprava ── */}
        <Section eyebrow={t("shippingEyebrow")} title={t("shippingTitle")} lead={t("shippingLead")}>
          <div className="divide-y divide-border">
            {shipping.map((o) => <PriceRow key={o.id} option={o} />)}
          </div>
          <p className="text-text-subtle text-xs leading-relaxed mt-7">{t("shippingNote")}</p>
        </Section>

        {/* ── Platba ── */}
        <Section eyebrow={t("paymentEyebrow")} title={t("paymentTitle")} lead={t("paymentLead")}>
          <div className="divide-y divide-border">
            {payment.map((o) => <PriceRow key={o.id} option={o} />)}
          </div>
          <p className="text-text-subtle text-xs leading-relaxed mt-7">{t("paymentNote")}</p>
        </Section>

        {/* ── Průběh objednávky ── */}
        <Section eyebrow={t("stepsEyebrow")} title={t("stepsTitle")}>
          {/* Svislá časová osa: kolečko s číslem a linka, která ho spojuje
              s dalším krokem (u posledního se nekreslí). Stejný vzor jako
              na /reklamace. */}
          <ol className="flex flex-col">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 relative">
                {i < steps.length - 1 && (
                  <div aria-hidden="true" className="absolute left-[19px] top-12 w-0.5 h-[calc(100%-8px)] bg-border" />
                )}
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm z-10">
                  {i + 1}
                </div>
                <div className={`flex-1 ${i < steps.length - 1 ? "pb-10" : ""}`}>
                  <h3 className="text-text-base font-bold text-base mb-1.5">{s.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xl">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Dobré vědět ── */}
        <Section eyebrow={t("factsEyebrow")} title={t("factsTitle")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {facts.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <f.icon size={17} className="text-primary-ink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-text-base font-bold text-sm">{f.title}</p>
                  <p className="text-text-muted text-sm leading-relaxed mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA ── */}
        <div className="rounded-2xl bg-header relative overflow-hidden p-10 lg:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <HelpCircle className="absolute -bottom-10 -left-10 w-48 h-48 text-white/[0.03]" aria-hidden="true" />

          <div className="relative z-10">
            <p className="text-white font-extrabold text-2xl mb-2">{t("ctaTitle")}</p>
            <p className="text-white/70 text-sm">{t("ctaDesc")}</p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-5">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-white/60 text-sm font-semibold hover:text-white transition-colors whitespace-nowrap"
            >
              {t("ctaFaq")}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              {t("ctaButton")}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
