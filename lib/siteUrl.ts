// lib/siteUrl.ts
// JEDINÉ místo, kde se určuje veřejná adresa e-shopu. Používá ji mapa webu
// pro Google (app/sitemap.ts), robots.txt, odkazy v transakčních e-mailech
// a náhledy při sdílení odkazu (metadataBase v app/layout.tsx).
//
// Až bude ostrá doména, nastav NEXT_PUBLIC_SITE_URL (v .env.local i ve
// Vercelu) — do kódu se sahat nemusí.
//
// ── POZOR na `??` ───────────────────────────────────────────────────────────
// Dřív si tuhle adresu počítal každý soubor sám, zápisem
//   process.env.NEXT_PUBLIC_SITE_URL ?? "https://slingr.vercel.app"
// To vypadá správně, ale `??` zaskočí jen za `undefined` — ne za PRÁZDNOU
// hodnotu. A řádek `NEXT_PUBLIC_SITE_URL=` v .env.local (bez hodnoty za
// rovnítkem) dává prázdný řetězec, ne `undefined`. Záloha se tedy nikdy
// nepoužila a ze SITE_URL zbylo "".
//
// Dopad: odkazy v sitemapě i v e-mailech vycházely bez domény —
// "/produkt/prak-x1" místo "https://slingr.cz/produkt/prak-x1".
//
// Proto se tady prázdná hodnota bere jako chybějící: `.trim()` odstraní
// i omylem zapsanou mezeru a `||` zaskočí za cokoliv prázdného.

/** Adresa, která se použije, dokud není nastavená vlastní doména. */
const FALLBACK_URL = "https://slingr.vercel.app";

/** Veřejná adresa e-shopu, vždy bez lomítka na konci. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_URL
).replace(/\/$/, "");
