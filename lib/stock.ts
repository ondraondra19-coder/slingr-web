// lib/stock.ts
// Skladovost uložená v Upstash Redis — spravovaná přímo z admin panelu.
//
// SETY: produkt s vyplněným `bundle` (viz lib/products.ts) vlastní skladové
// pole v Redisu NEMÁ. Jeho dostupnost se dopočítá z komponent a do mapy se
// vloží jako virtuální pole `set-slug|-|-` — díky tomu všechna čtecí místa
// (homepage, kategorie, detail produktu, /api/stock, košík, admin) vidí set
// jako běžný produkt se skladem a nemusela se kvůli setům měnit.
// Zápis jde opačnou cestou: sklad setu se ukládat nedá (setStock ho odmítne)
// a objednaný set se při odečtu rozpadne na komponenty.
import { getRedis } from "./redis";
import { getWatchersForFields, notifyAndRemove } from "./stockWatch";
import { bundles, getBundleStock, getProductBySlug, isBundle, expandBundle } from "./products";

export type StockKey = {
  slug: string;
  color?: string;
  size?: string;
};

export type StockMap = Map<string, number>;

const HASH_KEY = "stock:map";

// Cache — krátké vyhlazení v rámci jedné serverless instance. Na Vercelu se
// mezi jednotlivými invokacemi spolehnout nedá, ale v rámci jednoho běhu pomůže.
let cache: StockMap | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30s

export function makeKey(slug: string, color?: string, size?: string): string {
  return `${slug}|${color ?? "-"}|${size ?? "-"}`;
}

async function fetchFromRedis(): Promise<StockMap> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, number | string>>(HASH_KEY);
  const map: StockMap = new Map();
  if (!raw) return map;

  for (const [key, value] of Object.entries(raw)) {
    const num = typeof value === "number" ? value : parseInt(String(value), 10);
    if (!isNaN(num)) map.set(key, num);
  }
  return map;
}

/**
 * Doplní do mapy virtuální skladová pole setů, dopočítaná z komponent.
 *
 * Komponenta se hledá pod svým bezvariantním klíčem `slug|-|-`. Kdyby někdy
 * do setu šel produkt s barvami/velikostmi, vyjde tenhle lookup na 0 a set se
 * bude tvářit jako vyprodaný — tedy raději neprodáme, než abychom slíbili
 * kombinaci, kterou nemáme. V takovou chvíli musí `bundle` nést i variantu.
 */
function withBundleStock(map: StockMap): StockMap {
  for (const bundle of bundles) {
    const available = getBundleStock(bundle, (slug) => map.get(makeKey(slug)) ?? 0);
    map.set(makeKey(bundle.slug), available);
  }
  return map;
}

export async function getStockMap(): Promise<StockMap> {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  cache = withBundleStock(await fetchFromRedis());
  cacheTime = now;
  return cache;
}

export async function getStock(key: StockKey): Promise<number> {
  const map = await getStockMap();
  return map.get(makeKey(key.slug, key.color, key.size)) ?? 0;
}

export async function getProductStock(slug: string): Promise<Record<string, number>> {
  const map = await getStockMap();
  const result: Record<string, number> = {};

  for (const [key, stock] of map.entries()) {
    const [keySlug, color, size] = key.split("|");
    if (keySlug === slug) {
      result[`${color}|${size}`] = stock;
    }
  }

  return result;
}

export function lookupStock(
  stockData: Record<string, number>,
  color?: string,
  size?: string,
): number {
  const key = `${color ?? "-"}|${size ?? "-"}`;
  return stockData[key] ?? 0;
}

// ── Naskladnění → e-mail čekatelům ──────────────────────────────────────────
// Volá se po každém zápisu, který mohl poslat pole z nuly nahoru. Zájemce
// nasbíral formulář "Připomenout, až bude skladem" (viz lib/stockWatch.ts).
//
// Odeslání NIKDY nesmí shodit samotný zápis skladu — admin ukládá sklad a je
// mu jedno, že Resend má výpadek. Proto je celé tělo v try/catch a chyba se jen
// zaloguje, stejně jako to dělá lib/email.ts.
async function notifyRestocked(restockedFields: string[]): Promise<void> {
  if (restockedFields.length === 0) return;

  try {
    const watchers = await getWatchersForFields(restockedFields);
    if (watchers.length === 0) return;

    // Čerstvá mapa skladu — u vrstvených barev čeká zájemce na DVĚ pole
    // (tělo + hlavička) a mail smí odejít, až mají sklad obě. Naskladnění
    // jednoho z nich kombinaci pořád nezpřístupní.
    const map = await fetchFromRedis();
    const ready = watchers.filter((w) => w.fields.every((f) => (map.get(f) ?? 0) > 0));

    await notifyAndRemove(ready);
  } catch (err) {
    console.error("Odeslání e-mailů o naskladnění selhalo:", err);
  }
}

