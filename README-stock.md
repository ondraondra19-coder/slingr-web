# Skladovost přes Google Sheets — návod k nastavení

## 1. Vytvoř Google Sheet

Název listu musí být přesně: **Sklad**

### Struktura (první řádek = hlavička, data od řádku 2):

| A — slug | B — color | C — size | D — stock |
|---|---|---|---|
| pouzdro-airpods | black | airpods-1-2 | 12 |
| pouzdro-airpods | black | airpods-3 | 8 |
| pouzdro-airpods | black | airpods-4 | 3 |
| pouzdro-airpods | black | airpods-pro-2 | 0 |
| pouzdro-airpods | grey | airpods-1-2 | 5 |
| pouzdro-airpods | grey | airpods-3 | 11 |
| silikonovy-reminek-apple-watch | darkblue | watch-small | 7 |
| silikonovy-reminek-apple-watch | darkblue | watch-large | 4 |
| silikonovy-reminek-apple-watch | pink | watch-small | 2 |
| cistič-displeje | bila | - | 9 |
| organizer-kabely | - | - | 14 |

### Pravidla pro hodnoty:
- **slug** = přesně jako v `products.ts`
- **color** = value z `colors[]` v products.ts (např. `black`, `bila`, `darkblue`)
- **size** = value z `sizes[]` v products.ts (např. `watch-small`, `airpods-1-2`)
- Pokud produkt **nemá barvy** → B = `-`
- Pokud produkt **nemá velikosti** → C = `-`
- **stock** = číslo (0 = není skladem)

---

## 2. Google Sheets API klíč (pro veřejný sheet)

Nejjednodušší varianta — sheet je veřejně čitelný:

1. Jdi na [console.cloud.google.com](https://console.cloud.google.com)
2. Vytvoř projekt (nebo vyber existující)
3. Povol **Google Sheets API**: APIs & Services → Enable APIs → "Google Sheets API"
4. Vytvoř API klíč: APIs & Services → Credentials → Create Credentials → API key
5. Sheet nasdílej jako "Anyone with the link can view"

---

## 3. (Alternativa) Service Account pro soukromý sheet

Pokud nechceš sheet sdílet veřejně:

1. APIs & Services → Credentials → Create Credentials → **Service account**
2. Stáhni JSON klíč
3. Sheet nasdílej s e-mailem service accountu (ten vypadá jako `xxx@projekt.iam.gserviceaccount.com`)
4. V kódu `stock.ts` nahraď fetch za autentizaci přes `google-auth-library`:

```bash
npm install google-auth-library
```

```typescript
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const client = await auth.getClient();
const token = await client.getAccessToken();

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token.token}` },
});
```

---

## 4. Environment variables

Přidej do `.env.local`:

```env
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEETS_API_KEY=AIzaSy...
```

Sheet ID najdeš v URL sheetu:
`https://docs.google.com/spreadsheets/d/`**`[TOTO JE SHEET_ID]`**`/edit`

---

## 5. Soubory do projektu

Zkopíruj tyto soubory:

```
lib/stock.ts                    ← hlavní logika (fetch + cache)
app/produkt/[slug]/page.tsx     ← server component s getProductStock()
app/api/stock/route.ts          ← API endpoint (volitelné, pro client refresh)
components/ProduktClient.tsx    ← přijímá stockData prop
```

---

## 6. Jak to funguje

```
Zákazník otevře stránku produktu
        ↓
Next.js Server Component (page.tsx)
        ↓
getProductStock("pouzdro-airpods")
        ↓
Google Sheets API (cachováno 3 min)
        ↓
{ "black|airpods-1-2": 12, "grey|-": 0, ... }
        ↓
ProduktClient (client component)
        ↓
lookupStock(stockData, "black", "airpods-1-2") → 12
        ↓
StockBadge zobrazí "Skladem (5+ ks)" / "Poslední 3 kusy" / "Není skladem"
```

---

## 7. Jak editovat skladovost

Jednoduše otevřeš Google Sheet a změníš číslo ve sloupci D.
Změna se projeví na webu do **3 minut** (cache TTL).

Pro okamžitou aktualizaci bez čekání na cache:
- V `stock.ts` změň `CACHE_TTL = 0` (vypne cache)
- Nebo nastav `revalidate = 0` v `page.tsx`

---

## 8. Přidání nového produktu / kombinace

Přidej nový řádek do sheetu. Pořadí řádků nehraje roli.

Příklad — nový produkt "Silikonový kryt na iPhone" s 3 barvami a 2 modely = 6 řádků:

| slug | color | size | stock |
|---|---|---|---|
| kryt-iphone-silikon | black | iphone15 | 8 |
| kryt-iphone-silikon | black | iphone15pro | 5 |
| kryt-iphone-silikon | blue | iphone15 | 3 |
| kryt-iphone-silikon | blue | iphone15pro | 0 |
| kryt-iphone-silikon | pink | iphone15 | 12 |
| kryt-iphone-silikon | pink | iphone15pro | 7 |