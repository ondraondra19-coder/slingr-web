# Skladovost — jak funguje

Skladové zásoby žijí v **Upstash Redis** a spravují se z **admin panelu**
(`/admin` → Produkty). Žádný externí sheet ani ruční import — hodnoty se edituji
přímo ve webovém rozhraní a projeví se okamžitě.

> Dřív tenhle projekt tahal sklad z Google Sheets. Ta cesta je pryč, v kódu po ní
> nezůstalo nic. Pokud v nějakém starším návodu narazíš na `GOOGLE_SHEET_ID`,
> je to neplatné.

---

## 1. Kde jsou data

Vše sedí v jediném Redis hashi `stock:map`. Klíč jednoho pole má tvar:

```
slug|color|size
```

Pokud produkt nemá barvy nebo velikosti, dá se na dané místo `-`:

| klíč | význam | množství |
|---|---|---|
| `prak-x1\|black\|-` | prak X1, černý, bez velikostí | 12 |
| `prak-x1\|red\|-` | prak X1, červený | 3 |
| `micky-do-praku\|-\|-` | mičky, bez variant | 140 |
| `terc\|-\|-` | terč | 0 |

Klíč se nikdy neskládá ručně — na to je `makeKey(slug, color, size)`.

---

## 2. Sety (bundly)

Produkt s vyplněným `bundle` v `lib/products.ts` **vlastní skladové pole nemá**.
Jeho dostupnost se dopočítá z komponent a do mapy se vloží jako virtuální pole
`set-slug|-|-`.

Díky tomu všechna čtecí místa (homepage, kategorie, detail produktu,
`/api/stock`, košík, admin) vidí set jako běžný produkt se skladem a nemusela se
kvůli setům nijak upravovat.

Zápis jde opačnou cestou:

- sklad setu se uložit **nedá** — `setStock()` ho odmítne
- objednaný set se při odečtu **rozpadne na komponenty**

---

## 3. Environment variables

Do `.env.local` patří přístup k Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 4. API (`lib/stock.ts`)

### Čtení

| funkce | k čemu |
|---|---|
| `getStockMap()` | celá mapa skladu jako `Map<string, number>` |
| `getStock(key)` | množství pro jednu kombinaci `{ slug, color?, size? }` |
| `getProductStock(slug)` | všechna pole jednoho produktu: `{ "black\|-": 12, ... }` |
| `lookupStock(stockData, color, size)` | vytáhne číslo z výsledku `getProductStock` na klientu |

### Zápis

| funkce | k čemu |
|---|---|
| `setStock(key, value)` | nastaví jedno pole (sety odmítne) |
| `setStockBulk(...)` | hromadná změna z admin panelu |
| `deductStockForItems(items)` | odečte po zaplacení objednávky; sety rozpadne na komponenty |
| `restockItems(items)` | vrátí zpět při stornu / vrácení |

---

## 5. Cache

`lib/stock.ts` drží krátkou in-memory cache s `CACHE_TTL = 30 s`. Je to jen
vyhlazení v rámci jedné serverless instance — na Vercelu se mezi jednotlivými
invokacemi spolehnout nedá, ale v rámci jednoho běhu ušetří opakované dotazy.

Zápisové funkce cache samy invalidují, takže změna z adminu je vidět hned.

---

## 6. Tok dat

```
Zákazník otevře stránku produktu
        ↓
Next.js Server Component (app/produkt/[slug]/page.tsx)
        ↓
getProductStock("prak-x1")
        ↓
Upstash Redis  (hash stock:map, cache 30 s)
        ↓
{ "black|-": 12, "red|-": 0, ... }
        ↓
ProduktClient (client component)
        ↓
lookupStock(stockData, "black", undefined) → 12
        ↓
StockBadge → "Skladem" / "Poslední kusy" / "Není skladem"
```

---

## 7. Hlídací pes (`lib/stockWatch.ts`)

Když je produkt vyprodaný, zákazník si může nechat poslat e-mail, až naskladníš.
Zájemci se ukládají k danému skladovému poli; jakmile se pole dostane nad nulu,
`setStock` / `setStockBulk` je zavolá přes `notifyAndRemove()` a po odeslání
smaže.

Endpoint pro přihlášení k hlídání: `app/api/stock/notify`.
