import type { ProductSafety } from "./productSafety";

// ─── Typy ───────────────────────────────────────────

/**
 * Od kolika kusů níž hlásíme „docházejí zásoby". Platí `zbývá <= 5`.
 *
 * JEDINÉ místo, kde se ta hranice určuje — používá ji odznak „Poslední kusy!"
 * na kartách (homepage, kategorie, hledání) i barevná tečka skladu a odznak na
 * detailu produktu. Dřív měl každý soubor vlastní číslo: karty křičely
 * „Poslední kusy" už od 10 kusů, ale tečka vedle nich hlásila zeleně „Skladem"
 * až do 5 — takže produkt se 7 kusy tvrdil obojí naráz. Když tohle číslo měníš,
 * měň ho tady a nikde jinde.
 */
export const LOW_STOCK_THRESHOLD = 5;

export type PriceValue = number | { CZK: number; EUR?: number; USD?: number };

export type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster?: string };

// Položka setu — odkaz na jiný produkt a kolik jeho kusů set obsahuje.
export type BundleItem = {
  slug: string;
  quantity: number;
};

export type Product = {
  slug: string;
  name: string;
  name_en?: string;
  name_sk?: string;
  price: PriceValue;
  categories: string[];
  img: string;
  // Popis je povinný česky; překlady jsou volitelné a čtou se přes
  // getProductDescription(). Chybí-li, spadne to zpět na češtinu.
  description: string;
  description_en?: string;
  description_sk?: string;
  inStock: boolean;
  stock: number;
  tags?: string[];
  media?: MediaItem[];
  related?: string[];
  // Volitelné hodnocení pro produktovou kartu (hvězdičky + počet recenzí).
  // Recenze na webu jsou celowebové, ne per-produkt, takže tohle je editorial
  // pole — vyplní se ručně u produktu, kde ho chceme ukázat. Bez vyplnění se
  // hvězdičky nezobrazí (nic se nevymýšlí).
  rating?: number;        // 1–5, klidně desetinné (např. 4.7)
  reviewCount?: number;   // počet hodnocení pro popisek „(14×)"
  // Doplněno za běhu vrstvou slev (lib/productDiscounts.ts). Když má produkt
  // slevu, `price` už je zlevněná cena, `originalPrice` původní (přeškrtnutá)
  // a `discountPercent` zaokrouhlené procento pro odznak „−X %".
  originalPrice?: PriceValue;
  discountPercent?: number;
  // Bezpečnostní údaje podle GPSR (viz lib/productSafety.ts). Nevyplněné =
  // platí výchozí hodnoty (Slingr jako výrobce, věk od 6 let), takže se to
  // u produktu uvádí jen tehdy, když se od nich liší.
  safety?: ProductSafety;
  // Vyplněné = produkt je SET poskládaný z jiných produktů. Set nemá vlastní
  // skladovost: dopočítává se z komponent (viz getBundleStock) a v Redisu pro
  // něj žádné pole neexistuje. Odečet při objednávce se rozpadne na komponenty
  // (viz deductStockForItems v lib/stock.ts).
  bundle?: BundleItem[];
};

// ─── Produkty ───────────────────────────────────────

