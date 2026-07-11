// lib/blog.ts
// Magazín (SEO články) — uložený v Upstash Redis, spravovaný z admin panelu
// (dřív to byl natvrdo zapsaný TS soubor, na každý článek bylo nutné
// upravit kód a redeploynout).
//
// ── Formát obsahu článku ─────────────────────────────────────────────────
// `content` je jednoduchý vlastní markdown-like formát (ne plný Markdown
// balíček), stejný, jaký se používal v původních článcích:
//   - blok začínající "## " → nadpis (tučný, větší písmo)
//   - řádek začínající "- " → odrážka v seznamu
//   - "**text**" uvnitř odstavce → tučný text
//   - prázdný řádek odděluje odstavce/bloky
// Vykreslování viz renderBlogContent() níže — používá ho jak web
// (app/blog/[slug]/page.tsx), tak živý náhled v adminu.
import { getRedis } from "./redis";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string; // zobrazovaný text, např. "22. 4. 2026" — Ondřej ho vyplňuje ručně
  tag: string;
  img: string;
  createdAt: number; // pro řazení "od nejnovějšího" nezávisle na formátu date
};

const HASH_KEY = "blog:posts";

function parseCzechDate(dateStr: string): number {
  const match = dateStr.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!match) return Date.now();
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // odstraní diakritiku
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Jednorázová migrace ──────────────────────────────────────────────────
// Původní hardcoded články — použijí se JEN jako počáteční náplň Redisu,
// pokud tam ještě nic není (aby se při přechodu na tenhle systém nic
// neztratilo). Jakmile se jednou uloží do Redisu, tohle pole se už
// nikdy nepoužije a je bezpečné ho časem smazat.
const LEGACY_SEED: Omit<BlogPost, "createdAt">[] = [
  {
    slug: "proc-je-wifi-pomala-a-jak-ji-zrychlit",
    title: "Proč je vaše WiFi pomalá a jak ji reálně zrychlit (2026)",
    excerpt: "Pomalá WiFi není vždy problém internetu. Zjistěte nejčastější důvody špatného připojení a jednoduché kroky, jak ho výrazně zlepšit.",
    date: "22. 4. 2026",
    tag: "Průvodce",
    img: "/images/blog/wifi.jpg",
    content: `

## Proč je vaše WiFi pomalá a jak ji reálně zrychlit (2026)

Pomalá WiFi je jeden z nejčastějších problémů moderní domácnosti. Paradoxně ale většina lidí řeší špatnou věc – místo optimalizace sítě automaticky viní poskytovatele internetu.

Realita je taková, že v mnoha případech je problém přímo u vás doma. A dobrá zpráva je, že se dá často vyřešit bez zvyšování tarifu nebo složitých zásahů.

 

## Umístění routeru: základ, který většina ignoruje

Router není dekorace. Jeho umístění zásadně ovlivňuje kvalitu signálu.

Typické chyby:

- schovaný v rohu bytu  
- zavřený ve skříni  
- umístěný za televizí nebo kovovými objekty  

Ideální je centrální pozice v otevřeném prostoru. Signál se šíří všemi směry, takže čím lepší má „výhled“, tím lépe funguje.

 

## Rušení signálu: neviditelný problém

WiFi funguje na frekvencích, které sdílí s další elektronikou. Mikrovlnky, Bluetooth zařízení nebo sousední sítě mohou signál rušit.

V panelových domech je to obzvlášť výrazné. Desítky sítí na malém prostoru znamenají přeplněné kanály.

Řešením může být přepnutí na méně zatížený kanál nebo využití 5 GHz pásma, které je rychlejší a méně rušené.

 

## Starý router jako brzda

Technologie WiFi se rychle vyvíjí. Starší routery nemusí zvládat vyšší rychlosti nebo větší počet zařízení.

Pokud máte router několik let starý, může být úzkým hrdlem celé sítě. Modernější zařízení nabízí lepší dosah, stabilitu i správu připojení.

 

## Počet připojených zařízení

Každé zařízení v síti si „ukrajuje“ část výkonu. Telefony, notebooky, chytré televize, konzole i IoT zařízení – všechno běží současně.

Problém nastává hlavně ve chvíli, kdy více zařízení streamuje video nebo stahuje data najednou.

V takovém případě pomáhá:

- odpojení nepoužívaných zařízení  
- prioritizace důležitých zařízení v nastavení routeru  

 

## Mesh systémy a zesilovače signálu

Ve větších bytech nebo domech nemusí jeden router stačit. Slabý signál v některých místnostech pak způsobuje pomalé připojení.

Řešením jsou:

- zesilovače signálu (repeatory)  
- mesh systémy, které vytvářejí jednotnou síť  

Tyto technologie pomáhají pokrýt celý prostor stabilním signálem bez výpadků.

 

## Internet vs. WiFi: důležitý rozdíl

Je důležité rozlišovat mezi rychlostí internetu a kvalitou WiFi. Poskytovatel vám může dodávat rychlé připojení, ale špatná domácí síť ho „zabije“.

Nejjednodušší test je připojit zařízení kabelem. Pokud je internet rychlý přes kabel, problém je ve WiFi, ne u poskytovatele.

 

## Shrnutí

Pomalá WiFi není vždy problém internetu, ale často výsledkem špatného nastavení nebo nevhodného prostředí.

Správné umístění routeru, omezení rušení a modernizace zařízení mohou výrazně zlepšit kvalitu připojení bez nutnosti platit víc.

Stačí pár úprav a rozdíl může být větší, než byste čekali.

    `,
  },
  {
    slug: "proc-je-magneticka-folie-lepsi-nez-ta-nalepovaci",
    title: "Proč je magnetická fólie lepší než ta nalepovací?",
    excerpt: "Kreslíte na iPadu? Zjistěte, proč je magnetická fólie revolucí v digitální tvorbě. Nabízí pocit papíru, ale sundáte ji za vteřinu, kdykoliv se chcete dívat na film v plné kvalitě.",
    date: "2. 3. 2025",
    tag: "Recenze",
    img: "/images/blog/ipad.jpg",
    content: `
## Kreslení na iPadu: Proč je magnetická fólie lepší než ta nalepovací?

iPad se v posledních letech stal pro mnohé hlavním nástrojem pro digitální tvorbu a psaní poznámek. Aby byl zážitek z psaní co nejlepší, většina uživatelů sahá po fólii s texturou papíru. Tradiční nalepovací fólie však mají své nevýhody, které elegantně řeší jejich magnetická varianta.

## Flexibilita na prvním místě

Největší slabinou klasických fólií je jejich trvalost. Jakmile ji jednou nalepíte, zůstane tam, dokud se ji nerozhodnete vyhodit. Magnetická fólie na iPad vám dává svobodu – chcete kreslit? Jednoduše ji přiložíte k hranám iPadu, kde se pomocí silných magnetů okamžitě uchytí. Chcete se večer dívat na film v plném 4K rozlišení bez šumu, který fólie vytváří? Během sekundy ji sundáte.

## Konec bublinám a složité instalaci

Každý, kdo někdy zkoušel lepit fólii na velký displej iPadu, ví, jak frustrující je boj s prachem a bublinami. U magnetické verze tento proces odpadá. Fólii stačí přiložit, magnety ji samy vycentrují a vy můžete ihned tvořit. Pokud se pod ni dostane smítko prachu, fólii prostě zvednete, otřete displej a vrátíte ji zpět.

## Lepší ochrana pro náhradní hroty na Apple Pencil

Kvalitní magnetická fólie má optimalizovaný povrch, který simuluje odpor papíru, ale zároveň je navržen tak, aby nadměrně neobrušoval náhradní hroty na Apple Pencil. Díky tomu, že fólii používáte jen tehdy, když skutečně píšete nebo kreslíte, šetříte nejen hrot své tužky, ale i samotný povrch fólie, který by se při běžném scrollování prsty zbytečně "vyleštil".

## Čistota a údržba

Nalepovací fólie se po čase po okrajích začnou odlepovat a chytat nečistoty. Magnetickou fólii můžete po práci vložit do ochranného obalu, nebo ji dokonce omýt pod tekoucí vodou, pokud se na ni dostane mastnota. To z ní dělá hygieničtější a dlouhodobě udržitelnější volbu pro každého, kdo svůj iPad používá denně.

## Perfektní v kombinaci se silikonovým pouzdrem

Magnetická fólie je tenká natolik, že ji většina ochranných pouzder bez problému pojme. Skvěle funguje i v momentě, kdy máte na tužce silikonové pouzdro na Apple Pencil – kombinace měkkého úchopu tužky a texturovaného povrchu displeje posouvá ergonomii práce na úplně jinou úroveň.
    `,
  },
  {
    slug: "apple-pencil-se-vam-uz-neztrati-ani-neposkrabe",
    title: "Apple Pencil se vám už neztratí ani nepoškrábe",
    excerpt: "Apple Pencil je skvělý nástroj, který se ale snadno poškrábe nebo ztratí. Přečtěte si tipy, jak ji ochránit silikonovým pouzdrem a jak si díky barvám vytvořit unikátní kousek, který si nespletete.",
    date: "25. 2. 2025",
    tag: "Recenze",
    img: "/images/blog/pencil.jpg",
    content: `
## Apple Pencil se vám už neztratí ani nepoškrábe: Tipy pro digitální umělce

Apple Pencil je pro mnoho uživatelů iPadu nepostradatelným nástrojem, ale její hladký design a vysoká cena s sebou nesou i určitá rizika. Snadno sklouzne ze stolu, v tašce se může poškrábat o klíče a při delší práci může v ruce nepříjemně klouzat. Tady je návod, jak svou tužku ochránit a zároveň si ji přizpůsobit.

## Proč zvolit silikonové pouzdro na Apple Pencil?

Silikon je ideální materiál, který tlumí nárazy a zabraňuje nechtěnému poškrábání těla tužky. Pouzdro funguje jako druhá kůže – nepřidává zbytečný objem, takže Apple Pencil stále pohodlně drží v magnetickém úložišti iPadu a bez problému se nabíjí. Navíc díky matnému povrchu silikonu tužka v ruce neklouže ani při několikahodinovém kreslení nebo psaní poznámek.

## Vlastní barevná kombinace jako pojistka proti ztrátě

Pokud se pohybujete v kanceláři, ve škole nebo v kavárně, kde má iPad a Apple Pencil skoro každý, je snadné si svou tužku splést nebo ji někde zapomenout. Naše silikonová pouzdra na Apple Pencil (verze USB-C) umožňují kombinovat barvu těla a hlavičky. Vytvořením unikátní barevné kombinace svou tužku okamžitě poznáte na první pohled a snížíte riziko, že si ji někdo jiný omylem odnese.

## Ochrana hrotu: Klíč k dlouhé životnosti

Nejzranitelnější částí celé tužky je její špička. Pád na tvrdou podlahu přímo na hrot může znamenat jeho okamžité poškození. Součástí našich pouzder je často i krytka na hrot, která ho chrání během přenášení v batohu nebo kabelce. Pokud už ke kontatku s tvrdým povrchem dojde, je vždy lepší mít v záloze náhradní hroty na Apple Pencil, aby vaše práce nemusela stát kvůli jedné nehodě.

## Organizace na cestách

Mít Apple Pencil jen tak "přihozenou" v tašce je recept na katastrofu. Kromě pouzdra přímo na těle tužky doporučujeme používat organizér na kabely a příslušenství, kde má každá drobnost své místo. Tím zajistíte, že se na jemný silikonový povrch nenalepí prach a tužka nebude narážet do ostatní elektroniky.

## Čistota pro precizní reakce

I pod silikonové pouzdro se časem může dostat jemný prach, který by mohl působit jako brusný papír. Jednou za čas je dobré pouzdro sundat a tělo Apple Pencil otřít pomocí čističe displeje nebo vlhkého hadříku z mikrovlákna. Čistý povrch zajistí, že magnety budou držet s maximální silou a nabíjení bude probíhat bez přerušování.
    `,
  },
  {
    slug: "minimalisticka-penezenka-vs-magsafe",
    title: "Minimalistická peněženka vs. MagSafe",
    excerpt: "Taháte v kapse zbytečně velkou peněženku? Zjistěte, zda je pro vás lepší přejít na minimalistickou MagSafe peněženku přímo na iPhone, nebo zůstat u klasiky. Srovnáváme praktičnost, kapacitu i sílu magnetů pro každodenní používání.",
    date: "15. 2. 2025",
    tag: "Tipy",
    img: "/images/blog/magsafe.jpg",
    content: `
## Minimalistická peněženka vs. MagSafe: Která cesta je pro vás ta pravá?

V dnešní digitální době, kdy většinu plateb vyřídíme iPhonem nebo Apple Watch, se klasické kožené peněženky plné účtenek a mincí stávají přežitkem. Stále však existuje několik karet, které u sebe musíme mít fyzicky – ať už jde o řidičský průkaz, občanku nebo záložní platební kartu pro případy, kdy terminál stávkuje. Otázkou zůstává, zda je lepší zvolit samostatnou minimalistickou peněženku, nebo vsadit na magnetickou MagSafe variantu, která se stane přímou součástí vašeho telefonu. Obě cesty mají své skalní fanoušky a každá řeší trochu jiný životní styl.

## MagSafe peněženka: Maximální svoboda v jednom balení

Hlavním argumentem pro pořízení MagSafe peněženky je neuvěřitelné pohodlí, které přináší fakt, že máte vše podstatné na jednom místě. Naše MagSafe peněženka využívá silné integrované magnety, které zajistí, že pevně drží na zádech iPhonu (ideálně v kombinaci s MagSafe krytem) a samovolně se neodpojí ani při vkládání do těsných džínů. Tento systém je ideální pro ty, kteří chtějí odejít z domova jen s telefonem v ruce a vědět, že mají své nejdůležitější karty okamžitě k dispozici. Silikonový povrch navíc dodává příjemný grip, takže se telefon v ruce drží mnohem jistěji než s hladkým skleněným nebo kovovým povrchem.

## Síla magnetů a bezpečnost vašich dat

Častou obavou uživatelů je, zda magnety v MagSafe příslušenství nemohou poškodit platební karty nebo zda se peněženka při běžné manipulaci neodlepí. Moderní MagSafe peněženky jsou konstruovány se stíněním, které chrání magnetické proužky a čipy vašich karet před demagnetizací, takže jsou v naprostém bezpečí. Co se týče stability, klíčem k úspěchu je souhra mezi telefonem a pouzdrem. Pokud používáte kvalitní silikonové pouzdro s MagSafe kroužkem, tření mezi materiály je natolik vysoké, že peněženka sedí jako přibitá. Je to elegantní řešení, které eliminuje nutnost neustále kontrolovat kapsy, jestli jste někde nenechali klasickou portmonku.

## Minimalismus, který vás naučí efektivitě

Přechod na MagSafe peněženku vás přirozeně donutí k revizi toho, co u sebe skutečně potřebujete nosit. Zatímco do klasické peněženky máte tendenci schovávat staré vizitky a věrnostní karty, které použijete jednou za rok, MagSafe varianta pojme obvykle 2 až 3 nejdůležitější karty. Tento minimalistický přístup nejenže uleví vašim kapsám, které přestanou být nevzhledně vyboulené, ale také vám zrychlí každodenní fungování. Už žádné dlouhé hledání té správné karty u pokladny – vše máte přímo na zadní straně iPhonu, připravené k okamžitému vysunutí pomocí praktického výřezu na spodní nebo zadní straně peněženky.

## Kdy je lepší zůstat u klasického organizéru?

I přes všechny výhody MagSafe řešení existují situace, kdy se vyplatí mít v záloze širší organizér na kabely a drobnosti, který pojme i hotovost nebo více dokladů. Pokud cestujete a potřebujete mít u sebe pas, více měn nebo třeba AirTag pro sledování zavazadel, je kombinace MagSafe peněženky na iPhonu pro rychlé platby a většího organizéru v batohu pro zbytek výbavy tou nejlepší strategií. Pro každodenní pohyb po městě, cestu do fitness centra nebo rychlý oběd v pracovní pauze však MagSafe peněženka v poměru cena/výkon a estetika/funkčnost jednoznačně vítězí.
    `,
  },
  {
    slug: "5-drobnosti-ktere-zachrani-zivot-vasemu-iphonu-i-vasemu-soukromi",
    title: "5 drobností, které zachrání život vašemu iPhonu i vašemu soukromí",
    excerpt: "Malé doplňky, velký rozdíl. Zjistěte, jak prachovky, krytky kamer nebo organizéry kabelů dokážou ochránit váš iPhone před poškozením a zajistit vám maximální soukromí i pořádek v elektronice.",
    date: "5. 2. 2025",
    tag: "Průvodce",
    img: "/images/blog/iphone.jpg",
    content: `
## 5 drobností, které zachrání život vašemu iPhonu i vašemu soukromí

Většinu pozornosti při nákupu příslušenství obvykle věnujeme drahým krytům nebo sluchátkům, ale jsou to právě ty nejmenší doplňky za pár korun, které v každodenním provozu dělají největší rozdíl. Apple produkty jsou proslulé svým precizním zpracováním, ale i ony mají svá slabá místa – citlivé konektory náchylné na prach, odhalené čočky kamer nebo věčně zamotané kabely v batohu. Správným výběrem drobných vychytávek můžete předejít drahým opravám v servisu a zároveň si výrazně zvýšit komfort při používání iPhonu, iPadu nebo MacBooku v terénu i v kanceláři.

## Prachovky do USB-C: Prevence, která se vyplatí

Jedním z nejčastějších důvodů, proč iPhone přestane správně reagovat na nabíječku nebo proč kabel v portu nedrží, není softwarová chyba, ale obyčejný prach a textilní vlákna z kapes. Ty se postupem času v portu USB-C nebo Lightning udusají do tvrdé vrstvy, která brání dokonalému kontaktu. Naše nenápadné silikonové prachovky do USB-C tento problém řeší jednou provždy. Stačí je zasunout do portu v momentě, kdy zrovna nenabíjíte, a konektor zůstane sterilně čistý bez ohledu na to, v jakém prostředí se pohybujete. Je to investice v řádu desítek korun, která vám může ušetřit tisíce za výměnu celého nabíjecího modulu v autorizovaném servisu.

## Krytka na webkameru: Vaše soukromí pod kontrolou

V digitální éře je soukromí čím dál vzácnější komoditou a softwarové zabezpečení nemusí být vždy stoprocentní. Mechanická krytka na webkameru je nejjednodušším a nejspolehlivějším způsobem, jak mít absolutní jistotu, že vás nikdo nesleduje bez vašeho vědomí. Naše krytky jsou navrženy tak, aby byly extrémně tenké, takže nebrání úplnému dovření MacBooku a nijak nenarušují design iPhonu nebo iPadu. Kromě bezpečnostního aspektu navíc krytka funguje jako štít proti mastnotě z prstů, která by jinak čočku přední kamery neustále znečišťovala a způsobovala mlhavé záběry při vašich videohovorech nebo autentizaci přes FaceID.

## Organizér na kabely: Konec chaosu v batohu

Všichni to známe – hodíte nabíjecí kabel k MacBooku, USB-C kabel k iPhonu a drátová sluchátka do jedné kapsy a za pět minut vytáhnete nerozmotatelný uzel. Neustálé ohýbání a lámání kabelů při rozmotávání dramaticky zkracuje jejich životnost a vede k praskání izolace u konektorů. Kvalitní organizér na kabely vám umožní každou šňůru úhledně sbalit a zajistit, aby držela svůj tvar. Tento drobný pomocník nejen šetří vaše nervy při každém hledání nabíječky, ale především chrání vnitřní měděná vlákna kabelů před únavou materiálu, čímž výrazně prodlužuje intervaly, ve kterých musíte kupovat novou kabeláž.

## Čistící hmota a AirPods brush: Hygiena na prvním místě

Drobnosti jako AirPods brush (čistící pero) nebo speciální čistící hmota jsou nástroje, které by měl mít v šuplíku každý majitel Apple produktů. Sluchátka AirPods jsou díky svému tvaru a magnetům v pouzdře doslova lapačem nečistot, které se usazují v jemných mřížkách a časem tlumí hlasitost nebo kazí podání basů. Pravidelným používáním čistícího pera, které má špičku pro detailní práci a jemný kartáček pro vyčištění mřížek, udržíte zvuk svých sluchátek v kondici nového kusu. Čistící hmota zase skvěle poslouží k vytažení drobků z klávesnice MacBooku nebo prachu ze spár u reproduktorů iPhonu, kam se žádný hadřík nedostane.

## Silikonové pouzdro na AirTag: Aby sledování dávalo smysl

AirTag je geniální zařízení, ale bez správného příslušenství je jeho využití omezené. Naše silikonová pouzdra na AirTag ve formě klíčenky nebo držáku na pásek zajistí, že lokátor neztratíte ani při náročnější manipulaci se zavazadly. Silikon tlumí vibrace a chrání nerezovou ocel AirTagu před nevzhlednými škrábanci, které vznikají při kontaktu s klíči. Díky výrazným barvám navíc AirTag snadno vizuálně identifikujete i v hloubce batohu. Jsou to právě tyto promyšlené detaily, které dělají z drahé elektroniky spolehlivé parťáky pro každý den, na které se můžete stoprocentně spolehnout.
    `,
  },
  {
    slug: "5-vychytavek-ktere-prodlouzi-zivotnost-vasi-elektroniky",
    title: "5 vychytávek, které prodlouží životnost vaší elektroniky",
    excerpt: "Nenápadné doplňky, které ve skutečnosti dělají největší práci. Podívejte se na jednoduché způsoby, jak ochránit svou elektroniku a vyhnout se zbytečným opravám.",
    date: "29. 3. 2026",
    tag: "Průvodce",
    img: "/images/blog/apple.jpg",
    content: `

## 5 vychytávek, které prodlouží životnost vaší elektroniky

Moderní elektronika je výkonná, krásná a… překvapivě křehká. Stačí trochu prachu v konektoru, pár pádů na stůl nebo chaos v batohu a zařízení, které stálo tisíce, začne zlobit. Paradoxně přitom často nejde o žádné složité problémy, ale o drobnosti, které se dlouhodobě ignorují. Právě ty rozhodují o tom, jestli vám telefon nebo notebook vydrží roky, nebo skončí v servisu mnohem dřív, než by musel.

 

## Krytky konektorů: Malý detail, velký dopad

Prach a nečistoty jsou tichý zabiják elektroniky. V konektorech se postupně hromadí drobné částice, které mohou způsobit špatný kontakt nebo dokonce úplné selhání nabíjení. Krytky konektorů fungují jako jednoduchá bariéra, která tomuto problému předchází. Nepůsobí nijak zásadně, ale jejich efekt je dlouhodobě znatelný, zejména pokud zařízení často nosíte v kapse nebo batohu.

 

## Ochranné sklo na čočku fotoaparátu

Zatímco displej si většina lidí chrání, na fotoaparát se často zapomíná. Přitom právě čočky jsou vystavené neustálému kontaktu s povrchy, kapsami nebo klíči. I drobné škrábance mohou ovlivnit kvalitu fotografií, což si člověk uvědomí až ve chvíli, kdy už je pozdě. Ochranné sklo na čočku je jednoduché řešení, které pomáhá zachovat kvalitu snímků bez nutnosti řešit drahé opravy.

 

## Organizéry kabelů: Více než jen pořádek

Zamotaný kabel není jen estetický problém. Každé násilné rozmotávání namáhá vnitřní strukturu vodičů, což vede k jejich postupnému poškození. Organizéry kabelů pomáhají udržet kabely ve správném tvaru a snižují riziko jejich zlomení. Výsledkem je nejen větší přehled, ale i delší životnost příslušenství, které by jinak bylo potřeba často nahrazovat.

 

## Čistící nástroje: Podceňovaná údržba

Elektronika se používá každý den, ale její čištění většinou zůstává na posledním místě. Přitom právě nečistoty v reproduktorech, portech nebo sluchátkách mohou výrazně ovlivnit jejich funkčnost. Speciální čistící nástroje, jako jsou jemné kartáčky nebo čistící hmota, umožňují odstranit prach i z těžko dostupných míst bez rizika poškození zařízení. Pravidelná údržba přitom zabere jen pár minut.

 

## Jednoduché stojánky a držáky

Možná to zní banálně, ale způsob, jakým zařízení odkládáte, má překvapivě velký vliv na jeho stav. Pokládání telefonu na tvrdé povrchy nebo jeho neustálé přenášení v ruce zvyšuje riziko pádů a poškození. Jednoduché stojánky a držáky pomáhají udržet zařízení na jednom místě, chránit ho před nárazy a zároveň zvyšují komfort při používání.

 

## Malé změny, velký rozdíl

Na první pohled jde o drobnosti, které se snadno přehlédnou. V praxi ale právě tyto malé změny rozhodují o tom, jak dlouho vám elektronika vydrží v dobrém stavu. Nejde o velké investice ani složité úpravy, ale o jednoduché návyky a doplňky, které dávají smysl. A pokud vám díky nim zařízení vydrží o rok nebo dva déle, je to asi lepší výsledek než další návštěva servisu.

    `,
  },
  {
    slug: "ropna-krize-2026-jak-ovlivni-ceny-elektroniky",
    title: "Ropná krize 2026: proč kvůli Blízkému východu zdraží i vaše elektronika",
    excerpt: "Napětí na Blízkém východě neovlivňuje jen ceny benzínu. Podívejte se, proč ropná krize dopadá i na elektroniku, dopravu a běžné produkty, které používáte každý den.",
    date: "18. 3. 2026",
    tag: "Aktuálně",
    img: "/images/blog/ropa.jpg",
    content: `

## Ropná krize 2026: proč kvůli Blízkému východu zdraží i vaše elektronika

Napětí na Blízkém východě se může zdát jako vzdálený problém, který se týká hlavně politiky a energetiky. Ve skutečnosti ale zasahuje mnohem širší spektrum každodenního života. Moderní ekonomika je extrémně propojená a jakýkoliv výpadek v jedné její části se rychle projeví jinde.

Ropa je přitom stále jedním ze základních pilířů globálního fungování. Nejde jen o palivo do aut, ale o klíčovou surovinu pro dopravu, výrobu, logistiku i chemický průmysl. Jakmile se její tok naruší, začnou se řetězově zvedat ceny napříč celým trhem.

 

## Co se aktuálně děje na Blízkém východě

Jedním z největších problémů současné situace je nejistota kolem dopravy ropy. Klíčovou roli hraje oblast Perského zálivu, zejména Hormuzský průliv, kterým prochází významná část světových dodávek.

Jakmile se objeví riziko omezení průjezdu, trhy reagují téměř okamžitě. Nečeká se na skutečný výpadek, ale ceny rostou už jen kvůli obavám, že by k němu mohlo dojít. To vytváří tlak nejen na energetické firmy, ale i na celý dodavatelský řetězec.

Důležité je pochopit, že trh je dnes řízený očekáváním. Strach z budoucnosti má často větší dopad než současný stav.

 

## Proč zdražení ropy dopadá na všechno

Jakmile roste cena ropy, zdražuje se doprava. A protože většina produktů se během výroby a distribuce přesouvá mezi kontinenty, promítne se to prakticky do všeho.

Každý produkt má v sobě „skrytou dopravu“ – od surovin přes výrobu až po doručení zákazníkovi. Vyšší náklady na přepravu tak firmy postupně promítají do koncových cen.

Nejde přitom jen o fyzické produkty. Dražší energie znamená i vyšší provozní náklady firem, které se následně přenášejí do služeb. Výsledkem je plošné zdražování, které se dotýká téměř každého odvětví.

 

## Dopad na elektroniku a technologický sektor

Elektronika je na globálních dodavatelských řetězcích závislá možná víc než jakýkoliv jiný segment. Výroba jednoho zařízení často zahrnuje desítky různých zemí, kde se jednotlivé komponenty vyrábějí, testují a skládají.

To znamená, že každý nárůst ceny dopravy má násobný efekt. Komponenty se nepřesouvají jen jednou, ale opakovaně v různých fázích výroby. Výsledkem je postupné navyšování nákladů, které se nakonec projeví v ceně finálního produktu.

Dalším problémem je nepřímý dopad na výrobu čipů. Ta je závislá na stabilních dodávkách chemických látek a energií. Jakmile se naruší logistika nebo zdraží provoz továren, může dojít ke zpomalení výroby nebo omezení kapacit.

To může znovu otevřít problém nedostatku polovodičů, který už jednou výrazně ovlivnil dostupnost elektroniky po celém světě.

 

## Co může očekávat běžný uživatel

Dopady ropné krize nejsou okamžité, ale přicházejí postupně. Nejrychleji reagují ceny pohonných hmot, následně doprava a logistika. Elektronika obvykle zdražuje s odstupem několika měsíců.

Pokud napětí přetrvá, může to znamenat:

- vyšší ceny telefonů, notebooků a příslušenství  
- delší čekací doby na nové produkty  
- omezenou dostupnost některých modelů  

Pro běžného uživatele to znamená jediné – technologie, které dnes bereme jako samozřejmost, se mohou stát o něco méně dostupné.

 

## Proč na tom záleží víc, než se zdá

Ropná krize není jen otázkou energie. Je to ukázka toho, jak citlivý je dnešní svět na geopolitické změny. I relativně lokální konflikt může mít globální dopady, které se projeví v každodenním životě milionů lidí.

Z dlouhodobého hlediska to navíc vytváří tlak na firmy i státy, aby hledaly alternativy – ať už v podobě obnovitelných zdrojů, lokální výroby nebo efektivnější logistiky.

 

## Shrnutí

Napětí na Blízkém východě ovlivňuje mnohem víc než jen ceny benzínu. Růst cen ropy se postupně promítá do dopravy, výroby i dostupnosti produktů, včetně elektroniky.

I když se to může zdát jako vzdálený problém, jeho dopady se časem projeví i v běžném životě. Ať už v podobě vyšších cen, nebo horší dostupnosti technologií, které dnes považujeme za samozřejmé.

    `,
  },
  {
    slug: "proc-zdrazuji-cipy-a-co-to-znamena-pro-elektroniku",
    title: "Proč znovu zdražují čipy a co to znamená pro elektroniku",
    excerpt: "Ceny čipů opět rostou a výrobci varují před dalším zdražováním. Zjistěte, co za tím stojí a jaký dopad to bude mít na ceny telefonů, notebooků i dalších zařízení.",
    date: "11. 4. 2026",
    tag: "Aktuálně",
    img: "/images/blog/cip.jpg",
    content: `

## Proč znovu zdražují čipy a co to znamená pro elektroniku

Po krátkém uklidnění trhu se ceny čipů znovu dostávají pod tlak. Pro běžného uživatele je to nenápadná změna, která se ale postupně promítne do cen téměř všech moderních zařízení. Od telefonů přes notebooky až po chytrou domácnost – všechno dnes stojí na polovodičích.

Zatímco dříve byl nedostatek čipů spojený hlavně s pandemií, dnes za růstem cen stojí kombinace několika faktorů, které se navzájem posilují.

 

## Co způsobuje růst cen čipů

Výroba čipů je extrémně složitý proces, který závisí na stabilním dodavatelském řetězci, obrovském množství energie a specializovaných materiálech. Jakmile se naruší byť jen jedna část tohoto systému, projeví se to na celé produkci.

Jedním z hlavních problémů je rostoucí poptávka. Umělá inteligence, datová centra a moderní technologie zvyšují tlak na výrobní kapacity, které nestíhají reagovat dostatečně rychle.

Zároveň roste cena energií a provozu továren, což přímo zvyšuje náklady na výrobu každého čipu.

 

## Geopolitika a výroba polovodičů

Výroba čipů je koncentrovaná do několika málo regionů, zejména v Asii. To znamená, že jakékoliv napětí v těchto oblastech může výrazně ovlivnit globální dodávky.

Státy si zároveň začínají uvědomovat strategický význam polovodičů a snaží se přesunout část výroby na své území. To sice zvyšuje bezpečnost dodávek, ale zároveň to znamená vyšší náklady, které se opět promítají do cen.

Výsledkem je méně efektivní, ale stabilnější systém – a ten je téměř vždy dražší.

 

## Jak se to projeví na cenách elektroniky

Čipy jsou základní stavební jednotkou moderní elektroniky. Jakmile zdraží, výrobci mají v zásadě dvě možnosti – snížit marže, nebo zvýšit ceny.

V praxi se obvykle děje kombinace obojího, ale část nákladů se téměř vždy přenese na zákazníka.

Nejvíce se to projeví u:

- smartphonů  
- notebooků a počítačů  
- herních konzolí  
- chytré domácnosti  

Zdražení přitom nemusí být dramatické na první pohled, ale postupně se sčítá napříč celým trhem.

 

## Nedostatek vs. drahé čipy

Je důležité rozlišovat mezi nedostatkem a zdražením. V minulých letech byl problém hlavně v tom, že čipy nebyly vůbec dostupné. Dnes je situace jiná – čipy jsou, ale jsou dražší.

To znamená, že produkty budou dostupné, ale za vyšší cenu. Pro výrobce je to menší problém než úplný výpadek, pro zákazníky ale znamená dlouhodobý tlak na rozpočet.

 

## Co to znamená do budoucna

Současný vývoj naznačuje, že levná elektronika, na kterou jsme byli zvyklí, se pomalu stává minulostí. Rostoucí náklady na výrobu, energie i logistiku vytvářejí nový standard, na který si trh postupně zvyká.

Zároveň to ale může vést k inovacím – efektivnější čipy, lepší optimalizace a delší životnost zařízení.

 

## Shrnutí

Růst cen čipů není náhodný výkyv, ale výsledek hlubších změn v globální ekonomice. Vyšší poptávka, geopolitické napětí i rostoucí náklady na výrobu vytvářejí prostředí, ve kterém elektronika postupně zdražuje.

Pro běžného uživatele to znamená jediné – technologie zůstávají dostupné, ale už ne tak levné jako dřív.

    `,
  },
  {
    slug: "jak-prodlouzit-zivotnost-baterie-u-telefonu-a-notebooku",
    title: "Jak prodloužit životnost baterie u telefonu a notebooku (2026)",
    excerpt: "Baterie je nejslabší článek každého zařízení. Naučte se jednoduché návyky, které prodlouží její životnost a ušetří vám peníze za výměnu.",
    date: "16. 4. 2026",
    tag: "Průvodce",
    img: "/images/blog/baterie.jpg",
    content: `

## Jak prodloužit životnost baterie u telefonu a notebooku (2026)

Baterie je jedna z mála součástek elektroniky, která se nevyhnutelně opotřebovává. Ať už máte jakýkoliv telefon nebo notebook, postupem času začne její kapacita klesat. Dobrá zpráva je, že způsob, jakým zařízení používáte, má na tento proces obrovský vliv.

Správnými návyky můžete životnost baterie prodloužit o měsíce až roky. A to bez nutnosti kupovat jakékoliv nové příslušenství.

 

## Proč baterie degradují

Moderní zařízení používají lithium-iontové baterie, které mají omezený počet nabíjecích cyklů. Každé úplné nabití a vybití baterii postupně opotřebovává.

Kromě cyklů má velký vliv i teplota a způsob nabíjení. Extrémní podmínky nebo nevhodné návyky mohou degradaci výrazně urychlit.

Jinými slovy – baterie stárne vždy, ale může stárnout pomalu, nebo zbytečně rychle.

 

## Ideální rozsah nabití

Jedním z nejdůležitějších faktorů je, v jakém rozmezí baterii udržujete. Největší zátěž vzniká při extrémech – tedy když je baterie dlouhodobě na 0 % nebo 100 %.

Optimální je držet nabití přibližně mezi 20 % a 80 %. V tomto rozsahu dochází k nejmenšímu opotřebení.

To neznamená, že nikdy nemáte nabít na 100 %, ale nemělo by to být každodenní standard.

 

## Pozor na teplotu

Teplo je jeden z největších nepřátel baterie. Vysoké teploty urychlují chemické procesy uvnitř baterie a tím i její degradaci.

Typické situace, které baterii škodí:

- používání telefonu při nabíjení  
- nechávání zařízení na přímém slunci  
- hraní náročných her bez chlazení  

Naopak mírné prostředí výrazně pomáhá udržet baterii v dobrém stavu.

 

## Rychlé nabíjení: pohodlí vs. životnost

Rychlé nabíjení je extrémně praktické, ale má svou cenu. Vyšší proud znamená větší zahřívání, což baterii dlouhodobě škodí.

Občasné použití je v pořádku, ale pokud chcete baterii šetřit, je lepší kombinovat rychlé a pomalé nabíjení.

Například přes noc může být výhodnější použít klasickou, pomalejší nabíječku.

 

## Dlouhodobé skladování zařízení

Pokud zařízení delší dobu nepoužíváte, není ideální ho nechat úplně vybité nebo plně nabité.

Nejlepší je uložit ho s přibližně 50 % baterie a čas od času zkontrolovat. Tím se minimalizuje dlouhodobé poškození.

 

## Software a optimalizace

Moderní zařízení obsahují funkce, které pomáhají chránit baterii automaticky. Například optimalizované nabíjení, které zpomaluje nabíjení nad určitou úroveň.

Vyplatí se tyto funkce zapnout a nechat zařízení, aby část práce udělalo za vás.

 

## Kdy už baterii vyměnit

Ani při nejlepší péči baterie nevydrží věčně. Pokud zaznamenáte výrazný pokles výdrže, nečekané vypínání nebo přehřívání, je pravděpodobně čas na výměnu.

Dobrá zpráva je, že výměna baterie bývá jedna z nejefektivnějších oprav, která zařízení vrátí téměř plnou použitelnost.

 

## Shrnutí

Životnost baterie není daná jen výrobcem, ale i tím, jak zařízení používáte. Vyhýbání se extrémům, kontrola teploty a rozumné nabíjení mohou výrazně prodloužit její životnost.

Malé změny v každodenním používání tak mohou znamenat velký rozdíl v tom, jak dlouho vám zařízení vydrží bez nutnosti servisu.

    `,
  },
];

