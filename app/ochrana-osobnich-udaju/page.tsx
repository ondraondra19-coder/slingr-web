import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Ochrana osobních údajů | HackPack",
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

export default function OchranaOsobnichUdajuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-dark">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">

          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={12} className="text-border" />
            <span className="text-text-muted">Ochrana osobních údajů</span>
          </nav>

          <h1 className="text-4xl font-extrabold text-text-base mb-2">Ochrana osobních údajů</h1>
          <p className="text-text-subtle text-sm mb-12">Platné od 1. 1. 2024 · v souladu s nařízením GDPR (EU) 2016/679</p>

          <Section title="1. Správce osobních údajů">
            <p>Správcem vašich osobních údajů je společnost <strong>[NÁZEV FIRMY]</strong>, IČO: <strong>[IČO]</strong>, se sídlem <strong>[ADRESA SÍDLA]</strong>.</p>
            <p>Kontakt na správce:<br />
            E-mail: <strong>[EMAIL]</strong><br />
            Telefon: <strong>[TELEFON]</strong></p>
            <p>Nejmenujeme pověřence pro ochranu osobních údajů, neboť nám tato povinnost nevzniká.</p>
          </Section>

          <Section title="2. Jaké osobní údaje zpracováváme">
            <p>V závislosti na tom, jak s námi komunikujete, zpracováváme tyto kategorie osobních údajů:</p>
            <ul>
              <li><strong>Identifikační údaje</strong> — jméno a příjmení, případně název firmy a IČO</li>
              <li><strong>Kontaktní údaje</strong> — e-mailová adresa, telefonní číslo</li>
              <li><strong>Adresní údaje</strong> — doručovací a fakturační adresa</li>
              <li><strong>Transakční údaje</strong> — číslo objednávky, zakoupené zboží, cena, způsob platby a dopravy</li>
              <li><strong>Technické údaje</strong> — IP adresa, typ prohlížeče, cookies (při návštěvě webu)</li>
            </ul>
          </Section>

          <Section title="3. Účely a právní základ zpracování">
            <p>Vaše osobní údaje zpracováváme pro tyto účely:</p>
            <ul>
              <li><strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b) GDPR) — zpracování objednávky, doručení zboží, vyřízení reklamace</li>
              <li><strong>Plnění právních povinností</strong> (čl. 6 odst. 1 písm. c) GDPR) — vedení účetnictví, daňové doklady, povinnosti dle zákona o ochraně spotřebitele</li>
              <li><strong>Oprávněný zájem</strong> (čl. 6 odst. 1 písm. f) GDPR) — ochrana před podvody, zlepšování našich služeb, přímý marketing vůči stávajícím zákazníkům</li>
              <li><strong>Souhlas</strong> (čl. 6 odst. 1 písm. a) GDPR) — zasílání newsletteru (pouze pokud jste se přihlásili k odběru)</li>
            </ul>
          </Section>

          <Section title="4. Doba uchování údajů">
            <p>Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování:</p>
            <ul>
              <li><strong>Údaje z objednávek</strong> — 10 let od uskutečnění objednávky (daňová povinnost)</li>
              <li><strong>Zákaznický účet</strong> — po dobu existence účtu, nejdéle 3 roky od poslední aktivity</li>
              <li><strong>Newsletter</strong> — do odvolání souhlasu</li>
              <li><strong>Cookies</strong> — dle nastavení prohlížeče, max. 13 měsíců</li>
            </ul>
          </Section>

          <Section title="5. Příjemci osobních údajů">
            <p>Vaše osobní údaje předáváme pouze v nezbytném rozsahu těmto kategoriím příjemců:</p>
            <ul>
              <li><strong>Dopravci</strong> — PPL, Zásilkovna, DPD (za účelem doručení zásilky)</li>
              <li><strong>Platební brána</strong> — zpracovatel plateb pro online platby kartou</li>
              <li><strong>Účetní software</strong> — pro vedení účetnictví a fakturace</li>
              <li><strong>E-mailový nástroj</strong> — pro rozesílání transakčních e-mailů a newsletteru</li>
              <li><strong>PostHog</strong> — analytický nástroj pro měření návštěvnosti webu, data jsou zpracovávána v rámci EU a pouze na základě vašeho souhlasu s analytickými cookies</li>
            </ul>
            <p>Všichni příjemci jsou vázáni povinností mlčenlivosti a zpracovávají údaje pouze v rozsahu nezbytném pro plnění svých úkolů. Údaje nepředáváme do třetích zemí mimo EU/EHP.</p>
          </Section>

          <Section title="6. Vaše práva">
            <p>V souvislosti se zpracováním vašich osobních údajů máte tato práva:</p>
            <ul>
              <li><strong>Právo na přístup</strong> — máte právo vědět, jaké údaje o vás zpracováváme</li>
              <li><strong>Právo na opravu</strong> — pokud jsou vaše údaje nepřesné, máte právo na jejich opravu</li>
              <li><strong>Právo na výmaz</strong> — za určitých podmínek můžete požádat o smazání vašich údajů</li>
              <li><strong>Právo na omezení zpracování</strong> — v určitých případech můžete žádat omezení zpracování</li>
              <li><strong>Právo na přenositelnost</strong> — máte právo získat vaše údaje ve strukturovaném formátu</li>
              <li><strong>Právo vznést námitku</strong> — proti zpracování na základě oprávněného zájmu</li>
              <li><strong>Právo odvolat souhlas</strong> — souhlas se zasíláním newsletteru můžete kdykoli odvolat</li>
            </ul>
            <p>Svá práva uplatněte e-mailem na <strong>[EMAIL]</strong>. Žádost vyřídíme bez zbytečného odkladu, nejpozději do 30 dnů.</p>
          </Section>

          <Section title="7. Cookies">
            <p>Náš web používá soubory cookies pro zajištění základní funkčnosti (např. obsah košíku) a pro analytické účely (sledování návštěvnosti). Technicky nezbytné cookies jsou ukládány na základě oprávněného zájmu. Analytické cookies vyžadují váš souhlas.</p>
            <p>Ukládání cookies můžete v prohlížeči omezit nebo zcela zakázat. Základní funkce webu budou i nadále dostupné, nicméně obsah košíku nebude uchován po zavření prohlížeče.</p>
          </Section>

          <Section title="8. Zabezpečení">
            <p>Veškerá komunikace mezi vaším prohlížečem a naším serverem je šifrována pomocí protokolu <strong>SSL/TLS</strong>. Přístup k osobním údajům je omezen pouze na oprávněné osoby. Pravidelně aktualizujeme bezpečnostní opatření v souladu s aktuálními standardy.</p>
          </Section>

          <Section title="9. Dozorový úřad">
            <p>Máte právo podat stížnost u dozorového úřadu, kterým je <strong>Úřad pro ochranu osobních údajů</strong>, Pplk. Sochora 27, 170 00 Praha 7, web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>.</p>
          </Section>

          <Section title="10. Změny tohoto dokumentu">
            <p>Tento dokument můžeme průběžně aktualizovat. O podstatných změnách vás budeme informovat e-mailem nebo oznámením na webu. Aktuální verze je vždy dostupná na této stránce.</p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}