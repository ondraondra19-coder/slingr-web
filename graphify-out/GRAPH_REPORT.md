# Graph Report - .  (2026-07-12)

## Corpus Check
- 185 files · ~301,264 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 665 nodes · 1284 edges · 50 communities (37 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.78)
- Token cost: 45,873 input · 0 output

## Community Hubs (Navigation)
- Orders & Checkout Pipeline
- Admin Accounts & Permissions
- Blog / Magazine CMS
- Products, Categories & Stock
- TypeScript Config & Refs
- Docs: READMEs & Stock Setup Guide
- Address Autocomplete Form
- Root Layout & Consent Tracking
- Admin Analytics Dashboard
- Reviews System
- Cart Page (Kosik)
- Admin Authentication
- Homepage
- Category Listing & Featured Products
- Dev Tooling Dependencies
- Product Detail Client
- Contact Messages
- Address Lookup API (RUIAN)
- Static Info Pages & Footer
- Core NPM Dependencies
- Cart State & Discounts
- Order Form (Objednavka)
- Product Search Bar
- Order Success Page
- Privacy Policy, Header & Logo
- Localization Context (i18n)
- Complaints / Returns Page
- NPM Scripts
- Admin Products List
- Shipping & Payment Info Page
- Write a Review Page
- Product Export Script
- Product Update Script
- FAQ Page
- Terms & Conditions Page
- Manual Translations Hook
- Instagram Feed Component
- i18n Request/Routing Config
- Next.js Config
- ESLint Config
- lucide-react Dependency
- next-intl Dependency
- react-dom Dependency
- Stripe.js Dependency
- xlsx Dependency
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `getRedis()` - 40 edges
2. `getCurrentSession()` - 25 edges
3. `useCurrency()` - 21 edges
4. `formatPrice()` - 21 edges
5. `getPrice()` - 20 edges
6. `getProductsWithPriceOverrides()` - 17 edges
7. `compilerOptions` - 16 edges
8. `useCart()` - 13 edges
9. `getAllPosts()` - 12 edges
10. `README-stock.md — Skladovost přes Google Sheets návod` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `getProductsWithPriceOverrides()`  [EXTRACTED]
  app/page.tsx → lib/priceOverrides.ts
- `ContentPreview()` --calls--> `parseBlogContent()`  [EXTRACTED]
  app/admin/MagazinAdminList.tsx → lib/blog.ts
- `AdminPage()` --indirect_call--> `toPublicAccount()`  [INFERRED]
  app/admin/page.tsx → lib/accounts.ts
- `AdminPage()` --calls--> `getProductsWithPriceOverrides()`  [EXTRACTED]
  app/admin/page.tsx → lib/priceOverrides.ts
- `AdminPage()` --calls--> `getAllReviews()`  [EXTRACTED]
  app/admin/page.tsx → lib/reviews.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Product stock lookup pipeline (customer request to StockBadge render)** — readme_stock_app_produkt_slug_page_tsx, readme_stock_getproductstock, readme_stock_google_sheets_api, readme_stock_components_produktclient_tsx, readme_stock_lookupstock, readme_stock_stockbadge [EXTRACTED 1.00]
- **Alternative Google Sheets authentication strategies** — readme_stock_google_sheets_api, readme_stock_service_account, readme_stock_google_auth_library [INFERRED 0.85]
- **Environment variables required for stock integration** — readme_stock_env_local, readme_stock_google_sheet_id, readme_stock_google_sheets_api_key [EXTRACTED 1.00]

## Communities (50 total, 13 thin omitted)

### Community 0 - "Orders & Checkout Pipeline"
Cohesion: 0.07
Nodes (49): ACTIVE_STATUSES, CURRENCY_SYMBOLS, formatDate(), formatMoney(), OrdersAdminList(), PAYMENT_METHOD_LABELS, STATUS_STYLES, TAB_ACTIVE_STYLES (+41 more)

