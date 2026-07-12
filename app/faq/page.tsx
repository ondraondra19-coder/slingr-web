"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronRight,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Package,
  Headphones,
  ChevronDown,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "doprava",
    icon: Truck,
    label: "Doprava & Doručení",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Jak rychle expedujete objednávky?",
        a: "Objednávky přijaté do 14:00 v pracovní den expedujeme ještě tentýž den. Ostatní objednávky odesíláme nejpozději následující pracovní den. O odeslání zásilky vás vždy informujeme e-mailem s číslem pro sledování.",
      },
      {
        q: "Jaké dopravní služby nabízíte?",
        a: "Spolupracujeme se třemi dopravci: PPL (doručení 1–2 pracovní dny, 129 Kč), Zásilkovna s výběrem výdejního místa (89 Kč) a DPD (doručení 1–2 pracovní dny, 119 Kč). Doprava je zdarma při objednávce nad 1 500 Kč.",
      },
      {
        q: "Doručujete i na Slovensko?",
        a: "Ano, doručujeme na celé území Slovenska. Cena dopravy a termín doručení se liší podle zvoleného dopravce. Přesné informace uvidíte při výběru dopravy v košíku.",
      },
      {
        q: "Co dělat, když zásilka nedorazí?",
        a: "Pokud zásilka nedorazí do 5 pracovních dní od odeslání, kontaktujte nás na info@dodelat.cz nebo telefonicky. Vše okamžitě prověříme u dopravce a situaci vyřešíme.",
      },
    ],
  },
  {
    id: "vraceni",
    icon: RotateCcw,
    label: "Vrácení & Reklamace",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Do kdy mohu vrátit zboží?",
        a: "Nad rámec zákonné 14denní lhůty nabízíme rozšířenou možnost vrácení do 30 dní od převzetí zásilky. Stačí nás kontaktovat e-mailem a zboží zaslat zpět na naši adresu. Náklady na vrácení nese kupující.",
      },
      {
        q: "V jakém stavu musí být vrácené zboží?",
        a: "Zboží by mělo být nepoužité, v původním obalu a kompletní (včetně veškerého příslušenství a dokumentace). Pokud bylo zboží použito nebo poškozeno, vyhrazujeme si právo snížit vrácenou částku o odpovídající část.",
      },
      {
        q: "Jak probíhá reklamace?",
        a: "Reklamaci nám nahlaste e-mailem na info@dodelat.cz s číslem objednávky, popisem závady a fotografií. Reklamaci vyřídíme do 30 dní. Na veškeré zboží se vztahuje zákonná záruka 24 měsíců.",
      },
      {
        q: "Kdy dostanu peníze zpět?",
        a: "Peníze vrátíme do 14 dní od obdržení vráceného zboží, stejnou platební metodou, jakou jste použili při nákupu — tedy na kartu, bankovní účet nebo jinak dle dohody.",
      },
    ],
  },
  {
    id: "platba",
    icon: CreditCard,
    label: "Platby",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Jaké způsoby platby přijímáte?",
        a: "Přijímáme platbu kartou online (Visa, Mastercard, Apple Pay), bankovním převodem předem a dobírkou při převzetí zásilky (příplatek 39 Kč). Platební brána je zabezpečena šifrováním SSL.",
      },
      {
        q: "Je platba kartou bezpečná?",
        a: "Absolutně. Platby kartou zpracovává certifikovaná platební brána se šifrováním 3D Secure. Číslo vaší karty v žádném okamžiku neprochází přes naše servery.",
      },
      {
        q: "Kdy mi bude odečtena platba z účtu?",
        a: "Při platbě kartou online je platba odečtena okamžitě po potvrzení objednávky. Při bankovním převodu čekáme na připsání platby, poté teprve zásilku expedujeme.",
      },
    ],
  },
  {
    id: "produkty",
    icon: Package,
    label: "Produkty & Záruka",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Jsou vaše produkty originální?",
        a: "Ano, prodáváme výhradně originální Apple příslušenství a produkty od ověřených distributorů. Každý kus procházíme kontrolou kvality před odesláním.",
      },
      {
        q: "Jak dlouhá je záruka?",
        a: "Na veškeré zboží poskytujeme zákonnou záruční lhůtu 24 měsíců. Záruka se vztahuje na výrobní vady a závady materiálu, nikoliv na poškození způsobené nesprávným užíváním.",
      },
      {
        q: "Prodáváte i repasované zboží?",
        a: "V aktuální nabídce máme pouze nové zboží. Pokud zvažujeme rozšíření o repasované produkty, budeme vás informovat prostřednictvím newsletteru.",
      },
      {
        q: "Mohu si produkt před koupí vyzkoušet?",
        a: "Fyzickou prodejnu v tuto chvíli neprovozujeme. Veškeré produkty lze vyzkoušet po doručení a v případě nespokojenosti vrátit do 30 dní bez udání důvodu.",
      },
    ],
  },
  {
    id: "podpora",
    icon: Headphones,
    label: "Zákaznická podpora",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Jak mohu kontaktovat zákaznickou podporu?",
        a: "Jsme k dispozici na e-mailu info@dodelat.cz, telefonicky na +420 737 565 577 (Po–Pá 9–17 h, So 10–14 h) nebo přes chat přímo na webu. Odpovídáme zpravidla do několika hodin.",
      },
      {
        q: "Jak dlouho trvá odpověď na e-mail?",
        a: "Snažíme se odpovídat do 4 pracovních hodin. V případě vysokého objemu dotazů odpovíme nejpozději do následujícího pracovního dne.",
      },
      {
        q: "Mohu sledovat stav své objednávky?",
        a: "Ano. Po expedici zásilky obdržíte e-mail s odkazem pro sledování zásilky u zvoleného dopravce. Stav objednávky můžete sledovat také ve svém zákaznickém účtu.",
      },
    ],
  },
  {
    id: "zabezpeceni",
    icon: ShieldCheck,
    label: "Bezpečnost & Soukromí",
    color: "text-primary",
    bg: "bg-primary/8",
    questions: [
      {
        q: "Jak chráníte moje osobní údaje?",
        a: "Vaše data zpracováváme v souladu s GDPR. Nepředáváme je třetím stranám za účelem marketingu. Veškerá komunikace je šifrována pomocí SSL. Podrobnosti najdete v sekci Ochrana osobních údajů.",
      },
      {
        q: "Ukládáte číslo mé platební karty?",
        a: "Ne. Čísla karet nikdy neukládáme ani k nim nemáme přístup. Platby zpracovává výhradně certifikovaná platební brána s PCI DSS certifikací.",
      },
    ],
  },
];