// ── Čtení / zápis ────────────────────────────────────────────────────────

let seeded = false;

async function ensureSeeded(): Promise<void> {
  if (seeded) return; // v rámci jedné teplé instance to zkoušet znovu nemá cenu
  const redis = getRedis();
  const count = await redis.hlen(HASH_KEY);
  if (count === 0) {
    const fields: Record<string, string> = {};
    for (const post of LEGACY_SEED) {
      const full: BlogPost = { ...post, createdAt: parseCzechDate(post.date) };
      fields[post.slug] = JSON.stringify(full);
    }
    await redis.hset(HASH_KEY, fields);
  }
  seeded = true;
}

function parsePost(raw: string | BlogPost): BlogPost {
  return typeof raw === "string" ? (JSON.parse(raw) as BlogPost) : raw;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  await ensureSeeded();
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string | BlogPost>>(HASH_KEY);
  if (!raw) return [];
  return Object.values(raw)
    .map(parsePost)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  await ensureSeeded();
  const redis = getRedis();
  const raw = await redis.hget<string | BlogPost>(HASH_KEY, slug);
  if (!raw) return null;
  return parsePost(raw);
}

// Vytvoří nebo přepíše článek pod daným slugem (upsert).
export async function savePost(post: Omit<BlogPost, "createdAt"> & { createdAt?: number }): Promise<BlogPost> {
  const redis = getRedis();
  const full: BlogPost = { ...post, createdAt: post.createdAt ?? parseCzechDate(post.date) };
  await redis.hset(HASH_KEY, { [post.slug]: JSON.stringify(full) });
  return full;
}

