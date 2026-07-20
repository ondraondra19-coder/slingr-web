// ─── Typy ───────────────────────────────────────────

export type Variant = {
  label: string;
  value: string;
};

export type ModelColor = {
  label: string;
  value: string;
  img: string;
  hex?: string;
};

export type ModelColorLayered = {
  label: string;
  value: string;
  body: string;
  cap: string;
  hex?: string;
};

export type PriceValue = number | { CZK: number; EUR?: number; USD?: number };

export type ProductModel = {
  id: string;
  label: string;
  price: PriceValue;
  colors: ModelColor[] | ModelColorLayered[];
  layered?: boolean;
  comboExtra?: PriceValue;
  // Doplněno za běhu vrstvou slev (lib/productDiscounts.ts). Když je na modelu
  // sleva, `price` už drží zlevněnou cenu, `originalPrice` je cena před slevou
  // (přeškrtnutá) a `discountPercent` je zaokrouhlené procento pro odznak.
  originalPrice?: PriceValue;
  discountPercent?: number;
};

export type MediaItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster?: string };

export type ProductColor = {
  label: string;
  value: string;
  hex?: string;
  img?: string;
};

export type ProductSize = {
  label: string;
  value: string;
};

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
  colors?: ProductColor[];
  sizes?: ProductSize[];
  sizesLabel?: string;
  media?: MediaItem[];
  variants?: {
    type: string;
    options: Variant[];
  }[];
  models?: ProductModel[];
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
    name: "Prak SLINGR X1",
    price: { CZK: 499 },
    categories: ["zbrane"],
    img: "/images/products/prak-x1/main.png",
    description:
      "Lehký a odolný prak, který zvládne celé odpoledne přestřelek. Pohodlný úchop padne do dětské i dospělácké ruky a pružná guma pošle měkkou munici pěkně daleko. Střílí vodní balónky i měkké míčky — vyber si munici podle nálady a vyraz do akce.",
    inStock: true,
    stock: 0,
    tags: ["prak", "zbraň", "slingr", "střílení", "venku", "hračka", "děti", "vodní balónky", "míčky"],
    related: ["micky-do-praku", "vodni-balonky", "terc"],
  },
  {
    slug: "micky-do-praku",
    name: "Míčky do praku SLINGR",
    price: { CZK: 149 },
    categories: ["munice"],
    img: "/images/products/micky/main.png",
    description:
      "Balení náhradních míčků do praku SLINGR. Měkké, lehké a barevné — dost velké na přesný zásah, ale šetrné, takže nikoho nebolí. Ideální doplněk, ať ti uprostřed bitvy nedojde munice.",
    inStock: true,
    stock: 0,
    tags: ["míčky", "munice", "náboje", "prak", "slingr", "náhradní", "kuličky"],
    related: ["prak-x1", "vodni-balonky", "terc"],
  },
  {
    slug: "vodni-balonky",
    name: "Vodní balónky SLINGR",
    price: { CZK: 99 },
    categories: ["munice"],
    img: "/images/products/vodni-balonky/main.png",
    description:
      "Sada vodních balónků pro horké letní bitvy. Rychle se plní, pořádně stříkají a při zásahu neškodně prasknou. Nabij prak, zamiř na kámoše a rozjeď vodní válku na zahradě.",
    inStock: true,
    stock: 0,
    tags: ["vodní balónky", "balónky", "munice", "voda", "léto", "prak", "slingr", "zahrada"],
    related: ["prak-x1", "micky-do-praku", "terc"],
  },
  {
    slug: "terc",
    name: "Terč SLINGR",
    price: { CZK: 249 },
    categories: ["prislusenstvi"],
    img: "/images/products/terc/main.png",
    description:
      "Skládací terč pro trénink přesnosti i dlouhé souboje o nejvyšší skóre. Postav ho na dvorek, trefuj se do zón a zjisti, kdo má nejlepší mušku. Skvělý parťák k praku i pro sólo střelbu.",
    inStock: true,
    stock: 0,
    tags: ["terč", "příslušenství", "trénink", "přesnost", "prak", "slingr", "cíl", "skóre"],
    related: ["prak-x1", "micky-do-praku", "penove-plechovky"],
  },
  {
    slug: "penove-plechovky",
    name: "Pěnové plechovky SLINGR",
    price: { CZK: 349 },
    categories: ["prislusenstvi"],
    img: "/images/products/penove-plechovky/main.png",
    description:
      "Sada lehkých pěnových plechovek na sestřelení. Postav pyramidu, zamiř prakem a shoď je jednou ranou — a pak zase odznova. Měkká pěna nic nepoškrábe ani nerozbije, takže se dá střílet klidně na terase i v obýváku. Ideální na trénink mušky i na souboj o to, kdo srazí víc.",
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
    name: "Startovací set SLINGR",
    price: { CZK: 799 },
    categories: ["vyhodne-sety"],
    img: "/images/products/prak-x1/main.png",
    description:
      "Všechno, co potřebuješ na první bitvu, v jednom balení. Prak, náhradní míčky a skládací terč — stačí vybalit a jde se střílet. Nejlevnější způsob, jak začít: dohromady ušetříš skoro stovku oproti nákupu po kusech.",
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
    price: { CZK: 599 },
    categories: ["vyhodne-sety"],
    img: "/images/products/vodni-balonky/main.png",
    description:
      "Letní balíček na horké dny. Prak a dvojitá zásoba vodních balónků, ať ti munice nedojde uprostřed války na zahradě. Nabij, zamiř, střílej — a pak znovu, dokud nejste všichni mokří.",
    inStock: true,
    stock: 0,
    tags: ["set", "balíček", "výhodný", "voda", "vodní balónky", "léto", "prak", "zahrada", "bitva"],
    related: ["set-startovaci", "vodni-balonky", "prak-x1"],
    bundle: [
      { slug: "prak-x1", quantity: 1 },
      { slug: "vodni-balonky", quantity: 2 },
    ],
  },
  {
    slug: "set-duel",
    name: "Set Duel pro dva",
    price: { CZK: 1349 },
    categories: ["vyhodne-sety"],
    img: "/images/products/prak-x1/main.png",
    description:
      "Dva praky, dvojitá munice a jeden terč — souboj může začít. Ideální pro sourozence, kamarády nebo rodiče proti dítěti. Každý má svůj prak, takže se nikdo nemusí střídat a čekat.",
    inStock: true,
    stock: 0,
    tags: ["set", "balíček", "výhodný", "duel", "dva hráči", "souboj", "prak", "míčky", "terč", "dárek"],
    related: ["set-startovaci", "set-arzenal", "prak-x1"],
    bundle: [
      { slug: "prak-x1", quantity: 2 },
      { slug: "micky-do-praku", quantity: 2 },
      { slug: "terc", quantity: 1 },
    ],
  },
  {
    slug: "set-arzenal",
    name: "Set Kompletní arzenál",
    price: { CZK: 1149 },
    categories: ["vyhodne-sety"],
    img: "/images/products/terc/main.png",
    description:
      "Úplně všechno z naší nabídky v jednom balení. Prak, míčky, vodní balónky, terč i pěnové plechovky — na trénink mušky, na vodní válku i na souboj o nejvyšší skóre. Kdo chce mít doma kompletní výbavu, bere tenhle.",
    inStock: true,
    stock: 0,
    tags: ["set", "balíček", "výhodný", "kompletní", "arzenál", "všechno", "prak", "munice", "terč", "plechovky", "dárek"],
    related: ["set-duel", "set-startovaci", "penove-plechovky"],
    bundle: [
      { slug: "prak-x1", quantity: 1 },
      { slug: "micky-do-praku", quantity: 1 },
      { slug: "vodni-balonky", quantity: 1 },
      { slug: "terc", quantity: 1 },
      { slug: "penove-plechovky", quantity: 1 },
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

// Vyjmenuje všechny prodejné varianty produktu (barva/velikost/model,
// včetně vrstvených barev tělo+hlavička) — používá se pro editaci skladu
// v adminu (ProductsAdminList) i pro přehled nízkého skladu na dashboardu.
// Stock klíč pro danou kombinaci je `${product.slug}|${c.color ?? "-"}|${c.size ?? "-"}`
// (stejný formát jako lib/stock.ts:makeKey).
export type ProductCombination = {
  color?: string;
  size?: string;
};

export function getProductCombinations(product: Product): ProductCombination[] {
  const combos: ProductCombination[] = [];

  if (product.models && product.models.length > 0) {
    product.models.forEach((model) => {
      if (model.colors && model.colors.length > 0) {
        model.colors.forEach((color) => {
          if (model.layered) {
            combos.push({ color: `${color.value}__body`, size: model.id });
            combos.push({ color: `${color.value}__cap`, size: model.id });
          } else {
            combos.push({ color: color.value, size: model.id });
          }
        });
      } else {
        combos.push({ size: model.id });
      }
    });
  } else {
    const hasColors = product.colors && product.colors.length > 0;
    const hasSizes = product.sizes && product.sizes.length > 0;

    if (hasColors && hasSizes) {
      product.colors!.forEach((color) => {
        product.sizes!.forEach((size) => {
          combos.push({ color: color.value, size: size.value });
        });
      });
    } else if (hasColors) {
      product.colors!.forEach((color) => {
        combos.push({ color: color.value });
      });
    } else if (hasSizes) {
      product.sizes!.forEach((size) => {
        combos.push({ size: size.value });
      });
    } else {
      combos.push({});
    }
  }

  return combos;
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