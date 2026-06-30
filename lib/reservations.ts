// lib/reservations.ts
// ─────────────────────────────────────────────────────────────────────────────
// Dočasné rezervace skladu — "Marek si dal 2ks do košíku, ostatní to vidí
// jako nedostupné dalších 20 minut, pak se to samo uvolní zpět."
//
// Backend: Upstash Redis (přes Vercel integraci, balíček @upstash/redis).
// TTL = Redis smaže klíč sám po čase, žádný cron job není potřeba.
//
// Klíč: reservation:{slug}:{variantKey}:{sessionId}
// Hodnota: { quantity, expiresAt }
// ─────────────────────────────────────────────────────────────────────────────

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const RESERVATION_TTL_SECONDS = 20 * 60; // 20 minut

function makeKey(slug: string, variantKey: string, sessionId: string): string {
  return `reservation:${slug}:${variantKey}:${sessionId}`;
}

// Prefix pro vyhledání VŠECH rezervací dané varianty (napříč uživateli)
function makePrefix(slug: string, variantKey: string): string {
  return `reservation:${slug}:${variantKey}:`;
}

export type ReservationEntry = {
  quantity: number;
  expiresAt: number; // unix ms, jen informativní — Redis TTL dělá skutečnou práci
};

/**
 * Vytvoří/aktualizuje rezervaci pro daného uživatele (sessionId) a danou
 * variantu produktu. Voláno při addItem do košíku.
 */
export async function reserveStock(
  slug: string,
  variantKey: string,
  sessionId: string,
  quantity: number,
): Promise<void> {
  const key = makeKey(slug, variantKey, sessionId);
  const entry: ReservationEntry = {
    quantity,
    expiresAt: Date.now() + RESERVATION_TTL_SECONDS * 1000,
  };
  await redis.set(key, entry, { ex: RESERVATION_TTL_SECONDS });
}

/**
 * Smaže rezervaci — voláno při odebrání z košíku, snížení množství na 0,
 * nebo po úspěšném dokončení objednávky (sklad se reálně sníží jinde).
 */
export async function releaseStock(
  slug: string,
  variantKey: string,
  sessionId: string,
): Promise<void> {
  const key = makeKey(slug, variantKey, sessionId);
  await redis.del(key);
}

/**
 * Vrátí součet všech AKTIVNÍCH rezervací pro danou variantu, volitelně
 * s vyloučením vlastní session (aby si Marek neviděl svoji rezervaci
 * jako "cizí" nedostupnost).
 */
export async function getReservedQuantity(
  slug: string,
  variantKey: string,
  excludeSessionId?: string,
): Promise<number> {
  const prefix = makePrefix(slug, variantKey);
  const keys = await redis.keys(`${prefix}*`);

  if (keys.length === 0) return 0;

  let total = 0;
  for (const key of keys) {
    if (excludeSessionId && key === makeKey(slug, variantKey, excludeSessionId)) {
      continue; // vlastní rezervaci nepočítáme do "zabráno ostatními"
    }
    const entry = await redis.get<ReservationEntry>(key);
    if (entry) total += entry.quantity;
  }
  return total;
}

/**
 * Vrátí mou vlastní aktuální rezervaci pro danou variantu (kolik už mám
 * v košíku z pohledu rezervačního systému).
 */
export async function getMyReservation(
  slug: string,
  variantKey: string,
  sessionId: string,
): Promise<number> {
  const key = makeKey(slug, variantKey, sessionId);
  const entry = await redis.get<ReservationEntry>(key);
  return entry?.quantity ?? 0;
}