export async function deletePost(slug: string): Promise<void> {
  const redis = getRedis();
  await redis.hdel(HASH_KEY, slug);
}

// ── Vykreslení obsahu (web i živý náhled v adminu) ──────────────────────────
// Podporuje: "## " nadpisy, "- " odrážky, "**tučně**" uvnitř textu.
// Vrací pole popisných bloků — konzumují je React komponenty na webu i
// v admin náhledu, každá si je vykreslí svými vlastními styly.
export type BlogContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseBlogContent(text: string): BlogContentBlock[] {
  const blocks = text.trim().split(/\n\s*\n/);
  const result: BlogContentBlock[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      result.push({ type: "heading", text: trimmed.slice(3).trim() });
      continue;
    }

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => l.startsWith("- "))) {
      result.push({ type: "list", items: lines.map((l) => l.slice(2).trim()) });
      continue;
    }

    result.push({ type: "paragraph", text: trimmed });
  }

  return result;
}

// Rozseká text s "**tučně**" značkami na kusy pro React render — použití:
// {splitBold(text).map((part, i) => part.bold ? <strong key={i}>{part.text}</strong> : part.text)}
export function splitBold(text: string): { text: string; bold: boolean }[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) =>
    p.startsWith("**") && p.endsWith("**")
      ? { text: p.slice(2, -2), bold: true }
      : { text: p, bold: false },
  );
}