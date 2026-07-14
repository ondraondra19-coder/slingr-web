// lib/stock.ts
// Skladovost uložená v Upstash Redis — spravovaná přímo z admin panelu.
import { getRedis } from "./redis";

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

export async function getStockMap(): Promise<StockMap> {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  cache = await fetchFromRedis();
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

// ── Zápis skladu z admin panelu ──────────────────────────────────────────────

export async function setStock(key: StockKey, value: number): Promise<void> {
  const redis = getRedis();
  const field = makeKey(key.slug, key.color, key.size);
  const safeValue = Math.max(0, Math.floor(value));
  await redis.hset(HASH_KEY, { [field]: safeValue });

  if (cache) cache.set(field, safeValue);
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
    const field = makeKey(key.slug, key.color, key.size);
    fields[field] = Math.max(0, Math.floor(value));
  }

  await redis.hset(HASH_KEY, fields);

  if (cache) {
    for (const [field, value] of Object.entries(fields)) {
      cache.set(field, value);
    }
  }
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

export async function deductStockForItems(
  items: StockDeductionItem[],
): Promise<{ ok: true } | { ok: false; insufficientFields: string[] }> {
  const redis = getRedis();

  // Sečteme všechny odečty do jednoho pole (klíč se může u vrstvených barev
  // opakovat napříč položkami, nebo dokonce v rámci jedné položky sdílet
  // barvu s jinou — proto agregujeme přes Map, ne jen naivně pushujeme).
  const totals = new Map<string, number>();

  for (const item of items) {
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