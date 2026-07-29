"use client";

// Stránka /faq — stejný systém jako /doprava a /reklamace: obsah leží přímo na
// světlém pozadí, dělí ho vlasové linky. Žádné bílé karty s rámečkem, jediný
// blok je tmavé CTA dole.
//
// Nadpis kategorie drží vlastní sloupec vlevo (na lg lepivý), otázky tečou
// vpravo. Rozbalená odpověď se otevírá přes grid-rows (0fr → 1fr), ne přes
// pevné max-h — dlouhá odpověď se tak nikdy neuřízne.
import { useState, useId } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Plus, ArrowRight, HelpCircle } from "lucide-react";
import { useT, type T } from "@/lib/useT";

// ── Data ──────────────────────────────────────────────────────────────────────

type FaqCategory = {
  id: string;
  label: string;
  questions: { q: string; a: string }[];
};

// Otázky i odpovědi žijí v messages/*.json — tady zůstává jen struktura
// (pořadí). Klíče jsou vypsané, ne skládané přes `t(\`${id}Q${n}\`)`,
// aby je našel scripts/check-messages.mjs.
function buildCategories(t: T): FaqCategory[] {
  return [
    {
      id: "doprava", label: t("catShipping"),
      questions: [
        { q: t("shippingQ1"), a: t("shippingA1") },
        { q: t("shippingQ2"), a: t("shippingA2") },
        { q: t("shippingQ3"), a: t("shippingA3") },
        { q: t("shippingQ4"), a: t("shippingA4") },
      ],
    },
    {
      id: "vraceni", label: t("catReturns"),
      questions: [
        { q: t("returnsQ1"), a: t("returnsA1") },
        { q: t("returnsQ2"), a: t("returnsA2") },
        { q: t("returnsQ4"), a: t("returnsA4") },
      ],
    },
    {
      id: "platba", label: t("catPayment"),
      questions: [
        { q: t("paymentQ1"), a: t("paymentA1") },
        { q: t("paymentQ2"), a: t("paymentA2") },
        { q: t("paymentQ3"), a: t("paymentA3") },
      ],
    },
    {
      id: "produkty", label: t("catProducts"),
      questions: [
        { q: t("productsQ1"), a: t("productsA1") },
        { q: t("productsQ2"), a: t("productsA2") },
        { q: t("productsQ3"), a: t("productsA3") },
        { q: t("productsQ4"), a: t("productsA4") },
      ],
    },
    {
      id: "podpora", label: t("catSupport"),
      questions: [
        { q: t("supportQ1"), a: t("supportA1") },
        { q: t("supportQ2"), a: t("supportA2") },
        { q: t("supportQ3"), a: t("supportA3") },
      ],
    },
    {
      id: "zabezpeceni", label: t("catSecurity"),
      questions: [
        { q: t("securityQ1"), a: t("securityA1") },
        { q: t("securityQ2"), a: t("securityA2") },
      ],
    },
  ];
}

// ── Jedna otázka ──────────────────────────────────────────────────────────────

function Question({
  question, answer, isOpen, onToggle, isFirst,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isFirst: boolean;
}) {
  const panelId = useId();

  return (
    <div>
      {/* První otázka nemá horní odsazení, aby začínala přesně v jedné rovině
          s číslem sekce v levém sloupci. */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`w-full flex items-start justify-between gap-6 pb-5 text-left group ${isFirst ? "pt-0" : "pt-5"}`}
      >
        <span className={`text-base font-semibold leading-snug transition-colors ${isOpen ? "text-primary-ink" : "text-text-base group-hover:text-primary-ink"}`}>
          {question}
        </span>
        <Plus
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className={`shrink-0 mt-1 transition-all duration-300 ${isOpen ? "rotate-45 text-primary-ink" : "text-text-subtle group-hover:text-text-muted"}`}
        />
      </button>

      {/* 0fr → 1fr místo max-h: odpověď se rozbalí přesně na svou výšku,
          takže ani ta nejdelší nekončí uříznutá. */}
      <div
        id={panelId}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="text-text-muted text-sm sm:text-[15px] leading-relaxed pb-6 pr-8 max-w-3xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Stránka ───────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const t = useT("faq");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const categories = buildCategories(t);
  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);

  return (
    <>
      <Header />
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
              <span className="text-white/60">{t("title")}</span>
            </nav>

            <div className="max-w-2xl">
              <p className="text-primary-ink text-xs font-bold uppercase tracking-[0.18em] mb-4">
                {t("eyebrow")}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                {t("title")}
              </h1>
              <p className="text-white/50 text-base leading-relaxed">
                {t("intro", { count: totalQuestions })}{" "}
                <Link href="/kontakt" className="text-primary-ink hover:underline font-medium">
                  {t("introLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">

          {/* ── Rychlé odskoky ── */}
          {/* Jen text oddělený tečkami, žádné pilulky ani tlačítka. Na úzkém
              displeji se dá vodorovně odrolovat. */}
          <nav
            aria-label={t("categories")}
            className="flex items-center gap-x-6 gap-y-2 flex-wrap py-6"
          >
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-text-muted text-sm hover:text-primary-ink transition-colors whitespace-nowrap"
              >
                {cat.label}
              </a>
            ))}
          </nav>

          <div className="pb-12 lg:pb-16 flex flex-col gap-14 lg:gap-20">
            {categories.map((cat, catIndex) => (
              /* Linka nahoře jde přes OBA sloupce — nadpis i otázky pod ní tak
                 čtou jako jedna skupina. Je o odstín silnější než linky mezi
                 otázkami, ať je jasné, která dělí sekce a která jen řádky. */
              <section
                key={cat.id}
                id={cat.id}
                className="scroll-mt-8 border-t-2 border-text-base/25 pt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-16"
              >
                <div className="lg:sticky lg:top-8 lg:self-start">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-subtle mb-3 tabular-nums">
                    {String(catIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-2xl font-extrabold text-text-base tracking-tight leading-tight">
                    {cat.label}
                  </h2>
                  <p className="text-text-subtle text-sm mt-3">
                    {t.plural(cat.questions.length, "questionCount")}
                  </p>
                </div>

                <div className="min-w-0 divide-y divide-border">
                  {cat.questions.map((item, i) => {
                    const key = `${cat.id}-${i}`;
                    return (
                      <Question
                        key={key}
                        question={item.q}
                        answer={item.a}
                        isOpen={openKey === key}
                        onToggle={() => setOpenKey(openKey === key ? null : key)}
                        isFirst={i === 0}
                      />
                    );
                  })}
                </div>
              </section>
            ))}

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

              <Link
                href="/kontakt"
                className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
              >
                {t("ctaButton")}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