### Community 1 - "Admin Accounts & Permissions"
Cohesion: 0.10
Nodes (36): AccountsAdminPanelProps, PERMISSION_LABELS, AdminDashboard(), AdminDashboardProps, getInitials(), Tab, MessagesAdminListProps, AdminPage() (+28 more)

### Community 2 - "Blog / Magazine CMS"
Cohesion: 0.12
Nodes (28): ContentPreview(), czechDateToInputValue(), EMPTY_FORM, FormState, inputValueToCzechDate(), MagazinAdminList(), checkAccess(), GET() (+20 more)

### Community 3 - "Products, Categories & Stock"
Cohesion: 0.09
Nodes (23): POST(), StockEntryInput, GET(), KategoriePage(), ProduktPage(), categories, getCategoryBySlug(), MediaItem (+15 more)

### Community 4 - "TypeScript Config & Refs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 5 - "Docs: READMEs & Stock Setup Guide"
Cohesion: 0.14
Nodes (25): README.md — default create-next-app readme, app/page.tsx (entry page), create-next-app (bootstrap tool), Geist (Vercel font family), next/font (font optimization), Next.js (framework), README-stock.md — Skladovost přes Google Sheets návod, app/api/stock/route.ts (client refresh endpoint) (+17 more)

### Community 6 - "Address Autocomplete Form"
Cohesion: 0.11
Nodes (17): AddressBlock, AddressErrors, AdresaResult, cacheAdresa, cacheMesto, defaultForm(), emptyAddress(), formatPhone() (+9 more)

### Community 7 - "Root Layout & Consent Tracking"
Cohesion: 0.19
Nodes (16): geistMono, geistSans, metadata, viewport, CookieBanner(), getConsent(), hasAnalyticsConsent(), capturePageview() (+8 more)

### Community 8 - "Admin Analytics Dashboard"
Cohesion: 0.13
Nodes (15): AnalyticsPanel(), BarChart(), CURRENCY_LABELS, formatDateShort(), formatMoney(), RANGE_OPTIONS, GET(), AnalyticsSummary (+7 more)

### Community 9 - "Reviews System"
Cohesion: 0.18
Nodes (16): ReviewsAdminList(), ReviewsAdminListProps, DELETE(), DELETE(), GET(), POST(), parseUserAgent(), addReview() (+8 more)

### Community 10 - "Cart Page (Kosik)"
Cohesion: 0.21
Nodes (16): InformacePage(), BESTSELLER_SLUGS, COLOR_LABELS, getProductImgs(), KosikPage(), ProductCard(), translateValue(), ObjednavkaPage() (+8 more)

### Community 11 - "Admin Authentication"
Cohesion: 0.20
Nodes (14): normalizeName(), POST(), ADMIN_COOKIE_NAME, ADMIN_HINT_COOKIE_NAME, bufToHex(), checkPassword(), createSessionToken(), getKey() (+6 more)

### Community 12 - "Homepage"
Cohesion: 0.13
Nodes (12): Home(), CategoryGrid(), HomeSlider(), slides, slidesData, calcAvg(), formatDate(), Review (+4 more)

### Community 13 - "Category Listing & Featured Products"
Cohesion: 0.18
Nodes (12): FEATURED_SLUGS, FeaturedProducts(), getVisibleCount(), anyInStock(), Category, KategorieClient(), maxStock(), sortOptions (+4 more)

### Community 14 - "Dev Tooling Dependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 15 - "Product Detail Client"
Cohesion: 0.15
Nodes (7): COLOR_MAP, isLayeredColor(), MediaItem, ProduktClient(), ModelColor, StockData, useStockPolling()

### Community 16 - "Contact Messages"
Cohesion: 0.27
Nodes (12): DELETE(), GET(), PATCH(), requireAccess(), getClientIp(), POST(), addMessage(), checkAndSetCooldown() (+4 more)

### Community 17 - "Address Lookup API (RUIAN)"
Cohesion: 0.29
Nodes (14): AdresaResult, callRuian(), capitalize(), formatPsc(), GET(), isJunkLokalita(), isMultiPsc(), isSilnaUlice() (+6 more)