// ── Zápis skladu z admin panelu ──────────────────────────────────────────────

/** Sklad setu je dopočítaný z komponent — uložit ho nejde. */
function isBundleSlug(slug: string): boolean {
  const product = getProductBySlug(slug);
  return !!product && isBundle(product);
}

export async function setStock(key: StockKey, value: number): Promise<void> {
  if (isBundleSlug(key.slug)) {
    console.warn(`Sklad setu ${key.slug} se neukládá — dopočítává se z komponent.`);
    return;
  }

  const redis = getRedis();
  const field = makeKey(key.slug, key.color, key.size);
  const safeValue = Math.max(0, Math.floor(value));

  // Starou hodnotu potřebujeme kvůli rozpoznání přechodu 0 → N. Prosté
  // "hodnota je > 0" by mail poslalo při KAŽDÉM uložení skladu, tedy i když
  // admin jen upraví 5 na 6.
  const previous = Number(await redis.hget<number | string>(HASH_KEY, field)) || 0;

  await redis.hset(HASH_KEY, { [field]: safeValue });

  // Celá cache pryč, ne jen dotčené pole: změna komponenty mění i dopočítaný
  // sklad každého setu, který ji obsahuje.
  cache = null;

  if (previous === 0 && safeValue > 0) await notifyRestocked([field]);
}

// Hromadné uložení více variant najednou — jeden HSET požadavek do Redisu
// bez ohledu na to, kolik variant se změnilo.
export async function setStockBulk(
  entries: { key: StockKey; value: number }[],
): Promise<void> {
  if (entries.length === 0) return;

  const redis = getRedis();
  const fields: Record<string, number> = {};

  for (const { key, value } of entries) {
    if (isBundleSlug(key.slug)) continue; // sklad setu se nedopisuje, dopočítá se
    const field = makeKey(key.slug, key.color, key.size);
    fields[field] = Math.max(0, Math.floor(value));
  }

  const names = Object.keys(fields);
  if (names.length === 0) return;

  // Staré hodnoty jedním HMGET — kvůli rozpoznání přechodu 0 → N, viz setStock.
  const previous = await redis.hmget<Record<string, number | string>>(HASH_KEY, ...names);

  await redis.hset(HASH_KEY, fields);

  // Viz setStock — dopočítaný sklad setů se mohl posunout, cache musí pryč celá.
  cache = null;

  const restocked = names.filter(
    (field) => (Number(previous?.[field]) || 0) === 0 && fields[field] > 0,
  );
  await notifyRestocked(restocked);
}

// ── Automatický odečet při dokončené objednávce ─────────────────────────────
// Vstup: slug produktu, jeho stockKey ("color|size", nebo dvojice u vrstvených
// barev tělo+hlavička) a objednané množství. Odečet je ATOMICKÝ a "všechno nebo
// nic": Lua skript nejdřív ověří, že KAŽDÁ položka má dost skladu, a teprve pak
// odečte — takže při dvou objednávkách naráz o poslední kus nemůže sklad spadnout
// pod nulu (přeprodání). Když nestačí, nic se neodečte a vrátí se seznam
// nedostatkových polí, aby volající mohl objednávku odmítnout / označit.
export type StockDeductionItem = {
  slug: string;
  quantity: number;
  stockKey?: string | string[]; // "color|size" — stejný formát jako CartItem.stockKey
};

/**
 * Nahradí objednané sety jejich komponentami. Set žádné skladové pole nemá,
 * takže bez tohohle kroku by se odečet pokusil sáhnout na `set-slug|-|-`,
 * našel by nulu a objednávku by označil jako nedostatkovou.
 *
 * Množství se násobí: 2 ks setu, který obsahuje 2 balení míčků, odečtou 4
 * balení. Komponenty dnes varianty nemají, proto pevný klíč "-|-".
 */
