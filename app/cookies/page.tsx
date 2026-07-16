"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Shield, Eye, BarChart3, Check } from "lucide-react";
import {
  acceptAll,
  clearConsent,
  getConsentPreferences,
  saveConsent,
} from "@/lib/consent";

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

// Soupis musí odpovídat tomu, co web SKUTEČNĚ ukládá. Když přibyde nebo zmizí
// nějaký nástroj, patří změna i sem — nepřesný soupis je porušení GDPR samo
// o sobě, i kdyby zbytek webu byl v pořádku.
type StorageEntry = {
  name: string;
  storage: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: "Nezbytné" | "Preferenční" | "Analytické";
};

const storageList: StorageEntry[] = [
  {
    name: "hackpack-cookie-consent",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Uchovává vaši volbu souhlasu s cookies, aby se vás web neptal znovu.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-cookie-visited-details",
    storage: "sessionStorage",
    provider: "HackPack",
    purpose: "Poznamená si, že jste viděli tuto stránku s detaily, a zmenší podle toho lištu se souhlasem.",
    expiry: "Do zavření karty",
    type: "Nezbytné",
  },
  {
    name: "hackpack-cart",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Obsah nákupního košíku, aby vám zboží nezmizelo mezi stránkami ani po zavření prohlížeče.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-discount",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Uplatněný slevový kód, aby platil i po přechodu na další stránku.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-order",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Rozpracovaná objednávka (zboží, doprava, platba) mezi kroky pokladny.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-order-snapshot",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Shrnutí dokončené objednávky pro zobrazení na stránce s poděkováním.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-info",
    storage: "sessionStorage",
    provider: "HackPack",
    purpose: "Údaje vyplněné v pokladně (jméno, adresa, kontakt), abyste je nemuseli psát znovu při návratu o krok zpět. Zůstávají jen ve vašem prohlížeči.",
    expiry: "Do zavření karty",
    type: "Nezbytné",
  },
  {
    name: "hackpack-zbox",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Vámi zvolené výdejní místo Zásilkovny.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-last-review",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Čas vašeho posledního odeslaného hodnocení — brání opakovanému rozesílání recenzí.",
    expiry: "Dokud ji nesmažete",
    type: "Nezbytné",
  },
  {
    name: "hackpack-currency",
    storage: "localStorage",
    provider: "HackPack",
    purpose: "Měna, kterou jste si sami zvolili pro zobrazení cen.",
    expiry: "Dokud ji nesmažete",
    type: "Preferenční",
  },
  {
    name: "googtrans",
    storage: "Cookie",
    provider: "Google",
    purpose:
      "Jazyk zvolený v překladači. Nastaví se pouze tehdy, když si sami přepnete jazyk na jiný než češtinu — do té doby se překladač vůbec nenačítá.",
    expiry: "Do zavření prohlížeče",
    type: "Preferenční",
  },
  {
    name: "admin_session",
    storage: "Cookie (httpOnly)",
    provider: "HackPack",
    purpose: "Přihlášení do administrace e-shopu. Vzniká pouze správci obchodu, běžnému návštěvníkovi nikdy.",
    expiry: "12 hodin",
    type: "Nezbytné",
  },
  {
    name: "admin_hint",
    storage: "Cookie",
    provider: "HackPack",
    purpose: "Označuje přihlášeného správce, aby se jeho vlastní procházení e-shopu nezapočítávalo do statistik.",
    expiry: "12 hodin",
    type: "Nezbytné",
  },
  {
    name: "ph_*_posthog",
    storage: "Cookie + localStorage",
    provider: "PostHog",
    purpose: "Anonymní identifikátor návštěvníka pro měření návštěvnosti. Vzniká výhradně po vašem souhlasu s analytikou.",
    expiry: "1 rok",
    type: "Analytické",
  },
  {
    name: "__ph_opt_in_out_*",
    storage: "Cookie",
    provider: "PostHog",
    purpose: "Pamatuje si, že jste analytiku odmítli, aby se měření nespustilo ani omylem.",
    expiry: "1 rok",
    type: "Nezbytné",
  },
];

