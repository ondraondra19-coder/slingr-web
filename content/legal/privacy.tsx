"use client";

// content/legal/privacy.tsx
// Zásady ochrany osobních údajů ve všech třech jazycích.
//
// ZÁVAZNÁ JE ČESKÁ VERZE — viz doložka v LegalLayout. Když měníš text, měň ho
// primárně v `cs` a ostatní srovnej podle něj.
//
// Seznam příjemců v sekci 5 dřív uváděl PPL a DPD; e-shop je nikdy nenabízel,
// takže jsme zákazníkům tvrdili, že jejich adresu předáváme dopravcům, se
// kterými nemáme nic společného. U dokumentu o ochraně údajů to není detail.

import { Section } from "@/components/legal/LegalLayout";
import type { Locale } from "@/lib/locale";
import { COMPANY, companyField } from "@/lib/companyInfo";

export const PRIVACY_EFFECTIVE_FROM = "1. 1. 2024";

// ── Čeština — závazné znění ───────────────────────────────────────────────────

function PrivacyCs() {
  return (
    <>
      <Section title="1. Správce osobních údajů">
        <p>Správcem vašich osobních údajů je společnost <strong>{companyField(COMPANY.name, "NÁZEV FIRMY")}</strong>, IČO: <strong>{companyField(COMPANY.companyId, "IČO")}</strong>, se sídlem <strong>{companyField(COMPANY.address, "ADRESA SÍDLA")}</strong>.</p>
        <p>Kontakt na správce:<br />
        E-mail: <strong>{COMPANY.email}</strong><br />
        Telefon: <strong>{COMPANY.phone}</strong></p>
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
          <li><strong>Dopravce</strong> — Zásilkovna (za účelem doručení zásilky)</li>
          <li><strong>Platební brána</strong> — Stripe (zpracovatel plateb pro online platby kartou)</li>
          <li><strong>Účetní software</strong> — pro vedení účetnictví a fakturace</li>
          <li><strong>E-mailový nástroj</strong> — Resend (pro rozesílání transakčních e-mailů a newsletteru)</li>
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
        <p>Svá práva uplatněte e-mailem na <strong>{COMPANY.email}</strong>. Žádost vyřídíme bez zbytečného odkladu, nejpozději do 30 dnů.</p>
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
        <p>Tento dokument je vyhotoven v českém jazyce. Případné cizojazyčné verze jsou pouze informativním překladem; v případě rozporu je rozhodující české znění.</p>
      </Section>
    </>
  );
}

// ── Slovenština ───────────────────────────────────────────────────────────────

