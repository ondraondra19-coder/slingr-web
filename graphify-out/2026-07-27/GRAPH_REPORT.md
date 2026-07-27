# Graph Report - Slingr  (2026-07-26)

## Corpus Check
- 182 files · ~291,764 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1093 nodes · 2797 edges · 67 communities (36 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1aa10e61`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Orders & Checkout Pipeline
- Admin Accounts & Permissions
- Blog / Magazine CMS
- Products, Categories & Stock
- TypeScript Config & Refs
- Address Autocomplete Form
- Root Layout & Consent Tracking
- Admin Analytics Dashboard
- Reviews System
- Cart Page (Kosik)
- Admin Authentication
- messages.ts
- Category Listing & Featured Products
- Dev Tooling Dependencies
- AdminDashboard.tsx
- Address Lookup API (RUIAN)
- Static Info Pages & Footer
- Core NPM Dependencies
- page.tsx
- package.json
- Product Search Bar
- dependencies
- reviews.ts
- priceOverrides.ts
- index.ts
- browserslist
- page.tsx
- lucide-react
- package.json
- Product Export Script
- Product Update Script
- route.ts
- Terms & Conditions Page
- browserslist
- i18n Request/Routing Config
- Next.js Config
- ReviewsAdminList.tsx
- ESLint Config
- next-intl Dependency
- PostCSS Config
- app/page.tsx (entry page)
- create-next-app (bootstrap tool)
- Geist (Vercel font family)
- next/font (font optimization)
- Next.js (framework)
- app/api/stock/route.ts (client refresh endpoint)
- app/produkt/[slug]/page.tsx (server component)
- CACHE_TTL (3-minute cache mechanism)
- components/ProduktClient.tsx (client component)
- .env.local environment configuration
- google-auth-library (npm package)
- GOOGLE_SHEET_ID (env var)
- Google Sheet "Sklad" (stock data source)
- Google Sheets API
- GOOGLE_SHEETS_API_KEY (env var)
- lib/stock.ts (fetch + cache logic)
- products.ts (product slug/color/size source of truth)
- Service Account auth (private sheet alternative)
- StockBadge (UI component)
- Vercel (company/creator of Next.js)
- Vercel Platform (deployment target)
- page.tsx

## God Nodes (most connected - your core abstractions)
1. `useT()` - 93 edges
2. `getRedis()` - 67 edges
3. `formatPrice()` - 39 edges
4. `getCurrentSession()` - 39 edges
5. `useLang()` - 32 edges
6. `p()` - 26 edges
7. `useCurrency()` - 25 edges
8. `getPrice()` - 23 edges
9. `esc()` - 21 edges
10. `SearchOverlay()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `AdminSearch()` --indirect_call--> `p()`  [INFERRED]
  app/admin/AdminSearch.tsx → lib/email.ts
- `ProductsAdminList()` --indirect_call--> `czk()`  [INFERRED]
  app/admin/ProductsAdminList.tsx → content/legal/terms.tsx
- `AdminPage()` --indirect_call--> `toPublicAccount()`  [INFERRED]
  app/admin/page.tsx → lib/accounts.ts
- `isTypickaUlice()` --indirect_call--> `p()`  [INFERRED]
  app/api/adresa/route.ts → lib/email.ts
- `POST()` --indirect_call--> `p()`  [INFERRED]
  app/api/checkout/route.ts → lib/email.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Product stock lookup pipeline (customer request to StockBadge render)** — readme_stock_app_produkt_slug_page_tsx, readme_stock_getproductstock, readme_stock_google_sheets_api, readme_stock_components_produktclient_tsx, readme_stock_lookupstock, readme_stock_stockbadge [EXTRACTED 1.00]
- **Alternative Google Sheets authentication strategies** — readme_stock_google_sheets_api, readme_stock_service_account, readme_stock_google_auth_library [INFERRED 0.85]
- **Environment variables required for stock integration** — readme_stock_env_local, readme_stock_google_sheet_id, readme_stock_google_sheets_api_key [EXTRACTED 1.00]

## Communities (67 total, 31 thin omitted)

### Community 0 - "Orders & Checkout Pipeline"
Cohesion: 0.13
Nodes (21): calcStats(), formatDate(), RecenzePage(), Review, ReviewCard(), Window, calcAvg(), formatDate() (+13 more)

### Community 1 - "Admin Accounts & Permissions"
Cohesion: 0.36
Nodes (5): anyInStock(), KategorieClient(), maxStock(), TILE_STYLE, trackEvent()

### Community 2 - "Blog / Magazine CMS"
Cohesion: 0.06
Nodes (44): AdminSearch(), AdminSearchProps, CURRENCY_SYMBOLS, formatMoney(), ContentPreview(), czechDateToInputValue(), EMPTY_FORM, FormState (+36 more)

### Community 3 - "Products, Categories & Stock"
Cohesion: 0.09
Nodes (35): ClaimCard(), ClaimsAdminList(), ClaimsAdminListProps, money(), nextActions(), refundTotals(), STATUS_LABELS, statusClasses() (+27 more)

### Community 4 - "TypeScript Config & Refs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 6 - "Address Autocomplete Form"
Cohesion: 0.15
Nodes (28): CategoryProductRows(), anyInStock(), getCZK(), HledaniClient(), maxStock(), TILE_STYLE, featuredProducts(), getCategoryLabel() (+20 more)

### Community 7 - "Root Layout & Consent Tracking"
Cohesion: 0.06
Nodes (54): AccountsAdminPanelProps, PERMISSION_LABELS, AdminDashboard(), AdminDashboardProps, getInitials(), CampaignSummary, Context, DELETE() (+46 more)

### Community 8 - "Admin Analytics Dashboard"
Cohesion: 0.12
Nodes (23): Tab, BarChart(), CURRENCY_LABELS, formatDateShort(), formatMoney(), RankedTable(), SectionCard(), StatCard() (+15 more)

### Community 9 - "Reviews System"
Cohesion: 0.12
Nodes (23): metadata, metadata, LegalLayout(), Section(), PrivacyPage(), TermsPage(), PRIVACY_BODY, PRIVACY_SUBTITLE (+15 more)

### Community 11 - "Admin Authentication"
Cohesion: 0.10
Nodes (25): ACTIVE_STATUSES, CURRENCY_SYMBOLS, formatDate(), formatMoney(), OrdersAdminList(), OrdersAdminListProps, PAYMENT_METHOD_LABELS, SHIPPING_PROVIDER_LABELS (+17 more)

### Community 12 - "messages.ts"
Cohesion: 0.05
Nodes (44): MessagesAdminListProps, ReviewsAdminList(), ReviewsAdminListProps, POST(), requireAccess(), DELETE(), GET(), PATCH() (+36 more)

### Community 13 - "Category Listing & Featured Products"
Cohesion: 0.07
Nodes (49): DiscountsAdminPanel(), DiscountsAdminPanelProps, isExpired(), GET(), POST(), requirePermission(), DELETE(), GET() (+41 more)

### Community 14 - "Dev Tooling Dependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+13 more)

### Community 17 - "Address Lookup API (RUIAN)"
Cohesion: 0.29
Nodes (14): AdresaResult, callRuian(), capitalize(), formatPsc(), GET(), isJunkLokalita(), isMultiPsc(), isSilnaUlice() (+6 more)

### Community 18 - "Static Info Pages & Footer"
Cohesion: 0.07
Nodes (46): normalizePrice(), percentFromSale(), priceEquals(), ProductsAdminList(), ProductsAdminListProps, saleFromPercent(), fail(), POST() (+38 more)

### Community 19 - "Core NPM Dependencies"
Cohesion: 0.11
Nodes (53): PATCH(), VALID_PAYMENT_STATUSES, VALID_STATUSES, BankovniPrevod(), approxConvert(), addressBlock(), bankTransferBlock(), campaignBodyToHtml() (+45 more)

### Community 20 - "page.tsx"
Cohesion: 0.09
Nodes (19): ApiOrderItem, CopyButton(), DeliveryAddressBlock(), Dobirka(), InlineCopy(), KartaStripe(), Snapshot, SnapshotInfo (+11 more)

### Community 21 - "package.json"
Cohesion: 0.18
Nodes (10): _comment_browserslist, name, private, scripts, build, check:messages, dev, lint (+2 more)

### Community 22 - "Product Search Bar"
Cohesion: 0.08
Nodes (27): CookiesPage(), ONasPage(), BlogPreviewList(), PreviewPost, CategoryGrid(), ChatWidget(), CheckoutStepper(), Footer() (+19 more)

### Community 23 - "dependencies"
Cohesion: 0.09
Nodes (23): fuse.js, google-auth-library, next-intl, dependencies, fuse.js, google-auth-library, next-intl, pdfkit (+15 more)

### Community 24 - "reviews.ts"
Cohesion: 0.15
Nodes (7): dead, DYNAMIC_NAMESPACES, errors, keys, messages, ROOT, used

### Community 26 - "index.ts"
Cohesion: 0.38
Nodes (5): args, del(), getAll(), redis, ROOT

### Community 27 - "browserslist"
Cohesion: 0.25
Nodes (8): browserslist, chrome >= 108, edge >= 108, firefox >= 108, ios_saf >= 15.4, not dead, not op_mini all, safari >= 15.4

### Community 28 - "page.tsx"
Cohesion: 0.07
Nodes (50): geistMono, geistSans, metadata, viewport, CookieBanner(), subscribeConsent(), capturePageview(), clearPostHogStorage() (+42 more)

### Community 30 - "package.json"
Cohesion: 0.11
Nodes (18): AddressBlock, AddressErrors, AdresaResult, cacheAdresa, cacheMesto, defaultForm(), emptyAddress(), formatPhone() (+10 more)

### Community 31 - "Product Export Script"
Cohesion: 0.29
Nodes (6): content, require, rows, wb, ws, xlsx

### Community 32 - "Product Update Script"
Cohesion: 0.29
Nodes (6): notFound, productsContent, require, rows, workbook, xlsx

### Community 33 - "route.ts"
Cohesion: 0.06
Nodes (67): AdminPage(), ProductOrderPanel(), POST(), PriceEntry, GET(), POST(), requireProductsPermission(), CheckoutItem (+59 more)

### Community 35 - "browserslist"
Cohesion: 0.11
Nodes (16): Jazyky, Katalog a sklad, Kontrola před nasazením, Slingr, Spuštění, 1. Kde jsou data, 2. Sety (bundly), 3. Environment variables (+8 more)

### Community 42 - "ReviewsAdminList.tsx"
Cohesion: 0.19
Nodes (23): BESTSELLER_SLUGS, KosikPage(), ProductCard(), DiscountWidget(), Header(), ProductPrice(), ProductCard(), ProductRow() (+15 more)

### Community 79 - "page.tsx"
Cohesion: 0.10
Nodes (23): buildCategories(), CategorySection(), FaqCategory, FaqPage(), buildDopravyOptions(), buildPlatbyOptions(), MOCK_ZBOXES, ObjednavkaPage() (+15 more)

## Knowledge Gaps
- **268 isolated node(s):** `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `AdminDashboardProps`, `AdminSearchProps`, `CURRENCY_SYMBOLS` (+263 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `Cart Page (Kosik)`, `AdminDashboard.tsx`, `Core NPM Dependencies`, `package.json`, `priceOverrides.ts`, `lucide-react`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `useT()` connect `Product Search Bar` to `Orders & Checkout Pipeline`, `Admin Accounts & Permissions`, `Blog / Magazine CMS`, `Address Autocomplete Form`, `Reviews System`, `ReviewsAdminList.tsx`, `messages.ts`, `page.tsx`, `Core NPM Dependencies`, `page.tsx`, `page.tsx`, `package.json`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `qrcode` connect `Core NPM Dependencies` to `dependencies`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `AdminDashboardProps` to the rest of the system?**
  _268 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Orders & Checkout Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.12615384615384614 - nodes in this community are weakly interconnected._
- **Should `Blog / Magazine CMS` be split into smaller, more focused modules?**
  _Cohesion score 0.06201923076923077 - nodes in this community are weakly interconnected._
- **Should `Products, Categories & Stock` be split into smaller, more focused modules?**
  _Cohesion score 0.09358974358974359 - nodes in this community are weakly interconnected._