export default function CookiesPage() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  // Uloženou volbu čteme až po mountu — na serveru localStorage neexistuje.
  useEffect(() => {
    const prefs = getConsentPreferences();
    if (!prefs) return;
    setAnalytics(prefs.analytics);
    setMarketing(prefs.marketing);
  }, []);

  // Zápis jde přes lib/consent, který zároveň rozešle CONSENT_CHANGED_EVENT —
  // díky tomu se PostHog vypne/zapne hned, ne až po obnovení stránky.
  function handleAcceptAll() {
    acceptAll();
    setAnalytics(true);
    setMarketing(true);
    setSavedNote("Povolili jste všechny cookies.");
  }

  function handleSaveCustom() {
    saveConsent({ analytics, marketing });
    setSavedNote("Vaše předvolby byly uloženy.");
  }

  function handleRevoke() {
    clearConsent();
    setAnalytics(false);
    setMarketing(false);
    setSavedNote("Souhlas byl odvolán a analytická data z tohoto prohlížeče smazána.");
  }

  return (
    <>
      <title>Používání souborů cookies | HackPack</title>

      <Header />
      <main className="min-h-screen bg-dark">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">

          {/* Drobečková navigace */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={12} className="text-border" />
            <span className="text-text-muted">Používání souborů cookies</span>
          </nav>

          <h1 className="text-4xl font-extrabold text-text-base mb-2">Používání souborů cookies</h1>
          <p className="text-text-subtle text-sm mb-12">Platné od 1. 1. 2026 · V souladu s nařízením GDPR a zákonem o elektronických komunikacích</p>

          <Section title="1. Co jsou soubory cookie?">
            <p>
              Cookies jsou krátké textové soubory, které navštívená webová stránka odešle do vašeho prohlížeče. Umožňují webu zaznamenat informace o vaší návštěvě, například preferovaný jazyk, obsah nákupního košíku a další nastavení. Příští návštěva stránek tak může být snazší a produktivnější. Bez cookies by prohlížení webu bylo složitější, protože by si e-shop nepamatoval vaše kroky a stav nákupu.
            </p>
            <p>
              Vedle cookies používáme i podobná úložiště prohlížeče (<strong>localStorage</strong> a <strong>sessionStorage</strong>). Fungují prakticky stejně, jen data neputují s každým požadavkem na server — v soupisu níže je proto uvádíme společně a vždy označujeme, o které úložiště jde.
            </p>
          </Section>

          <Section title="2. Jaké druhy cookies využíváme">
            <p>Na našem e-shopu rozdělujeme soubory cookie do následujících kategorií:</p>
            <ul>
              <li><strong>Nezbytné (technické)</strong> — Jsou klíčové pro správný chod e-shopu. Zajišťují obsah nákupního košíku, funkčnost pokladny, přihlášení do administrace a zapamatování vaší volby souhlasu. Bez nich by nebylo možné nákup dokončit a nelze je vypnout.</li>
              <li><strong>Preferenční</strong> — Pamatují si nastavení, které jste si sami zvolili. Konkrétně jde o jazyk v překladači (cookie <strong>googtrans</strong>), který vzniká až ve chvíli, kdy si překlad sami vyžádáte.</li>
              <li><strong>Analytické</strong> — Pomáhají nám pochopit, jak web používáte (které stránky navštěvujete nejčastěji, odkud přicházíte). Zajišťuje je nástroj <strong>PostHog</strong> a ukládají se výhradně po vašem souhlasu. Dokud souhlas nedáte, na PostHog se neodešle žádný požadavek.</li>
              <li><strong>Marketingové</strong> — <strong>Žádné zatím nepoužíváme.</strong> Volbu níže si ukládáme dopředu, aby platila okamžitě, kdyby v budoucnu nějaký takový nástroj přibyl.</li>
            </ul>
            <p>
              Vaše údaje <strong>neprodáváme</strong> a nepředáváme je reklamním sítím ani provozovatelům sociálních sítí.
            </p>
          </Section>

          <Section title="3. Správa souhlasu a nastavení preferencí">
            <p>
              Zpracování technických cookies je nezbytné pro plnění smlouvy (uskutečnění nákupu) a je prováděno na základě oprávněného zájmu. Ostatní kategorie cookies zpracováváme pouze na základě vašeho <strong>dobrovolného souhlasu</strong>.
            </p>
            <p>
              Své preference můžete kdykoliv bezplatně změnit a uložit přímo prostřednictvím níže přiloženého formuláře. Změna se projeví okamžitě — odvoláním souhlasu se měření zastaví a analytické údaje se z tohoto prohlížeče smažou.
            </p>

            {/* ROZTAŽENÝ PANEL SE ZAŠKRTÁVÁTKY */}
            <div className="w-full border border-border bg-dark/20 rounded-xl p-6 mt-6 max-w-none">
              <h3 className="text-text-base font-bold text-base mb-4">
                Individuální nastavení souhlasu
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                {/* Technické */}
                <div className="p-4 bg-dark/40 border border-border rounded-xl flex items-start justify-between">
                  <div className="flex gap-3">
                    <Shield size={18} className="text-primary-ink mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-text-base block">Technické cookies (Nezbytné)</span>
                      <span className="text-text-muted text-xs block mt-1">Nutné pro fungování nákupního košíku, přihlášení a bezpečnosti webu.</span>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded bg-border/40 text-primary-ink flex items-center justify-center text-xs shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>

                {/* Analytické */}
                <label
                  htmlFor="page-analytics"
                  className="p-4 bg-dark/40 border border-border hover:border-border/80 rounded-xl flex items-start justify-between cursor-pointer transition-colors"
                >
                  <div className="flex gap-3">
                    <BarChart3 size={18} className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-text-base block">Analytické cookies</span>
                      <span className="text-text-muted text-xs block mt-1">Umožňují nám sledovat anonymní statistiky návštěvnosti a zlepšovat e-shop (PostHog).</span>
                    </div>
                  </div>
                  <input
                    id="page-analytics"
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => { setAnalytics(e.target.checked); setSavedNote(null); }}
                    className="mt-1 h-4 w-4 rounded border-border bg-dark text-primary-ink focus:ring-0 cursor-pointer accent-primary shrink-0"
                  />
                </label>

                {/* Marketingové */}
                <label
                  htmlFor="page-marketing"
                  className="p-4 bg-dark/40 border border-border hover:border-border/80 rounded-xl flex items-start justify-between cursor-pointer transition-colors"
                >
                  <div className="flex gap-3">
                    <Eye size={18} className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-text-base block">Marketingové cookies</span>
                      <span className="text-text-muted text-xs block mt-1">Zatím žádné nepoužíváme — volba se uplatní, až nějaký takový nástroj nasadíme.</span>
                    </div>
                  </div>
                  <input
                    id="page-marketing"
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => { setMarketing(e.target.checked); setSavedNote(null); }}
                    className="mt-1 h-4 w-4 rounded border-border bg-dark text-primary-ink focus:ring-0 cursor-pointer accent-primary shrink-0"
                  />
                </label>
              </div>

              {/* Tlačítka akcí */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs tracking-wide transition-colors cursor-pointer text-center"
                >
                  Povolit všechny cookies
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-border hover:border-text-muted text-text-base font-medium text-xs tracking-wide transition-colors cursor-pointer text-center bg-transparent"
                >
                  Uložit mé preference
                </button>
                <button
                  onClick={handleRevoke}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-border hover:border-text-muted text-text-muted font-medium text-xs tracking-wide transition-colors cursor-pointer text-center bg-transparent"
                >
                  Odvolat souhlas
                </button>
              </div>

              {savedNote && (
                <p role="status" className="mt-4 inline-flex items-center gap-2 text-primary-ink text-xs font-medium">
                  <Check size={13} className="stroke-[3]" />
                  {savedNote}
                </p>
              )}
            </div>
          </Section>

          {/* Tabulka cookies */}
          <Section title="4. Podrobný soupis ukládaných souborů">
            <p className="mb-2">Níže naleznete přesný přehled toho, co náš e-shop v prohlížeči ukládá:</p>

            <div className="w-full border border-border rounded-xl overflow-hidden bg-dark/40 mt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-dark/80 border-b border-border text-text-base font-bold">
                      <th className="p-4">Jméno</th>
                      <th className="p-4">Úložiště</th>
                      <th className="p-4">Poskytovatel</th>
                      <th className="p-4">Účel</th>
                      <th className="p-4">Vypršení</th>
                      <th className="p-4">Typ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text-muted">
                    {storageList.map((item) => (
                      <tr key={item.name} className="hover:bg-dark/20 transition-colors">
                        <td className="p-4 font-mono text-text-base whitespace-nowrap">{item.name}</td>
                        <td className="p-4 whitespace-nowrap">{item.storage}</td>
                        <td className="p-4 whitespace-nowrap">{item.provider}</td>
                        <td className="p-4 min-w-[220px] leading-relaxed">{item.purpose}</td>
                        <td className="p-4 whitespace-nowrap">{item.expiry}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                            item.type === "Nezbytné" ? "bg-primary/10 text-primary-ink border border-primary/20" : "bg-border/40 text-text-muted"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section title="5. Deaktivace cookies prostřednictvím prohlížeče">
            <p>
              Většina webových prohlížečů soubory cookie automaticky přijímá. Správu cookies však můžete upravit přímo ve svém prohlížeči, kde je můžete zakázat, zablokovat nebo smazat celou historii. Postup nastavení naleznete v nápovědě konkrétního prohlížeče:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/cs/kb/vymazani-cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/cs-cz/microsoft-edge/odstran%C4%9Bn%C3%AD-soubor%C5%AF-cookie-v-aplikaci-microsoft-edge-63947427-b3b4-4c78-b95e-a86a7ee4094a" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  );
}