function PrivacySk() {
  return (
    <>
      <Section title="1. Správca osobných údajov">
        <p>Správcom vašich osobných údajov je spoločnosť <strong>{companyField(COMPANY.name, "NÁZOV FIRMY")}</strong>, IČO: <strong>{companyField(COMPANY.companyId, "IČO")}</strong>, so sídlom <strong>{companyField(COMPANY.address, "ADRESA SÍDLA")}</strong>.</p>
        <p>Kontakt na správcu:<br />
        E-mail: <strong>{COMPANY.email}</strong><br />
        Telefón: <strong>{COMPANY.phone}</strong></p>
        <p>Nemenujeme poverenca pre ochranu osobných údajov, keďže nám táto povinnosť nevzniká.</p>
      </Section>

      <Section title="2. Aké osobné údaje spracovávame">
        <p>V závislosti od toho, ako s nami komunikujete, spracovávame tieto kategórie osobných údajov:</p>
        <ul>
          <li><strong>Identifikačné údaje</strong> — meno a priezvisko, prípadne názov firmy a IČO</li>
          <li><strong>Kontaktné údaje</strong> — e-mailová adresa, telefónne číslo</li>
          <li><strong>Adresné údaje</strong> — doručovacia a fakturačná adresa</li>
          <li><strong>Transakčné údaje</strong> — číslo objednávky, zakúpený tovar, cena, spôsob platby a dopravy</li>
          <li><strong>Technické údaje</strong> — IP adresa, typ prehliadača, cookies (pri návšteve webu)</li>
        </ul>
      </Section>

      <Section title="3. Účely a právny základ spracovania">
        <p>Vaše osobné údaje spracovávame na tieto účely:</p>
        <ul>
          <li><strong>Plnenie zmluvy</strong> (čl. 6 ods. 1 písm. b) GDPR) — spracovanie objednávky, doručenie tovaru, vybavenie reklamácie</li>
          <li><strong>Plnenie právnych povinností</strong> (čl. 6 ods. 1 písm. c) GDPR) — vedenie účtovníctva, daňové doklady, povinnosti podľa zákona o ochrane spotrebiteľa</li>
          <li><strong>Oprávnený záujem</strong> (čl. 6 ods. 1 písm. f) GDPR) — ochrana pred podvodmi, zlepšovanie našich služieb, priamy marketing voči existujúcim zákazníkom</li>
          <li><strong>Súhlas</strong> (čl. 6 ods. 1 písm. a) GDPR) — zasielanie newslettra (iba ak ste sa prihlásili na odber)</li>
        </ul>
      </Section>

      <Section title="4. Doba uchovávania údajov">
        <p>Osobné údaje uchovávame po dobu nevyhnutnú na splnenie účelu spracovania:</p>
        <ul>
          <li><strong>Údaje z objednávok</strong> — 10 rokov od uskutočnenia objednávky (daňová povinnosť)</li>
          <li><strong>Zákaznícky účet</strong> — po dobu existencie účtu, najdlhšie 3 roky od poslednej aktivity</li>
          <li><strong>Newsletter</strong> — do odvolania súhlasu</li>
          <li><strong>Cookies</strong> — podľa nastavenia prehliadača, max. 13 mesiacov</li>
        </ul>
      </Section>

      <Section title="5. Príjemcovia osobných údajov">
        <p>Vaše osobné údaje odovzdávame iba v nevyhnutnom rozsahu týmto kategóriám príjemcov:</p>
        <ul>
          <li><strong>Dopravca</strong> — Zásielkovňa (za účelom doručenia zásielky)</li>
          <li><strong>Platobná brána</strong> — Stripe (spracovateľ platieb pre online platby kartou)</li>
          <li><strong>Účtovný softvér</strong> — na vedenie účtovníctva a fakturácie</li>
          <li><strong>E-mailový nástroj</strong> — Resend (na rozosielanie transakčných e-mailov a newslettra)</li>
          <li><strong>PostHog</strong> — analytický nástroj na meranie návštevnosti webu, dáta sú spracovávané v rámci EÚ a iba na základe vášho súhlasu s analytickými cookies</li>
        </ul>
        <p>Všetci príjemcovia sú viazaní povinnosťou mlčanlivosti a spracovávajú údaje iba v rozsahu nevyhnutnom na plnenie svojich úloh. Údaje neodovzdávame do tretích krajín mimo EÚ/EHP.</p>
      </Section>

      <Section title="6. Vaše práva">
        <p>V súvislosti so spracovaním vašich osobných údajov máte tieto práva:</p>
        <ul>
          <li><strong>Právo na prístup</strong> — máte právo vedieť, aké údaje o vás spracovávame</li>
          <li><strong>Právo na opravu</strong> — ak sú vaše údaje nepresné, máte právo na ich opravu</li>
          <li><strong>Právo na výmaz</strong> — za určitých podmienok môžete požiadať o zmazanie vašich údajov</li>
          <li><strong>Právo na obmedzenie spracovania</strong> — v určitých prípadoch môžete žiadať obmedzenie spracovania</li>
          <li><strong>Právo na prenosnosť</strong> — máte právo získať vaše údaje v štruktúrovanom formáte</li>
          <li><strong>Právo vzniesť námietku</strong> — proti spracovaniu na základe oprávneného záujmu</li>
          <li><strong>Právo odvolať súhlas</strong> — súhlas so zasielaním newslettra môžete kedykoľvek odvolať</li>
        </ul>
        <p>Svoje práva uplatnite e-mailom na <strong>{COMPANY.email}</strong>. Žiadosť vybavíme bez zbytočného odkladu, najneskôr do 30 dní.</p>
      </Section>

      <Section title="7. Cookies">
        <p>Náš web používa súbory cookies na zaistenie základnej funkčnosti (napr. obsah košíka) a na analytické účely (sledovanie návštevnosti). Technicky nevyhnutné cookies sú ukladané na základe oprávneného záujmu. Analytické cookies vyžadujú váš súhlas.</p>
        <p>Ukladanie cookies môžete v prehliadači obmedziť alebo úplne zakázať. Základné funkcie webu budú aj naďalej dostupné, avšak obsah košíka nebude uchovaný po zatvorení prehliadača.</p>
      </Section>

      <Section title="8. Zabezpečenie">
        <p>Všetka komunikácia medzi vaším prehliadačom a naším serverom je šifrovaná pomocou protokolu <strong>SSL/TLS</strong>. Prístup k osobným údajom je obmedzený iba na oprávnené osoby. Pravidelne aktualizujeme bezpečnostné opatrenia v súlade s aktuálnymi štandardmi.</p>
      </Section>

      <Section title="9. Dozorný úrad">
        <p>Máte právo podať sťažnosť u dozorného úradu, ktorým je <strong>Úrad pro ochranu osobních údajů</strong>, Pplk. Sochora 27, 170 00 Praha 7, web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>.</p>
      </Section>

      <Section title="10. Zmeny tohto dokumentu">
        <p>Tento dokument môžeme priebežne aktualizovať. O podstatných zmenách vás budeme informovať e-mailom alebo oznámením na webe. Aktuálna verzia je vždy dostupná na tejto stránke.</p>
        <p>Tento dokument je vyhotovený v českom jazyku. Prípadné cudzojazyčné verzie sú iba informatívnym prekladom; v prípade rozporu je rozhodujúce české znenie.</p>
      </Section>
    </>
  );
}

