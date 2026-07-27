// lib/recentSearches.ts
// Poslední hledání zákazníka — drží se jen v jeho prohlížeči (localStorage),
// nikam se neposílá. Ukazuje je overlay v prázdném stavu ("než začneš psát").
// Sdílené, ať jde stejný seznam plnit i ze stránky výsledků /hledani.

const KEY = "slingr-recent-searches";
const MAX = 6;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (q.length < 2 || typeof window === "undefined") return;
  try {
    // Case-insensitive deduplikace — nová verze jde na začátek.
    const list = getRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase());
    list.unshift(q);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // localStorage může být nedostupný (privátní režim) — hledání funguje dál.
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