export const products: Product[] = [
  {
    slug: "prak-x1",
    name: "Prak Slingr X1",
    name_en: "Slingr X1 Slingshot",
    name_sk: "Prak Slingr X1",
    price: { CZK: 499 },
    categories: ["zbrane"],
    img: "/images/products/prak-x1/main.png",
    description: [
      "Natáhni gumu. Pusť. Zásah. Žádné modřiny, žádný nepořádek — čistá akce venku.",
      "Prak Slingr X1 je náš základ, se kterým to u většiny lidí začíná. Lehký, odolný a dost jednoduchý na to, aby ho zvládlo i dítě hned první odpoledne.",
      "🎯 Pohodlný úchop — Padne do dětské i dospělácké ruky.\n💪 Pružná guma — Pošle měkkou munici pěkně daleko.\n💧 Dvojí munice — Vodní balónky i pěnové míčky, podle nálady.\n🌳 Vydrží venku — Zvládne zahradu, park i pár pádů do trávy.",
      "Střílí se jen měkkou municí, takže se dá hrát i tam, kde by tvrdý náboj nadělal škodu. Zásah nebolí — a to je celý smysl.",
      "Věk: od 6 let · Munice: pěnové míčky a vodní balónky",
    ].join("\n\n"),
    description_en: [
      "Pull the band. Let go. Hit. No bruises, no mess — just clean action outdoors.",
      "The Slingr X1 is our staple, and it's where most people start. Light, durable and simple enough for a kid to get the hang of on the first afternoon.",
      "🎯 Comfortable grip — Fits kids' and adults' hands alike.\n💪 Elastic band — Sends soft ammo nice and far.\n💧 Two kinds of ammo — Water balloons or foam balls, whatever the mood.\n🌳 Built for outdoors — Handles the garden, the park and a few drops in the grass.",
      "It fires soft ammo only, so you can play where hard pellets would do damage. Getting hit doesn't hurt — that's the whole point.",
      "Age: from 6 · Ammo: foam balls and water balloons",
    ].join("\n\n"),
    description_sk: [
      "Natiahni gumu. Pusť. Zásah. Žiadne modriny, žiadny neporiadok — čistá akcia vonku.",
      "Prak Slingr X1 je náš základ, s ktorým to u väčšiny ľudí začína. Ľahký, odolný a dosť jednoduchý na to, aby ho zvládlo aj dieťa hneď prvé popoludnie.",
      "🎯 Pohodlný úchop — Padne do detskej aj dospeláckej ruky.\n💪 Pružná guma — Pošle mäkkú muníciu pekne ďaleko.\n💧 Dvojaká munícia — Vodné balóny aj penové loptičky, podľa nálady.\n🌳 Vydrží vonku — Zvládne záhradu, park aj pár pádov do trávy.",
      "Strieľa sa len mäkkou muníciou, takže sa dá hrať aj tam, kde by tvrdý náboj narobil škodu. Zásah nebolí — a to je celý zmysel.",
      "Vek: od 6 rokov · Munícia: penové loptičky a vodné balóny",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["prak", "zbraň", "slingr", "střílení", "venku", "hračka", "děti", "vodní balónky", "míčky"],
    // Hlavní fotka je `img` výš; `media` jsou další náhledy v galerii v pořadí,
    // v jakém se mají zobrazit (viz galleryItems v ProduktClient).
    media: [
      { type: "image", src: "/images/products/prak-x1/img-1.jpg" },
    ],
    related: ["micky-do-praku", "vodni-balonky", "terc"],
  },
  {
    slug: "micky-do-praku",
    name: "Míčky do praku Slingr",
    name_en: "Slingr Slingshot Balls",
    name_sk: "Loptičky do praku Slingr",
    price: { CZK: 149 },
    categories: ["munice"],
    img: "/images/products/micky/main.png",
    description: [
      "Munice dochází vždycky v nejlepší chvíli. S tímhle balením ne.",
      "Náhradní pěnové míčky do praku Slingr. Měkké, lehké a barevné — dost velké na přesný zásah, ale šetrné, takže po nich nikdo nebrečí.",
      "🎨 Barevné — Po bitvě je snadno najdeš v trávě.\n🪶 Lehké — Letí přesně, ale zásah nebolí.\n♻️ Použij znovu — Posbírej a střílej dál, dokola.\n🎯 Sedí do praku — Dělané přímo pro prak Slingr X1.",
      "Věk: od 6 let · Materiál: měkká pěna",
    ].join("\n\n"),
    description_en: [
      "Ammo always runs out at the worst possible moment. Not with this pack.",
      "Spare foam balls for the Slingr slingshot. Soft, light and colourful — big enough for an accurate hit, gentle enough that nobody cries about it.",
      "🎨 Colourful — Easy to find in the grass after a battle.\n🪶 Light — They fly true, but getting hit doesn't hurt.\n♻️ Reusable — Pick them up and keep shooting, over and over.\n🎯 Made to fit — Sized for the Slingr X1 slingshot.",
      "Age: from 6 · Material: soft foam",
    ].join("\n\n"),
    description_sk: [
      "Munícia dochádza vždy v tej najlepšej chvíli. S týmto balením nie.",
      "Náhradné penové loptičky do praku Slingr. Mäkké, ľahké a farebné — dosť veľké na presný zásah, ale šetrné, takže po nich nikto neplače.",
      "🎨 Farebné — Po bitke ich ľahko nájdeš v tráve.\n🪶 Ľahké — Letia presne, ale zásah nebolí.\n♻️ Použi znova — Pozbieraj a strieľaj ďalej, dokola.\n🎯 Sedia do praku — Robené priamo pre prak Slingr X1.",
      "Vek: od 6 rokov · Materiál: mäkká pena",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["míčky", "munice", "náboje", "prak", "slingr", "náhradní", "kuličky"],
    related: ["prak-x1", "vodni-balonky", "terc"],
  },
  {
    slug: "vodni-balonky",
    name: "Vodní balónky Slingr",
    name_en: "Slingr Water Balloons",
    name_sk: "Vodné balóny Slingr",
    price: { CZK: 99 },
    categories: ["munice"],
    img: "/images/products/vodni-balonky/main.png",
    description: [
      "Třicet stupňů ve stínu a nikdo nechce dovnitř. Přesně na tohle jsou.",
      "Sada vodních balónků do praku Slingr. Rychle se plní, pořádně stříkají a při zásahu neškodně prasknou. Nabij, zamiř na kámoše a rozjeď válku na zahradě.",
      "🚿 Rychlé plnění — Napustíš je z hadice nebo z kohoutku za pár vteřin.\n💦 Pořádný zásah — Prasknou a je mokro. O nic víc nejde.\n🧨 Nic nezůstane — Po zásahu se rozpadnou, žádná tvrdá munice.\n☀️ Letní klasika — Nejlepší způsob, jak přežít horký den na zahradě.",
      "⚠️ Než začnete: Balónky plňte jen vodou a nepřeplňujte je — přeplněný balónek je těžký a letí jinam, než míříš.",
      "Věk: od 6 let · Použití: venku",
    ].join("\n\n"),
    description_en: [
      "Thirty degrees in the shade and nobody wants to go inside. This is exactly what they're for.",
      "A set of water balloons for the Slingr slingshot. They fill quickly, splash hard and burst harmlessly on impact. Load up, aim at your mate and start a war in the garden.",
      "🚿 Fills fast — A few seconds from a hose or a tap.\n💦 Proper hit — It bursts and you're wet. That's the whole idea.\n🧨 Nothing left over — They break apart on impact, no hard ammo.\n☀️ Summer classic — The best way to survive a hot day in the garden.",
      "⚠️ Before you start: Fill the balloons with water only, and don't overfill them — an overfilled balloon is heavy and flies somewhere other than where you aimed.",
      "Age: from 6 · Use: outdoors",
    ].join("\n\n"),
    description_sk: [
      "Tridsať stupňov v tieni a nikto nechce dnu. Presne na toto sú.",
      "Sada vodných balónov do praku Slingr. Rýchlo sa plnia, poriadne striekajú a pri zásahu neškodne prasknú. Nabi, zamier na kamoša a rozbehni vojnu na záhrade.",
      "🚿 Rýchle plnenie — Napustíš ich z hadice alebo z kohútika za pár sekúnd.\n💦 Poriadny zásah — Prasknú a je mokro. O nič viac nejde.\n🧨 Nič nezostane — Po zásahu sa rozpadnú, žiadna tvrdá munícia.\n☀️ Letná klasika — Najlepší spôsob, ako prežiť horúci deň na záhrade.",
      "⚠️ Než začnete: Balóny plňte len vodou a nepreplňujte ich — preplnený balón je ťažký a letí inam, než mieriš.",
      "Vek: od 6 rokov · Použitie: vonku",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["vodní balónky", "balónky", "munice", "voda", "léto", "prak", "slingr", "zahrada"],
    related: ["prak-x1", "micky-do-praku", "terc"],
  },
  {
    slug: "terc",
    name: "Terč Slingr",
    name_en: "Slingr Target",
    name_sk: "Terč Slingr",
    price: { CZK: 249 },
    categories: ["prislusenstvi"],
    img: "/images/products/terc/main.png",
    description: [
      "Střílet po kamarádech je zábava. Střílet na skóre je závislost.",
      "Skládací terč Slingr na trénink přesnosti i na dlouhé souboje o nejvyšší nástřel. Postav ho na dvorek, trefuj se do zón a zjisti, kdo má doopravdy nejlepší mušku.",
      "🎯 Bodované zóny — Každý zásah se počítá, o vítězi není spor.\n📐 Skládací — Po hraní ho složíš a uklidíš do kouta.\n🧍 I sólo — Na trénink nepotřebuješ soupeře.\n🏡 Kamkoliv — Dvorek, zahrada, chodba u baráku.",
      "Sedí k praku Slingr X1 a k pěnovým míčkům. Vodní balónky si na něj radši nechte na jindy — terč není na to, aby zmokl.",
      "Věk: od 6 let · Provedení: skládací",
    ].join("\n\n"),
    description_en: [
      "Shooting at your mates is fun. Shooting for a score is an addiction.",
      "A folding Slingr target for accuracy practice and long battles for the highest score. Set it up in the yard, hit the zones and find out who really has the best aim.",
      "🎯 Scoring zones — Every hit counts, no arguing about the winner.\n📐 Folds away — Fold it up and stash it in a corner when you're done.\n🧍 Solo too — You don't need an opponent to practise.\n🏡 Anywhere — The yard, the garden, the path by the house.",
      "Made for the Slingr X1 slingshot and foam balls. Save the water balloons for another day — the target isn't meant to get soaked.",
      "Age: from 6 · Design: folding",
    ].join("\n\n"),
    description_sk: [
      "Strieľať po kamarátoch je zábava. Strieľať na skóre je závislosť.",
      "Skladací terč Slingr na tréning presnosti aj na dlhé súboje o najvyšší nástrel. Postav ho na dvor, trafuj sa do zón a zisti, kto má naozaj najlepšiu mušku.",
      "🎯 Bodované zóny — Každý zásah sa počíta, o víťazovi niet sporu.\n📐 Skladací — Po hraní ho zložíš a upraceš do kúta.\n🧍 Aj sólo — Na tréning nepotrebuješ súpera.\n🏡 Kamkoľvek — Dvor, záhrada, chodba pri dome.",
      "Sedí k praku Slingr X1 a k penovým loptičkám. Vodné balóny si naň radšej nechajte na inokedy — terč nie je na to, aby zmokol.",
      "Vek: od 6 rokov · Vyhotovenie: skladací",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["terč", "příslušenství", "trénink", "přesnost", "prak", "slingr", "cíl", "skóre"],
    related: ["prak-x1", "micky-do-praku", "penove-plechovky"],
  },
  {
    slug: "penove-plechovky",
    name: "Pěnové plechovky Slingr",
    name_en: "Slingr Foam Cans",
    name_sk: "Penové plechovky Slingr",
    price: { CZK: 349 },
    categories: ["prislusenstvi"],
    img: "/images/products/penove-plechovky/main.png",
    description: [
      "Postav pyramidu. Sestřel ji jednou ranou. A pak zase odznova.",
      "Sada lehkých pěnových plechovek Slingr. Klasika, u které vydrží děti i dospělí mnohem dýl, než by čekali — hlavně proto, že „ještě jednou“ nikdy není naposledy.",
      "🥫 Staví se rychle — Pyramida za pár vteřin, sestřelená za jednu ránu.\n🪶 Měkká pěna — Nic nepoškrábe ani nerozbije.\n🏠 I uvnitř — Terasa, chodba, klidně obývák.\n🏆 Souboj — Kdo srazí víc, ten bere.",
      "Nejlíp fungují s pěnovými míčky. Na vodní balónky je nech být — pěna a voda spolu dlouho nekamarádí.",
      "Věk: od 6 let · Materiál: měkká pěna · Použití: venku i uvnitř",
    ].join("\n\n"),
    description_en: [
      "Build the pyramid. Take it down in one shot. Then do it again.",
      "A set of light Slingr foam cans. The kind of classic that keeps kids and adults busy far longer than they expect — mostly because \"one more go\" never is.",
      "🥫 Quick to set up — A pyramid in seconds, down in one shot.\n🪶 Soft foam — Won't scratch or break anything.\n🏠 Indoors too — Terrace, hallway, even the living room.\n🏆 Head to head — Whoever knocks down more wins.",
      "They work best with foam balls. Leave the water balloons out of it — foam and water don't stay friends for long.",
      "Age: from 6 · Material: soft foam · Use: indoors and outdoors",
    ].join("\n\n"),
    description_sk: [
      "Postav pyramídu. Zostreľ ju jednou ranou. A potom zase odznova.",
      "Sada ľahkých penových plechoviek Slingr. Klasika, pri ktorej vydržia deti aj dospelí oveľa dlhšie, než by čakali — hlavne preto, že „ešte raz“ nikdy nie je naposledy.",
      "🥫 Stavia sa rýchlo — Pyramída za pár sekúnd, zostrelená za jednu ranu.\n🪶 Mäkká pena — Nič nepoškriabe ani nerozbije.\n🏠 Aj vnútri — Terasa, chodba, pokojne obývačka.\n🏆 Súboj — Kto zrazí viac, ten berie.",
      "Najlepšie fungujú s penovými loptičkami. Na vodné balóny ich nechaj tak — pena a voda spolu dlho nekamarátia.",
      "Vek: od 6 rokov · Materiál: mäkká pena · Použitie: vonku aj vnútri",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["plechovky", "pěnové", "sestřelení", "terč", "cíl", "příslušenství", "prak", "slingr", "trénink", "přesnost"],
    related: ["prak-x1", "micky-do-praku", "terc"],
  },

  // ─── Sety ─────────────────────────────────────────
  // Skladovost se NEVYPLŇUJE — dopočítá se z komponent (viz `bundle`).
  // `stock: 0` / `inStock: true` jsou jen statické fallbacky jako u ostatních
  // produktů; reálné číslo dodá lib/stock.ts.
  //
  // Obrázky zatím ukazují hlavní komponentu setu — až budou nafocené balíčky,
  // vyměnit za vlastní fotky v /public/images/products/<slug>/.
  {
    slug: "set-startovaci",
    name: "Startovací set Slingr",
    name_en: "Slingr Starter Set",
    name_sk: "Štartovací set Slingr",
    price: { CZK: 799 },
    categories: ["vyhodne-sety"],
    img: "/images/products/startovaci-set/main.png",
    description: [
      "Vybalit a střílet. Nic víc dokupovat nemusíš.",
      "Startovací set je nejjednodušší způsob, jak s Slingr začít. Prak, náhradní pěnové míčky a skládací terč — dohromady levněji, než když si to nakoupíš po kusech.",
      "🎁 Rovnou dárek — Kompletní balení, nemusíš nic vymýšlet.\n🎯 Hned se hraje — Prak i munice i terč, všechno naráz.\n💸 Levnější — Vyjde líp než tři samostatné nákupy.\n👶 Pro začátečníky — Sestavené tak, aby první odpoledne vyšlo.",
      "Věk: od 6 let · Vhodné jako dárek: ano",
    ].join("\n\n"),
    description_en: [
      "Unpack and shoot. Nothing else to buy.",
      "The starter set is the simplest way to get into Slingr. A slingshot, spare foam balls and a folding target — cheaper together than buying the three separately.",
      "🎁 Gift-ready — A complete kit, nothing left to figure out.\n🎯 Play right away — Slingshot, ammo and target, all at once.\n💸 Cheaper — Better value than three separate purchases.\n👶 For beginners — Put together so the first afternoon goes well.",
      "Age: from 6 · Suitable as a gift: yes",
    ].join("\n\n"),
    description_sk: [
      "Vybaliť a strieľať. Nič viac dokupovať nemusíš.",
      "Štartovací set je najjednoduchší spôsob, ako so Slingr začať. Prak, náhradné penové loptičky a skladací terč — dokopy lacnejšie, než keď si to nakúpiš po kusoch.",
      "🎁 Rovno darček — Kompletné balenie, nemusíš nič vymýšľať.\n🎯 Hneď sa hrá — Prak aj munícia aj terč, všetko naraz.\n💸 Lacnejšie — Vyjde lepšie než tri samostatné nákupy.\n👶 Pre začiatočníkov — Poskladané tak, aby prvé popoludnie vyšlo.",
      "Vek: od 6 rokov · Vhodné ako darček: áno",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["set", "balíček", "výhodný", "startovací", "prak", "míčky", "terč", "dárek", "začátečník"],
    related: ["set-vodni-bitva", "set-duel", "prak-x1"],
    bundle: [
      { slug: "prak-x1", quantity: 1 },
      { slug: "micky-do-praku", quantity: 1 },
      { slug: "terc", quantity: 1 },
    ],
  },
  {
    slug: "set-vodni-bitva",
    name: "Set Vodní bitva",
    name_en: "Water Battle Set",
    name_sk: "Set Vodná bitka",
    price: { CZK: 599 },
    categories: ["vyhodne-sety"],
    img: "/images/products/vodni-bitva-set/main.png",
    description: [
      "Nabij, zamiř, střílej. A pak znovu, dokud nejste všichni mokří.",
      "Letní balíček na horké dny: prak a dvojitá zásoba vodních balónků, ať ti munice nedojde uprostřed války na zahradě.",
      "💧 Dvojitá zásoba — Dvě balení balónků, ne jedno.\n☀️ Na léto — Přesně to, co se hodí, když je vedro.\n🚿 Rychlé plnění — Napustíš z hadice a jede se dál.\n🎁 Jako dárek — Balíček, u kterého se nemusíš rozmýšlet.",
      "⚠️ Než začnete: Balónky plňte jen vodou a nepřeplňujte je — přeplněný balónek je těžký a letí jinam, než míříš.",
      "Věk: od 6 let · Použití: venku",
    ].join("\n\n"),
    description_en: [
      "Load, aim, fire. Then again, until everyone's soaked.",
      "A summer bundle for hot days: a slingshot and a double supply of water balloons so you don't run out of ammo mid-war in the garden.",
      "💧 Double supply — Two packs of balloons, not one.\n☀️ Made for summer — Exactly what you want when it's baking.\n🚿 Fills fast — Top up from the hose and carry on.\n🎁 Gift-ready — A bundle you don't have to think about.",
      "⚠️ Before you start: Fill the balloons with water only, and don't overfill them — an overfilled balloon is heavy and flies somewhere other than where you aimed.",
      "Age: from 6 · Use: outdoors",
    ].join("\n\n"),
    description_sk: [
      "Nabi, zamier, strieľaj. A potom znova, kým nie ste všetci mokrí.",
      "Letný balíček na horúce dni: prak a dvojitá zásoba vodných balónov, aby ti munícia nedošla uprostred vojny na záhrade.",
      "💧 Dvojitá zásoba — Dve balenia balónov, nie jedno.\n☀️ Na leto — Presne to, čo sa hodí, keď je horúco.\n🚿 Rýchle plnenie — Napustíš z hadice a ide sa ďalej.\n🎁 Ako darček — Balíček, pri ktorom sa nemusíš rozmýšľať.",
      "⚠️ Než začnete: Balóny plňte len vodou a nepreplňujte ich — preplnený balón je ťažký a letí inam, než mieriš.",
      "Vek: od 6 rokov · Použitie: vonku",
    ].join("\n\n"),
    inStock: true,
    stock: 0,
    tags: ["set", "balíček", "výhodný", "voda", "vodní balónky", "léto", "prak", "zahrada", "bitva"],
    related: ["set-startovaci", "vodni-balonky", "prak-x1"],
    bundle: [
      { slug: "prak-x1", quantity: 1 },
      { slug: "vodni-balonky", quantity: 2 },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────

export type Category = {
  slug: string;
  name: string;
  name_en?: string;
  name_sk?: string;
};

export const categories: Category[] = [
  { slug: "vyhodne-sety",  name: "Výhodné sety",  name_en: "Value Bundles", name_sk: "Výhodné sety" },
  { slug: "zbrane",        name: "Zbraně",        name_en: "Blasters",      name_sk: "Zbrane" },
  { slug: "munice",        name: "Munice",        name_en: "Ammo",          name_sk: "Munícia" },
  { slug: "prislusenstvi", name: "Příslušenství", name_en: "Accessories",   name_sk: "Príslušenstvo" },
];

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categories.includes(slug));
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// ─── Sety ───────────────────────────────────────────

export function isBundle(product: Product): boolean {
  return Array.isArray(product.bundle) && product.bundle.length > 0;
}

export const bundles: Product[] = products.filter(isBundle);

/**
 * Kolikrát set poskládáme z toho, co je na skladě.
 *
 * Limituje ho vždycky ta nejhůř zásobená komponenta, a to VŮČI SVÉMU MNOŽSTVÍ
 * v setu: když set bere 2 ks míčků a skladem jich je 3, sety z nich složíme
 * jen jeden (floor(3 / 2)), ne tři.
 *
 * `stockOf` dostane slug komponenty a vrací její volné kusy — díky tomu je
 * tahle funkce čistá a nezávislá na Redisu, takže jde volat i z klienta.
 * Komponenty se nesčítají přes varianty: dnes žádný produkt v setu varianty
 * nemá, a kdyby měl, „5 kusů dohromady" by stejně neznamenalo, že jde složit
 * 5 setů v jedné barvě — v tu chvíli musí `bundle` nést i konkrétní variantu.
 */
export function getBundleStock(
  product: Product,
  stockOf: (slug: string) => number,
): number {
  if (!product.bundle || product.bundle.length === 0) return 0;

  let limit = Infinity;
  for (const part of product.bundle) {
    const perSet = Math.max(1, Math.floor(part.quantity));
    limit = Math.min(limit, Math.floor(stockOf(part.slug) / perSet));
  }
  return Number.isFinite(limit) ? Math.max(0, limit) : 0;
}

/**
 * Rozpad setu na skutečné skladové položky — set sám žádné skladové pole nemá.
 * Vrací dvojice slug + celkové množství pro `count` kusů setu.
 * Produkt, který set není, vrátí sám sebe (volající tak nemusí větvit).
 */
export function expandBundle(slug: string, count: number): BundleItem[] {
  const product = getProductBySlug(slug);
  if (!product?.bundle || product.bundle.length === 0) {
    return [{ slug, quantity: count }];
  }
  return product.bundle.map((part) => ({
    slug: part.slug,
    quantity: part.quantity * count,
  }));
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  if (product.related && product.related.length > 0) {
    const related = product.related
      .map(slug => products.find(p => p.slug === slug))
      .filter(Boolean) as Product[];
    if (related.length > 0) return related.slice(0, limit);
  }
  return products
    .filter((p) => p.slug !== product.slug && p.categories.some((c) => product.categories.includes(c)))
    .slice(0, limit);
}

// ─── Helper pro získání názvu produktu podle jazyka ──
// ─── Lokalizace katalogu ────────────────────────────
// Všechny tři funkce padají zpět na češtinu, když překlad chybí — radši
// česky než prázdno. Nový produkt tak jde přidat bez překladů a doplnit je
// později, aniž by se web rozbil.

export function getProductName(product: Product, locale: string): string {
  if (locale === "en" && product.name_en) return product.name_en;
  if (locale === "sk" && product.name_sk) return product.name_sk;
  return product.name;
}

export function getProductDescription(product: Product, locale: string): string {
  if (locale === "en" && product.description_en) return product.description_en;
  if (locale === "sk" && product.description_sk) return product.description_sk;
  return product.description;
}

export function getCategoryName(category: Category, locale: string): string {
  if (locale === "en" && category.name_en) return category.name_en;
  if (locale === "sk" && category.name_sk) return category.name_sk;
  return category.name;
}