// ── Single accordion item ─────────────────────────────────────────────────────

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className={`border-b border-border last:border-0 transition-colors duration-200 ${
        isOpen ? "bg-surface/60" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-6 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center mt-0.5">
          <span className="text-[10px] font-bold text-text-subtle tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </span>

        <span className="flex-1 text-text-base font-semibold text-sm sm:text-base leading-snug group-hover:text-primary transition-colors duration-150">
          {question}
        </span>

        <span
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 ${
            isOpen
              ? "border-primary bg-primary text-white rotate-45"
              : "border-border-strong text-text-muted"
          }`}
        >
          <Plus size={12} strokeWidth={2.5} />
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-6 text-text-muted text-sm sm:text-base leading-relaxed pl-16">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({
  category,
  openKey,
  setOpenKey,
}: {
  category: typeof categories[0];
  openKey: string | null;
  setOpenKey: (k: string | null) => void;
}) {
  const Icon = category.icon;

  return (
    <div id={category.id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${category.bg} flex items-center justify-center shrink-0`}>
          <Icon size={17} className={category.color} />
        </div>
        <h2 className="text-lg font-bold text-text-base">{category.label}</h2>
        <span className="ml-auto text-text-subtle text-xs font-medium">
          {category.questions.length} otázky
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {category.questions.map((item, i) => {
          const key = `${category.id}-${i}`;
          return (
            <AccordionItem
              key={key}
              question={item.q}
              answer={item.a}
              isOpen={openKey === key}
              onToggle={() => setOpenKey(openKey === key ? null : key)}
              index={i}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("doprava");

  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);

  function scrollTo(id: string) {
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface">

        {/* Hero */}
        <div className="bg-header relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-14 lg:py-20 relative z-10">
            <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
              <a href="/" className="hover:text-white/60 transition-colors">Domů</a>
              <ChevronRight size={11} />
              <span className="text-white/60">Časté dotazy</span>
            </nav>

            <div className="max-w-2xl">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.18em] mb-4">
                Nápověda
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                Časté dotazy
              </h1>
              <p className="text-white/50 text-base leading-relaxed">
                Odpovědi na {totalQuestions} nejčastějších otázek zákazníků.
                Nenašli jste co hledáte?{" "}
                <a href="/kontakt" className="text-primary hover:underline font-medium">
                  Napište nám.
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* Sidebar */}
            <aside className="w-full lg:w-56 xl:w-64 shrink-0 lg:sticky lg:top-8 lg:self-start">
              <p className="text-text-subtle text-[11px] font-bold uppercase tracking-widest mb-3 px-1">
                Kategorie
              </p>
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0" style={{ scrollbarWidth: "none" }}>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => scrollTo(cat.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap lg:w-full text-left ${
                        activeCategory === cat.id
                          ? "bg-white border border-border shadow-sm text-text-base"
                          : "text-text-muted hover:text-text-base hover:bg-white/60"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={13} className={cat.color} />
                      </div>
                      <span className="hidden sm:block">{cat.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-white border border-border shadow-sm">
                <p className="text-text-base font-semibold text-sm mb-1">
                  Nenašli jste odpověď?
                </p>
                <p className="text-text-muted text-xs leading-relaxed mb-3">
                  Náš tým vám odpoví do pár hodin.
                </p>
                <a
                  href="/kontakt"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-105 transition-all"
                >
                  Napsat nám
                  <ChevronDown size={13} className="-rotate-90" />
                </a>
              </div>
            </aside>

            {/* Obsah */}
            <div className="flex-1 min-w-0 flex flex-col gap-10">
              {categories.map(cat => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  openKey={openKey}
                  setOpenKey={setOpenKey}
                />
              ))}

              {/* Spodní CTA s jedním tlačítkem */}
              <div className="rounded-2xl bg-header p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
                
                <div className="relative z-10 flex-1 text-center sm:text-left">
                  <p className="text-white font-bold text-xl mb-1">Stále máte otázku?</p>
                  <p className="text-white/50 text-sm">
                    Nenašli jste, co jste hledali? Náš tým je tu pro vás.
                  </p>
                </div>

                <div className="relative z-10 shrink-0">
                  <a
                    href="/kontakt"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                  >
                    Zeptejte se nás
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}