### Community 18 - "Static Info Pages & Footer"
Cohesion: 0.13
Nodes (5): team, values, footerNav, socialLinks, trustItems

### Community 19 - "Core NPM Dependencies"
Cohesion: 0.13
Nodes (15): google-auth-library, next, dependencies, google-auth-library, next, posthog-js, posthog-node, react (+7 more)

### Community 20 - "Cart State & Discounts"
Cohesion: 0.20
Nodes (13): CartContext, CartCtx, CartItem, CartProvider(), itemKey(), PriceRaw, APPROX_RATES, calcDiscount() (+5 more)

### Community 21 - "Order Form (Objednavka)"
Cohesion: 0.21
Nodes (9): dopravyOptions, PacketaPoint, platbyOptions, Window, CURRENCIES, Currency, CurrencyCode, CurrencyContext (+1 more)

### Community 22 - "Product Search Bar"
Cohesion: 0.29
Nodes (12): CATEGORY_LABELS, ConfidentCard(), expandQuery(), getCategoryLabel(), highlightMatch(), isConfidentResult(), normalize(), scoreProduct() (+4 more)

### Community 23 - "Order Success Page"
Cohesion: 0.17
Nodes (3): Snapshot, SnapshotInfo, SnapshotItem

### Community 24 - "Privacy Policy, Header & Logo"
Cohesion: 0.21
Nodes (7): metadata, Header(), languages, navRight, readLangFromCookie(), switchGoogleTranslate(), Logo()

### Community 25 - "Localization Context (i18n)"
Cohesion: 0.27
Nodes (8): InfoGrid(), LangContext, LangProvider(), Locale, readLocale(), useLang(), messages, useT()

### Community 26 - "Complaints / Returns Page"
Cohesion: 0.22
Nodes (4): defaultForm, FormState, returnMethods, steps

### Community 27 - "NPM Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 28 - "Admin Products List"
Cohesion: 0.39
Nodes (7): Combination, formatPrice(), getProductCombinations(), normalizePrice(), priceEquals(), ProductsAdminList(), ProductsAdminListProps

### Community 29 - "Shipping & Payment Info Page"
Cohesion: 0.29
Nodes (4): benefits, metadata, paymentMethods, shippingMethods

### Community 30 - "Write a Review Page"
Cohesion: 0.38
Nodes (6): calcStats(), formatDate(), RecenzePage(), Review, ReviewCard(), Window

### Community 31 - "Product Export Script"
Cohesion: 0.29
Nodes (6): content, require, rows, wb, ws, xlsx

### Community 32 - "Product Update Script"
Cohesion: 0.29
Nodes (6): notFound, productsContent, require, rows, workbook, xlsx

## Knowledge Gaps
- **179 isolated node(s):** `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `Tab`, `AdminDashboardProps`, `RANGE_OPTIONS` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRedis()` connect `Orders & Checkout Pipeline` to `Admin Accounts & Permissions`, `Blog / Magazine CMS`, `Products, Categories & Stock`, `Reviews System`, `Contact Messages`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `getCurrentSession()` connect `Admin Accounts & Permissions` to `Orders & Checkout Pipeline`, `Blog / Magazine CMS`, `Products, Categories & Stock`, `Admin Analytics Dashboard`, `Reviews System`, `Admin Authentication`, `Contact Messages`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Product` connect `Category Listing & Featured Products` to `Orders & Checkout Pipeline`, `Admin Accounts & Permissions`, `Products, Categories & Stock`, `Product Detail Client`, `Admin Products List`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `Tab` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Orders & Checkout Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.07213114754098361 - nodes in this community are weakly interconnected._
- **Should `Admin Accounts & Permissions` be split into smaller, more focused modules?**
  _Cohesion score 0.09990749306197964 - nodes in this community are weakly interconnected._
- **Should `Blog / Magazine CMS` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._