function expandBundlesForStock(items: StockDeductionItem[]): StockDeductionItem[] {
  const expanded: StockDeductionItem[] = [];

  for (const item of items) {
    if (!isBundleSlug(item.slug)) {
      expanded.push(item);
      continue;
    }
    for (const part of expandBundle(item.slug, item.quantity)) {
      expanded.push({ slug: part.slug, quantity: part.quantity, stockKey: "-|-" });
    }
  }

  return expanded;
}

// Atomický check-and-decrement: buď mají všechna pole dost skladu a všechna se
// odečtou, nebo se nesáhne na nic a vrátí se seznam nedostatkových polí.
const DEDUCT_SCRIPT = `
local hashKey = KEYS[1]
local numPairs = #ARGV / 2
local insufficient = {}
for i = 1, numPairs do
  local field = ARGV[(i - 1) * 2 + 1]
  local amount = tonumber(ARGV[(i - 1) * 2 + 2])
  local current = tonumber(redis.call('HGET', hashKey, field) or '0')
  if current < amount then
    table.insert(insufficient, field)
  end
end
if #insufficient > 0 then
  return insufficient
end
for i = 1, numPairs do
  local field = ARGV[(i - 1) * 2 + 1]
  local amount = tonumber(ARGV[(i - 1) * 2 + 2])
  redis.call('HINCRBY', hashKey, field, -amount)
end
return {}
`;

// Opak deductStockForItems — vrátí kusy zpět na sklad (zrušená objednávka).
// Na rozdíl od odečtu tu není potřeba atomický Lua check-and-decrement: sčítání
// zpátky nemůže sklad poslat do záporu, takže stačí prosté HINCRBY v pipeline.
export async function restockItems(items: StockDeductionItem[]): Promise<void> {
  const redis = getRedis();
  const totals = new Map<string, number>();

  for (const item of expandBundlesForStock(items)) {
    if (!item.stockKey) continue;
    const keys = Array.isArray(item.stockKey) ? item.stockKey : [item.stockKey];
    for (const keyPart of keys) {
      const field = `${item.slug}|${keyPart}`;
      totals.set(field, (totals.get(field) ?? 0) + item.quantity);
    }
  }

  if (totals.size === 0) return;

  const pipeline = redis.pipeline();
  const entries = [...totals.entries()];
  for (const [field, amount] of entries) {
    pipeline.hincrby(HASH_KEY, field, amount);
  }
  // HINCRBY vrací NOVOU hodnotu, takže starou dopočítáme odečtením přičteného
  // množství — druhé kolo čtení kvůli tomu není potřeba.
  const results = (await pipeline.exec()) as unknown as number[];

  cache = null;

  const restocked = entries
    .filter(([, amount], i) => {
      const after = Number(results?.[i]);
      return Number.isFinite(after) && after - amount === 0 && after > 0;
    })
    .map(([field]) => field);
  await notifyRestocked(restocked);
}

export async function deductStockForItems(
  items: StockDeductionItem[],
): Promise<{ ok: true } | { ok: false; insufficientFields: string[] }> {
  const redis = getRedis();

  // Sečteme všechny odečty do jednoho pole (klíč se může u vrstvených barev
  // opakovat napříč položkami, nebo dokonce v rámci jedné položky sdílet
  // barvu s jinou — proto agregujeme přes Map, ne jen naivně pushujeme).
  const totals = new Map<string, number>();

  for (const item of expandBundlesForStock(items)) {
    if (!item.stockKey) continue; // produkt bez variant nemá sklad podle klíče — nic neodečítáme
    const keys = Array.isArray(item.stockKey) ? item.stockKey : [item.stockKey];
    for (const keyPart of keys) {
      const field = `${item.slug}|${keyPart}`;
      totals.set(field, (totals.get(field) ?? 0) + item.quantity);
    }
  }

  if (totals.size === 0) return { ok: true };

  // Ploché pole [field1, amount1, field2, amount2, ...] pro ARGV skriptu.
  const args: string[] = [];
  for (const [field, amount] of totals.entries()) {
    args.push(field, String(amount));
  }

  const insufficientFields = await redis.eval<string[], string[]>(DEDUCT_SCRIPT, [HASH_KEY], args);

  if (insufficientFields.length > 0) {
    // Nic se neodečetlo — sklad je nedotčený, cache může zůstat.
    return { ok: false, insufficientFields };
  }

  // Odečet už atomicky proběhl. Cache invalidujeme celá (jednodušší a
  // bezpečnější než dopočítávat nové hodnoty ručně) — příští čtení si ji
  // znovu natáhne z Redisu.
  cache = null;
  return { ok: true };
}