// ── Angličtina ────────────────────────────────────────────────────────────────

function PrivacyEn() {
  return (
    <>
      <Section title="1. Data controller">
        <p>The controller of your personal data is <strong>{companyField(COMPANY.name, "COMPANY NAME")}</strong>, Company ID: <strong>{companyField(COMPANY.companyId, "COMPANY ID")}</strong>, with its registered office at <strong>{companyField(COMPANY.address, "REGISTERED ADDRESS")}</strong>.</p>
        <p>Contacting the controller:<br />
        E-mail: <strong>{COMPANY.email}</strong><br />
        Phone: <strong>{COMPANY.phone}</strong></p>
        <p>We have not appointed a data protection officer, as we are not required to do so.</p>
      </Section>

      <Section title="2. What personal data we process">
        <p>Depending on how you interact with us, we process the following categories of personal data:</p>
        <ul>
          <li><strong>Identification data</strong> — first and last name, and where relevant a company name and company ID</li>
          <li><strong>Contact data</strong> — e-mail address, phone number</li>
          <li><strong>Address data</strong> — delivery and billing address</li>
          <li><strong>Transaction data</strong> — order number, goods purchased, price, payment and delivery method</li>
          <li><strong>Technical data</strong> — IP address, browser type, cookies (when visiting the site)</li>
        </ul>
      </Section>

      <Section title="3. Purposes and legal bases of processing">
        <p>We process your personal data for the following purposes:</p>
        <ul>
          <li><strong>Performance of a contract</strong> (Art. 6(1)(b) GDPR) — processing your order, delivering goods, handling complaints</li>
          <li><strong>Compliance with legal obligations</strong> (Art. 6(1)(c) GDPR) — bookkeeping, tax documents, obligations under consumer protection law</li>
          <li><strong>Legitimate interest</strong> (Art. 6(1)(f) GDPR) — fraud prevention, improving our services, direct marketing to existing customers</li>
          <li><strong>Consent</strong> (Art. 6(1)(a) GDPR) — sending the newsletter (only if you have subscribed)</li>
        </ul>
      </Section>

      <Section title="4. Retention periods">
        <p>We keep personal data for as long as is necessary for the purpose of the processing:</p>
        <ul>
          <li><strong>Order data</strong> — 10 years from the date of the order (tax obligation)</li>
          <li><strong>Customer account</strong> — for as long as the account exists, at most 3 years from the last activity</li>
          <li><strong>Newsletter</strong> — until consent is withdrawn</li>
          <li><strong>Cookies</strong> — according to your browser settings, max. 13 months</li>
        </ul>
      </Section>

      <Section title="5. Recipients of personal data">
        <p>We pass your personal data on only to the extent necessary, to the following categories of recipients:</p>
        <ul>
          <li><strong>Carrier</strong> — Zásilkovna (for the purpose of delivering your parcel)</li>
          <li><strong>Payment gateway</strong> — Stripe (payment processor for online card payments)</li>
          <li><strong>Accounting software</strong> — for bookkeeping and invoicing</li>
          <li><strong>E-mail tool</strong> — Resend (for sending transactional e-mails and the newsletter)</li>
          <li><strong>PostHog</strong> — analytics tool for measuring site traffic; data is processed within the EU and only on the basis of your consent to analytics cookies</li>
        </ul>
        <p>All recipients are bound by a duty of confidentiality and process the data only to the extent necessary to carry out their tasks. We do not transfer data to third countries outside the EU/EEA.</p>
      </Section>

      <Section title="6. Your rights">
        <p>In connection with the processing of your personal data you have the following rights:</p>
        <ul>
          <li><strong>Right of access</strong> — you have the right to know what data we process about you</li>
          <li><strong>Right to rectification</strong> — if your data is inaccurate, you have the right to have it corrected</li>
          <li><strong>Right to erasure</strong> — under certain conditions you may request that your data be deleted</li>
          <li><strong>Right to restriction of processing</strong> — in certain cases you may request that processing be restricted</li>
          <li><strong>Right to data portability</strong> — you have the right to receive your data in a structured format</li>
          <li><strong>Right to object</strong> — to processing based on legitimate interest</li>
          <li><strong>Right to withdraw consent</strong> — you may withdraw consent to the newsletter at any time</li>
        </ul>
        <p>Exercise your rights by e-mail at <strong>{COMPANY.email}</strong>. We will handle your request without undue delay and no later than 30 days.</p>
      </Section>

      <Section title="7. Cookies">
        <p>Our site uses cookies to provide basic functionality (e.g. the contents of your cart) and for analytics (measuring traffic). Technically necessary cookies are stored on the basis of legitimate interest. Analytics cookies require your consent.</p>
        <p>You can restrict or completely block cookies in your browser. The site’s basic functions will still work, but the contents of your cart will not survive closing the browser.</p>
      </Section>

      <Section title="8. Security">
        <p>All communication between your browser and our server is encrypted using <strong>SSL/TLS</strong>. Access to personal data is limited to authorised persons. We regularly update our security measures in line with current standards.</p>
      </Section>

      <Section title="9. Supervisory authority">
        <p>You have the right to lodge a complaint with the supervisory authority, which is the <strong>Office for Personal Data Protection</strong> (Úřad pro ochranu osobních údajů), Pplk. Sochora 27, 170 00 Prague 7, web: <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>.</p>
      </Section>

      <Section title="10. Changes to this document">
        <p>We may update this document from time to time. We will inform you of material changes by e-mail or by a notice on the site. The current version is always available on this page.</p>
        <p>This document is drawn up in the Czech language. Any foreign-language versions are an informative translation only; in the event of any discrepancy, the Czech wording prevails.</p>
      </Section>
    </>
  );
}

export const PRIVACY_TITLE: Record<Locale, string> = {
  cs: "Ochrana osobních údajů",
  sk: "Ochrana osobných údajov",
  en: "Privacy Policy",
};

export const PRIVACY_SUBTITLE: Record<Locale, string> = {
  cs: "v souladu s nařízením GDPR (EU) 2016/679",
  sk: "v súlade s nariadením GDPR (EÚ) 2016/679",
  en: "in accordance with the GDPR (EU) 2016/679",
};

export const PRIVACY_BODY: Record<Locale, () => React.ReactElement> = {
  cs: PrivacyCs,
  sk: PrivacySk,
  en: PrivacyEn,
};
