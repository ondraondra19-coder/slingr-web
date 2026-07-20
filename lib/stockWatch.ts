// lib/stockWatch.ts
// "Připomenout, až bude skladem" — zájemci čekající na naskladnění konkrétní
// varianty. Uložené v Upstash Redis, stejný vzor jako lib/messages.ts.
//
// Proč tady není žádný cron: sklad žije v Redisu a zapisuje ho VÝHRADNĚ náš
// vlastní kód (setStock / setStockBulk / restockItems v lib/stock.ts). Přechod
// 0 → N tedy umíme zachytit přímo v místě zápisu a poslat mail hned, místo
// abychom sklad periodicky obcházeli a ptali se, jestli se něco nezměnilo.
//
// Závislosti drží jedním směrem: lib/stock.ts importuje tenhle soubor, ne
// naopak. Detekci přechodu 0 → N proto dělá stock.ts (jen on zná staré i nové
// hodnoty) a tenhle modul řeší jen ULOŽENÍ čekatelů a odeslání mailu — jinak by
// vznikl kruhový import stock → stockWatch → stock.
import { createHash } from "crypto";
import { getRedis } from "./redis";
import { getProductBySlug } from "./products";
import { isValidEmail } from "./emailValidation";
import { sendBackInStockEmail } from "./email";

export type StockWatcher = {
  id: string;
  email: string;
  slug: string;
  // Plné klíče skladu ("slug|color|size") — u vrstvených barev (tělo+hlavička)
  // jich je víc a mail smí odejít, teprve až mají VŠECHNY sklad > 0.
  fields: string[];
  date: string; // ISO
};

const watcherKey = (id: string) => `stockwatch:w:${id}`;
const fieldKey = (field: string) => `stockwatch:f:${field}`;

// Po 90 dnech čekání zájem nejspíš vyprchal a e-mail bychom posílali někomu,
// kdo si na formulář dávno nevzpomene. TTL zároveň drží klíče v Redisu
// zametené — nemusíme nic uklízet ručně.
const WATCHER_TTL_SECONDS = 90 * 24 * 60 * 60;

// Strop na jednu variantu — pojistka proti zaplavení klíče. Rate limiting na
// úrovni IP řeší API route, tohle je druhá obranná linie.
const MAX_WATCHERS_PER_FIELD = 5000;

// Stejný e-mail na stejnou variantu = stejné ID, takže opakované odeslání
// formuláře jen přepíše původní záznam místo vytvoření duplicity (a zákazník
// nedostane po naskladnění dva maily).
function watcherId(email: string, fields: string[]): string {
  const normalized = `${email.trim().toLowerCase()}|${[...fields].sort().join(",")}`;
  return createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}

export function isValidWatchEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.trim().length > 0 &&
    email.trim().length <= 150 &&
    isValidEmail(email.trim())
  );
}

// ── Zápis ───────────────────────────────────────────────────────────────────

export async function addWatcher(input: {
  email: string;
  slug: string;
  fields: string[];
}): Promise<StockWatcher> {
  const redis = getRedis();
  const email = input.email.trim();
  const fields = [...new Set(input.fields)]; // stejná barva u těla i hlavičky = jeden klíč
  const id = watcherId(email, fields);

  const watcher: StockWatcher = {
    id,
    email,
    slug: input.slug,
    fields,
    date: new Date().toISOString(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(watcherKey(id), JSON.stringify(watcher), { ex: WATCHER_TTL_SECONDS });
  for (const field of fields) {
    pipeline.sadd(fieldKey(field), id);
    pipeline.expire(fieldKey(field), WATCHER_TTL_SECONDS);
  }
  await pipeline.exec();

  // Ořez až po zápisu: chceme znát skutečnou velikost, ne ji odhadovat. Když
  // je varianta přeplněná, nový záznam radši zase odebereme — je lepší jednomu
  // člověku mail neposlat než nechat klíč růst bez omezení.
  for (const field of fields) {
    const size = await redis.scard(fieldKey(field));
    if (size > MAX_WATCHERS_PER_FIELD) {
      await redis.srem(fieldKey(field), id);
    }
  }

  return watcher;
}

// ── Čtení ───────────────────────────────────────────────────────────────────

// Čekatelé, kterých se dotýká kterýkoli z předaných klíčů skladu. Vrací i ty,
// jejichž DALŠÍ klíče zatím skladem nejsou — filtrování je na volajícím
// (lib/stock.ts), protože jen on má aktuální mapu skladu.
export async function getWatchersForFields(fields: string[]): Promise<StockWatcher[]> {
  if (fields.length === 0) return [];
  const redis = getRedis();

  const pipeline = redis.pipeline();
  for (const field of fields) pipeline.smembers(fieldKey(field));
  const idLists = (await pipeline.exec()) as unknown as string[][];

  const ids = [...new Set(idLists.flat().filter(Boolean))];
  if (ids.length === 0) return [];

  const raw = await redis.mget<(string | StockWatcher | null)[]>(...ids.map(watcherKey));

  const watchers: StockWatcher[] = [];
  raw.forEach((item) => {
    // Prázdná hodnota = záznam vypršel (TTL). ID může chvíli přežívat v indexu
    // varianty, ale ten má TTL taky, takže se uklidí sám — nic tu neřešíme.
    if (!item) return;
    try {
      const parsed: StockWatcher = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed?.email && Array.isArray(parsed.fields)) watchers.push(parsed);
    } catch {
      // Poškozený záznam tiše přeskočíme, ať kvůli němu nespadne naskladnění.
    }
  });

  return watchers;
}

// ── Odeslání + úklid ────────────────────────────────────────────────────────

// Pošle mail a záznam smaže. Mazání jde PŘED odesláním: kdyby route spadla
// mezi tím, je lepší mail neposlat než ho poslat opakovaně při každém dalším
// zápisu skladu. Vrací počet skutečně odeslaných mailů.
export async function notifyAndRemove(watchers: StockWatcher[]): Promise<number> {
  if (watchers.length === 0) return 0;
  const redis = getRedis();

  const pipeline = redis.pipeline();
  for (const w of watchers) {
    pipeline.del(watcherKey(w.id));
    for (const field of w.fields) pipeline.srem(fieldKey(field), w.id);
  }
  await pipeline.exec();

  let sent = 0;
  for (const w of watchers) {
    const product = getProductBySlug(w.slug);
    if (!product) continue; // produkt mezitím zmizel z katalogu — mail nedává smysl
    const ok = await sendBackInStockEmail({
      to: w.email,
      productName: product.name,
      slug: w.slug,
    });
    if (ok) sent++;
  }
  return sent;
}
