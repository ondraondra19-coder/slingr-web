import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Headphones, HelpCircle, ArrowRight } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "100% originální produkty", desc: "Prodáváme pouze originální Apple příslušenství od ověřených dodavatelů." },
  { icon: Truck, title: "Expedice do 24 hodin", desc: "Objednávky přijaté do 14:00 odesíláme ještě tentýž den." },
  { icon: RotateCcw, title: "30 dní na vrácení", desc: "Vrácení zboží bez otázek do 30 dní od doručení." },
  { icon: Headphones, title: "Lidský přístup", desc: "Za každou objednávkou stojí skuteční lidé, kteří jsou tu pro vás." },
];

const team = [
  { name: "Jan Novák", role: "Zakladatel & CEO", img: "/images/tym/jan.jpg" },
  { name: "Petra Svobodová", role: "Zákaznický servis", img: "/images/tym/petra.jpg" },
  { name: "Lukáš Dvořák", role: "Logistika", img: "/images/tym/lukas.jpg" },
  { name: "Marie Horáková", role: "Marketing", img: "/images/tym/marie.jpg" },
];

export default function ONasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark">

        {/* Hero — fotka týmu přes celou šířku */}
        <div className="relative w-full h-screen overflow-hidden rounded-2xl bg-secondary">
          <Image src="/images/page/hero-product.jpg" alt="Náš tým" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Breadcrumb — nahoře přes obrázek */}
          <div className="absolute top-0 right-15 w-full px-8 md:px-16 lg:px-24 pt-6">
            <nav className="flex items-center gap-2 text-xs text-white/50">
              <a href="/" className="hover:text-white/80 transition-colors">Domů</a>
              <ChevronRight size={12} />
              <span className="text-white/80">O nás</span>
            </nav>
          </div>

          {/* Text dole */}
          <div className="absolute bottom-0 left-0 w-full px-8 md:px-16 lg:px-24 pb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Jsme HackPack
            </h1>
            <p className="text-white/70 text-lg mt-3 max-w-xl">
              Český e-shop s prémiovým příslušenstvím pro Apple. Fungujeme od roku 2023.
            </p>
          </div>
        </div>

        {/* Příběh */}
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16 lg:px-24 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-text-subtle text-xs font-semibold uppercase tracking-widest mb-3">Náš příběh</p>
              <h2 className="text-3xl font-extrabold text-text-base mb-6 leading-tight">Začalo to frustrací z nekvalitního příslušenství</h2>
              <p className="text-text-muted text-base leading-relaxed mb-4">
                Unaveni z levných náhražek které se rozpadaly po týdnu, rozhodli jsme se vytvořit obchod kde kvalita není kompromis. HackPack vznikl s jedním cílem — nabídnout prémiové Apple příslušenství za férové ceny.
              </p>
              <p className="text-text-muted text-base leading-relaxed">
                Dnes zásobujeme stovky spokojených zákazníků po celé České republice a Slovensku. Každý produkt v našem katalogu jsme osobně otestovali.
              </p>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden bg-secondary">
              <Image src="/images/page/setup.jpg" alt="Naše prodejna" fill className="object-cover" />
            </div>
          </div>

          {/* Hodnoty */}
          <div className="mb-20">
            <p className="text-text-subtle text-xs font-semibold uppercase tracking-widest mb-3 text-center">Proč si vybrat nás</p>
            <h2 className="text-3xl font-extrabold text-text-base mb-10 text-center">Naše hodnoty</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center">
                    <v.icon size={22} className="text-primary-ink" />
                  </div>
                  <p className="text-text-base font-semibold text-sm">{v.title}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tým */}
          <div className="mb-20">
            <p className="text-text-subtle text-xs font-semibold uppercase tracking-widest mb-3 text-center">Lidé za obchodem</p>
            <h2 className="text-3xl font-extrabold text-text-base mb-10 text-center">Poznej náš tým</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center gap-3">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-secondary">
                    <Image src={member.img} alt={member.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-text-base font-semibold text-sm">{member.name}</p>
                    <p className="text-text-subtle text-xs mt-0.5">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <HelpCircle className="absolute -bottom-10 -left-10 w-48 h-48 text-white/[0.03]" />

            <div className="relative z-10">
              <p className="text-white font-extrabold text-2xl mb-2">Máte dotaz?</p>
              <p className="text-white/70 text-sm">
                Rádi poradíme — Po–Pá 9–18 h, So 10–14 h.
              </p>
            </div>

            <a
              href="/kontakt"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
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