# SLINGR

E-shop s praky a outdoorovým battle vybavením. Next.js (App Router) +
TypeScript + Tailwind, data v Upstash Redis, platby přes Stripe, doprava
Zásilkovnou.

---

## Spuštění

```bash
npm install
cp .env.local.example .env.local   # a vyplnit klíče
npm run dev
```

Web běží na [http://localhost:3000](http://localhost:3000),
admin na [/admin](http://localhost:3000/admin).

Které proměnné jsou povinné a co se stane bez nich je popsané přímo
v `.env.local.example` — ten soubor je zároveň dokumentace, ne jen šablona.

---

## Struktura

| složka | co v ní je |
|---|---|
| `app/` | stránky (App Router) a API routy |
| `app/admin/` | administrace — objednávky, produkty, sklad, slevy, magazín |
| `components/` | sdílené klientské komponenty |
| `lib/` | doménová logika (produkty, sklad, slevy, e-maily, objednávky) |
| `messages/` | překlady cs / en / sk |
| `content/legal/` | obchodní podmínky, cookies, ochrana osobních údajů |
| `graphify-out/` | vygenerovaný znalostní graf projektu (viz CLAUDE.md) |

---

## Katalog a sklad

Produkty jsou staticky v `lib/products.ts`, ceny a skladovost se přepisují
z Redisu (admin panel). Skladová logika včetně setů/bundlů je popsaná
v [README-stock.md](README-stock.md).

---

## Jazyky

Web běží ve třech jazycích (cs / en / sk) přes `next-intl`. Klíče musí
existovat ve všech třech souborech v `messages/` — výjimkou jsou tvary
`*_few`, které mají jen čeština a slovenština (množné číslo pro 2–4).

---

## Kontrola před nasazením

```bash
npx tsc --noEmit             # typy
npx eslint . --ext .ts,.tsx  # lint
npx next build               # produkční build
```

Po zásahu do kódu je dobré osvěžit znalostní graf:

```bash
graphify update .
```
