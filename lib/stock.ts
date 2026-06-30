// lib/stock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets skladovost — live sync (Zabezpečená verze)
// ─────────────────────────────────────────────────────────────────────────────

export type StockKey = {
  slug: string;
  color?: string; 
  size?: string;  
};

export type StockMap = Map<string, number>;

// Cache — POZOR: Na Vercelu (Serverless) se tato cache bude chovat nepředvídatelně.
// Next.js fetch cache (revalidate) je spolehlivější řešení.
let cache: StockMap | null = null;
let cacheTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 min

function makeKey(slug: string, color?: string, size?: string): string {
  return `${slug}|${color ?? "-"}|${size ?? "-"}`;
}

async function fetchFromSheets(): Promise<StockMap> {
  // 1. OBRANA: Kontrola, zda klíče v .env.local vůbec existují
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

  if (!SHEET_ID || !API_KEY) {
    console.error("❌ CHYBÍ API KLÍČE PRO GOOGLE SHEETS V .ENV.LOCAL");
    return new Map(); // Vrátíme prázdnou mapu, aby web nespadl
  }

  const RANGE = "Sklad!A2:D"; 
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 180 }, // Next.js revalidace (3 minuty)
    });

    if (!res.ok) {
      console.error(`Google Sheets API error: ${res.status} ${res.statusText}`);
      return new Map();
    }

    const json = await res.json();
    const rows: string[][] = json.values ?? [];
    const map: StockMap = new Map();

    for (const [slug, color, size, stockStr] of rows) {
      if (!slug || !stockStr) continue;
      const stock = parseInt(stockStr, 10);
      if (isNaN(stock)) continue;
      
      const key = makeKey(
        slug.trim(),
        color?.trim() === "-" ? undefined : color?.trim(),
        size?.trim() === "-" ? undefined : size?.trim(),
      );
      map.set(key, stock);
    }

    return map;
  } catch (error) {
    console.error("❌ Chyba při fetchování skladu:", error);
    return new Map();
  }
}

// Ostatní funkce (getStockMap, getStock, getProductStock, lookupStock) 
// zůstávají beze změny, protože už pracují s výslednou Mapou.

export async function getStockMap(): Promise<StockMap> {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  cache = await fetchFromSheets();
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