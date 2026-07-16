import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Obchodní podmínky | HackPack",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-text-base mb-5 pb-3 border-b border-border">{title}</h2>
      <div className="flex flex-col gap-4 text-text-muted text-base leading-relaxed [&_strong]:text-text-base [&_a]:text-primary-ink [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </div>
  );
}

export default function ObchodniPodminkyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">

          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={12} className="text-border" />
            <span className="text-text-muted">Obchodní podmínky</span>
          </nav>

          <h1 className="text-4xl font-extrabold text-text-base mb-2">Obchodní podmínky</h1>
          <p className="text-text-subtle text-sm mb-12">Platné od 1. 1. 2024</p>

          <Section title="1. Základní ustanovení">
            <p>Tyto obchodní podmínky (dále jen „podmínky") upravují vzájemná práva a povinnosti mezi prodávajícím a kupujícím při prodeji zboží prostřednictvím internetového obchodu <strong>HackPack</strong> provozovaného na adrese <strong>hackpack.cz</strong>.</p>
            <p>Prodávající: <strong>[NÁZEV FIRMY]</strong>, IČO: <strong>[IČO]</strong>, se sídlem <strong>[ADRESA SÍDLA]</strong>, zapsaná v obchodním rejstříku vedeném <strong>[SOUD A ODDÍL]</strong>.</p>
            <p>Kontaktní e-mail: <strong>[EMAIL]</strong><br />Telefon: <strong>[TELEFON]</strong></p>
          </Section>

          <Section title="2. Objednávka a uzavření smlouvy">
            <p>Webové rozhraní obchodu obsahuje seznam zboží nabízeného prodávajícím k prodeji. Ceny zboží jsou uvedeny včetně DPH. Nabídka prodeje zboží a ceny tohoto zboží zůstávají v platnosti po dobu, kdy jsou zobrazovány ve webovém rozhraní.</p>
            <p>Objednávku provedete vyplněním objednávkového formuláře. Před odesláním objednávky je vám umožněno zkontrolovat a měnit zadané údaje. Objednávku odešlete kliknutím na tlačítko „Objednat a zaplatit".</p>
            <p>Smlouva je uzavřena okamžikem doručení potvrzení objednávky na váš e-mail. Prodávající si vyhrazuje právo objednávku nepotvrdit v případě vyprodání zásob nebo zjevné chyby v ceně zboží.</p>
          </Section>

          <Section title="3. Ceny a platební podmínky">
            <p>Aktuální ceny jsou vždy uvedeny u jednotlivých produktů včetně DPH. Prodávající si vyhrazuje právo ceny měnit bez předchozího upozornění.</p>
            <p>Akceptované způsoby platby:</p>
            <ul>
              <li><strong>Online kartou</strong> — Visa, Mastercard, Apple Pay (platba proběhne okamžitě)</li>
              <li><strong>Bankovním převodem</strong> — zboží expedujeme po připsání platby na náš účet</li>
              <li><strong>Dobírkou</strong> — platba při převzetí zásilky (příplatek 39 Kč)</li>
            </ul>
          </Section>

          <Section title="4. Doprava a dodací podmínky">
            <p>Zboží expedujeme v pracovní dny. Objednávky přijaté do 14:00 odesíláme tentýž den.</p>
            <p>Dostupné způsoby dopravy:</p>
            <ul>
              <li><strong>PPL</strong> — doručení do 1–2 pracovních dní, 129 Kč</li>
              <li><strong>Zásilkovna</strong> — výdejní místo dle výběru, 89 Kč</li>
              <li><strong>DPD</strong> — doručení do 1–2 pracovních dní, 119 Kč</li>
            </ul>
            <p>Doprava zdarma při objednávce nad <strong>[ČÁSTKA] Kč</strong>.</p>
            <p>Při převzetí zásilky zkontrolujte neporušenost obalu. Viditelně poškozené zásilky reklamujte přímo u dopravce a neprodleně nás informujte na <strong>[EMAIL]</strong>.</p>
          </Section>

          <Section title="5. Odstoupení od smlouvy">
            <p>Jako spotřebitel máte právo odstoupit od smlouvy bez udání důvodu do <strong>14 dnů</strong> od převzetí zboží. My vám nad rámec zákona nabízíme rozšířenou lhůtu <strong>30 dní</strong>.</p>
            <p>Pro odstoupení nás kontaktujte e-mailem na <strong>[EMAIL]</strong>. Zboží zašlete zpět na adresu <strong>[ADRESA SKLADU]</strong> nejpozději do 14 dnů od oznámení odstoupení. Náklady na vrácení zboží nese kupující.</p>
            <p>Kupní cenu vrátíme do 14 dnů od obdržení vráceného zboží stejnou platební metodou, jakou jste použili při nákupu, pokud se nedohodneme jinak.</p>
            <p>Právo na odstoupení se nevztahuje na zboží upravené dle přání kupujícího nebo na zboží podléhající rychlé zkáze.</p>
          </Section>

          <Section title="6. Reklamace a práva z vadného plnění (Záruka)">
            <p>Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady. Na nové zboží se vztahuje zákonná lhůta pro uplatnění práv z vadného plnění v délce <strong>24 měsíců</strong>. U použitého nebo repasovaného zboží je tato lhůta <strong>12 měsíců</strong>.</p>
            <p>Projeví-li se vada v průběhu jednoho roku od převzetí, má se za to, že zboží bylo vadné již při převzetí, ledaže to povaha věci nebo vady vylučuje.</p>
            <p>V případě vady má kupující právo na odstranění vady opravou nebo dodáním nové věci. Není-li to možné, může kupující požadovat přiměřenou slevu nebo od smlouvy odstoupit.</p>
            <p>Reklamaci uplatněte e-mailem na <strong>[EMAIL]</strong> nebo písemně na adrese sídla. V reklamaci uveďte číslo objednávky, popis závady a zvolený způsob vyřízení. Podrobný technický postup a formuláře naleznete na naší stránce <Link href="/reklamace" className="text-primary-ink hover:underline font-bold">Reklamace a vrácení zboží</Link>.</p>
            <p>Reklamaci včetně odstranění vady vyřídíme bez zbytečného odkladu, nejpozději do <strong>30 dnů</strong>. Záruka se nevztahuje na poškození způsobené nesprávným používáním, mechanickým poškozením nebo přirozeným opotřebením.</p>
          </Section>

          <Section title="7. Mimosoudní řešení sporů">
            <p>K mimosoudnímu řešení spotřebitelských sporů je příslušná Česká obchodní inspekce, Štěpánská 567/15, 120 00 Praha 2, web: <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer">www.coi.cz</a>.</p>
            <p>Spotřebitel může rovněž využít platformu pro online řešení sporů dostupnou na <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.</p>
          </Section>

          <Section title="8. Závěrečná ustanovení">
            <p>Tyto podmínky jsou platné a účinné od <strong>1. 1. 2024</strong>. Prodávající si vyhrazuje právo podmínky měnit; aktuální verze bude vždy zveřejněna na těchto stránkách.</p>
            <p>Vztahy těmito podmínkami neupravené se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb., občanský zákoník, a zákonem č. 634/1992 Sb., o ochraně spotřebitele.</p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}