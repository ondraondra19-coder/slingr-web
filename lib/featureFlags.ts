// lib/featureFlags.ts
//
// ── HLAVNÍ VYPÍNAČ PLATEB ────────────────────────────────────────────────────
// `false` = obchod jde procházet a zboží se dá dávat do košíku, ale objednávku
// nikdo nedokončí a nic nezaplatí. `true` = normální provoz.
//
// Na co to je: než spustíš web naostro, a pak kdykoliv, když potřebuješ na
// chvíli zavřít krám (opravy, dovolená, došlo zboží).
//
// Kontroluje se i na serveru (/api/checkout a /api/orders), ne jen v tlačítkách —
// samotné schované tlačítko by šlo obejít přímým voláním API.
//
// Po přepnutí je potřeba web nasadit znovu (Vercel deploy), aby se změna
// projevila i v prohlížeči zákazníka.
export const PLATBY_ZAPNUTE = false;

export function arePaymentsEnabled(): boolean {
  return PLATBY_ZAPNUTE;
}

// Bankovní převod je dočasně vypnutý V PRODUKCI, dokud není hotová právně
// korektní účtenka (chybí IČO — viz sellerBlock() v lib/email.ts) — nechceme
// posílat reálným zákazníkům "přehled objednávky", co by měl být doklad, ale
// není. V lokálním vývoji (npm run dev, NODE_ENV=development) zůstává vždy
// zapnutý, ať se dá dodělávat a testovat naplno.
//
// Zpátky zapnout v produkci: nastavit NEXT_PUBLIC_ENABLE_BANK_TRANSFER=true
// na Vercelu a redeploy — není potřeba měnit kód.
export function isBankTransferEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_ENABLE_BANK_TRANSFER === "true";
}

// Magazín (SEO články) je dočasně skrytý z veřejné části webu, dokud nebude
// nový obsah — staré články z původního techshopu nechceme ukazovat. Skrývá
// se HOMEPAGE náhled, stránka /blog i jednotlivé články a odkaz v patičce.
// Data v Redisu i editace v admin panelu zůstávají netknuté — až budou nové
// články hotové, magazín se zapne bez zásahu do kódu.
//
// Na rozdíl od bankovního převodu je vypnutý i ve vývoji, ať je demo čisté
// bez ohledu na to, kde běží. Chceš-li magazín zobrazit (lokálně i v produkci):
// nastav NEXT_PUBLIC_ENABLE_MAGAZINE=true (v .env.local nebo na Vercelu) a redeploy.
export function isMagazineEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MAGAZINE === "true";
}
