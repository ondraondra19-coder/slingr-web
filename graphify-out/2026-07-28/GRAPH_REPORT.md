# Graph Report - Slingr  (2026-07-28)

## Corpus Check
- 186 files · ~304,287 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1120 nodes · 2909 edges · 80 communities (49 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a43b99e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Orders & Checkout Pipeline
- Admin Accounts & Permissions
- Blog / Magazine CMS
- Products, Categories & Stock
- TypeScript Config & Refs
- campaigns.ts
- Address Autocomplete Form
- Root Layout & Consent Tracking
- Admin Analytics Dashboard
- Reviews System
- Cart Page (Kosik)
- Admin Authentication
- messages.ts
- Category Listing & Featured Products
- Dev Tooling Dependencies
- page.tsx
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
- pdfkit
- i18n Request/Routing Config
- Next.js Config
- ReviewsAdminList.tsx
- ESLint Config
- posthog-node
- next-intl Dependency
- resend
- getCurrentSession
- route.ts
- PostCSS Config
- Reviews.tsx
- BlogList.tsx
- pdfkit
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
- posthog-node
- qrcode
- resend
- page.tsx

## God Nodes (most connected - your core abstractions)
1. `useT()` - 92 edges
2. `getRedis()` - 67 edges
3. `formatPrice()` - 41 edges
4. `getCurrentSession()` - 39 edges
5. `useLang()` - 32 edges
6. `getPrice()` - 28 edges
7. `useCurrency()` - 27 edges
8. `p()` - 26 edges
9. `SearchOverlay()` - 21 edges
10. `esc()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AdminSearch()` --indirect_call--> `p()`  [INFERRED]
  app/admin/AdminSearch.tsx → lib/email.ts
- `ProductsAdminList()` --indirect_call--> `czk()`  [INFERRED]
  app/admin/ProductsAdminList.tsx → content/legal/terms.tsx
- `isTypickaUlice()` --indirect_call--> `p()`  [INFERRED]
  app/api/adresa/route.ts → lib/email.ts
- `POST()` --indirect_call--> `p()`  [INFERRED]
  app/api/checkout/route.ts → lib/email.ts
- `POST()` --indirect_call--> `p()`  [INFERRED]
  app/api/orders/route.ts → lib/email.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Product stock lookup pipeline (customer request to StockBadge render)** — readme_stock_app_produkt_slug_page_tsx, readme_stock_getproductstock, readme_stock_google_sheets_api, readme_stock_components_produktclient_tsx, readme_stock_lookupstock, readme_stock_stockbadge [EXTRACTED 1.00]
- **Alternative Google Sheets authentication strategies** — readme_stock_google_sheets_api, readme_stock_service_account, readme_stock_google_auth_library [INFERRED 0.85]
- **Environment variables required for stock integration** — readme_stock_env_local, readme_stock_google_sheet_id, readme_stock_google_sheets_api_key [EXTRACTED 1.00]

## Communities (80 total, 31 thin omitted)

### Community 0 - "Orders & Checkout Pipeline"
Cohesion: 0.12
Nodes (22): DescriptionBody(), Gallery(), MediaItem, ProduktClient(), StockBadge(), TILE_STYLE, asSpecs(), DescBlock (+14 more)

### Community 1 - "Admin Accounts & Permissions"
Cohesion: 0.14
Nodes (19): MessagesAdminListProps, POST(), requireAccess(), DELETE(), GET(), PATCH(), requireAccess(), fail() (+11 more)

### Community 2 - "Blog / Magazine CMS"
Cohesion: 0.09
Nodes (36): AdminSearch(), AdminSearchProps, CURRENCY_SYMBOLS, formatMoney(), ContentPreview(), czechDateToInputValue(), EMPTY_FORM, FormState (+28 more)

### Community 3 - "Products, Categories & Stock"
Cohesion: 0.13
Nodes (24): ClaimCard(), ClaimsAdminList(), ClaimsAdminListProps, money(), nextActions(), refundTotals(), STATUS_LABELS, statusClasses() (+16 more)

### Community 4 - "TypeScript Config & Refs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 5 - "campaigns.ts"
Cohesion: 0.29
Nodes (11): GET(), POST(), requirePermission(), CampaignContext, campaignFrom(), CampaignSummary, getCampaignContext(), resolveSegmentId() (+3 more)

### Community 6 - "Address Autocomplete Form"
Cohesion: 0.19
Nodes (21): BESTSELLER_SLUGS, KosikPage(), ProductCard(), DiscountWidget(), Header(), ProductPrice(), ProductCard(), ProductRow() (+13 more)

### Community 7 - "Root Layout & Consent Tracking"
Cohesion: 0.20
Nodes (21): AdminPage(), DELETE(), GET(), PATCH(), POST(), requireMainAccount(), Account, addAccount() (+13 more)

### Community 8 - "Admin Analytics Dashboard"
Cohesion: 0.06
Nodes (49): Tab, BarChart(), CURRENCY_LABELS, formatDateShort(), formatMoney(), RankedTable(), SectionCard(), StatCard() (+41 more)

### Community 9 - "Reviews System"
Cohesion: 0.11
Nodes (27): metadata, metadata, LegalLayout(), Section(), PrivacyPage(), TermsPage(), PRIVACY_BODY, PRIVACY_SUBTITLE (+19 more)

### Community 10 - "Cart Page (Kosik)"
Cohesion: 0.16
Nodes (20): MockZboxModal(), anyInStock(), HledaniClient(), maxStock(), TILE_STYLE, anyInStock(), KategorieClient(), maxStock() (+12 more)

### Community 11 - "Admin Authentication"
Cohesion: 0.09
Nodes (39): ACTIVE_STATUSES, CURRENCY_SYMBOLS, formatDate(), formatMoney(), OrdersAdminList(), OrdersAdminListProps, PAYMENT_METHOD_LABELS, SHIPPING_PROVIDER_LABELS (+31 more)

### Community 12 - "messages.ts"
Cohesion: 0.10
Nodes (21): metadata, buildDopravyOptions(), buildPlatbyOptions(), MOCK_ZBOXES, ObjednavkaPage(), PacketaPoint, Window, buildPayment() (+13 more)

### Community 13 - "Category Listing & Featured Products"
Cohesion: 0.28
Nodes (10): fail(), NewsletterErrorCode, POST(), fail(), POST(), WelcomeDiscountErrorCode, ensureWelcomeDiscount(), isValidNewsletterEmail (+2 more)

### Community 14 - "Dev Tooling Dependencies"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+13 more)

### Community 15 - "page.tsx"
Cohesion: 0.20
Nodes (14): normalizeName(), POST(), ADMIN_COOKIE_NAME, ADMIN_HINT_COOKIE_NAME, bufToHex(), checkPassword(), createSessionToken(), getKey() (+6 more)

### Community 16 - "AdminDashboard.tsx"
Cohesion: 0.18
Nodes (11): AccountsAdminPanelProps, PERMISSION_LABELS, AdminDashboard(), AdminDashboardProps, getInitials(), CampaignSummary, Context, PublicAccount (+3 more)

### Community 17 - "Address Lookup API (RUIAN)"
Cohesion: 0.29
Nodes (14): AdresaResult, callRuian(), capitalize(), formatPsc(), GET(), isJunkLokalita(), isMultiPsc(), isSilnaUlice() (+6 more)

### Community 18 - "Static Info Pages & Footer"
Cohesion: 0.06
Nodes (58): ProductOrderPanel(), normalizePrice(), percentFromSale(), priceEquals(), ProductsAdminList(), ProductsAdminListProps, saleFromPercent(), DiscountEntry (+50 more)

### Community 19 - "Core NPM Dependencies"
Cohesion: 0.11
Nodes (55): BankovniPrevod(), approxConvert(), addressBlock(), bankTransferBlock(), campaignBodyToHtml(), claimDetailsTable(), currencyOf(), esc() (+47 more)

### Community 20 - "page.tsx"
Cohesion: 0.27
Nodes (12): CheckoutItem, POST(), OrderReqItem, POST(), getDobirkaFee(), createOrderDirect(), createPendingOrder(), generateId() (+4 more)

### Community 21 - "package.json"
Cohesion: 0.18
Nodes (10): _comment_browserslist, name, private, scripts, build, check:messages, dev, lint (+2 more)

### Community 22 - "Product Search Bar"
Cohesion: 0.07
Nodes (38): CookiesPage(), KontaktPage(), ONasPage(), ApiOrderItem, CopyButton(), DeliveryAddressBlock(), Dobirka(), InlineCopy() (+30 more)

### Community 23 - "dependencies"
Cohesion: 0.09
Nodes (23): fuse.js, google-auth-library, next-intl, dependencies, fuse.js, google-auth-library, next-intl, pdfkit (+15 more)

### Community 24 - "reviews.ts"
Cohesion: 0.15
Nodes (7): dead, DYNAMIC_NAMESPACES, errors, keys, messages, ROOT, used

### Community 25 - "priceOverrides.ts"
Cohesion: 0.13
Nodes (21): calcStats(), formatDate(), RecenzePage(), Review, ReviewCard(), Window, calcAvg(), formatDate() (+13 more)

### Community 26 - "index.ts"
Cohesion: 0.38
Nodes (5): args, del(), getAll(), redis, ROOT

### Community 27 - "browserslist"
Cohesion: 0.25
Nodes (8): browserslist, chrome >= 108, edge >= 108, firefox >= 108, ios_saf >= 15.4, not dead, not op_mini all, safari >= 15.4

### Community 28 - "page.tsx"
Cohesion: 0.07
Nodes (50): geistMono, geistSans, metadata, viewport, CookieBanner(), subscribeConsent(), capturePageview(), clearPostHogStorage() (+42 more)

### Community 29 - "lucide-react"
Cohesion: 0.29
Nodes (11): fail(), GET(), POST(), ReviewErrorCode, addReview(), checkAndSetCooldown(), getAllReviews(), getInitials() (+3 more)

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
Cohesion: 0.14
Nodes (9): buildCategories(), FaqCategory, FaqPage(), buildSteps(), defaultForm, FormState, ReklamaceContent(), returnDeadline() (+1 more)

### Community 35 - "browserslist"
Cohesion: 0.11
Nodes (16): Jazyky, Katalog a sklad, Kontrola před nasazením, Slingr, Spuštění, 1. Kde jsou data, 2. Sety (bundly), 3. Environment variables (+8 more)

### Community 42 - "ReviewsAdminList.tsx"
Cohesion: 0.21
Nodes (19): CategoryProductRows(), featuredProducts(), getCategoryLabel(), highlightMatch(), SearchOverlay(), Locale, categories, getCategoryName() (+11 more)

### Community 44 - "posthog-node"
Cohesion: 0.22
Nodes (7): currencyOf(), OrderResult(), OrderStatus, StatusOrder, StatusTimeline(), StavObjednavkyPage(), TIMELINE

### Community 46 - "resend"
Cohesion: 0.33
Nodes (9): POST(), PriceEntry, getEffectivePrice(), getPriceOverrides(), getProductsWithPriceOverrides(), getUnitAmountFor(), overrideKey(), setPriceOverridesBulk() (+1 more)

### Community 47 - "getCurrentSession"
Cohesion: 0.27
Nodes (8): GET(), DELETE(), POST(), StockEntryInput, findAccountById(), listOrders(), deleteReview(), getCurrentSession()

### Community 48 - "route.ts"
Cohesion: 0.35
Nodes (8): GET(), fail(), POST(), StockNotifyErrorCode, getClientIp(), findDiscount(), checkRateLimit(), isValidWatchEmail()

### Community 50 - "Reviews.tsx"
Cohesion: 0.29
Nodes (10): POST(), ServerAnalyticsEventMap, ServerAnalyticsEventName, sendOrderConfirmationEmail(), confirmPendingOrder(), markStockIssue(), captureServerEvent(), createPostHogServerClient() (+2 more)

### Community 51 - "BlogList.tsx"
Cohesion: 0.36
Nodes (9): ClaimsErrorCode, fail(), isFilled(), isValidAccount(), isValidOrderFormat(), isValidPhone(), POST(), checkAndSetClaimCooldown() (+1 more)

### Community 52 - "pdfkit"
Cohesion: 0.39
Nodes (7): fail(), isValidOrderFormat(), OrderStatusErrorCode, POST(), trackingUrl(), isValidEmail(), getOrderForStatus()

### Community 76 - "posthog-node"
Cohesion: 0.47
Nodes (4): ReviewsAdminList(), ReviewsAdminListProps, parseUserAgent(), Review

## Knowledge Gaps
- **272 isolated node(s):** `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `AdminDashboardProps`, `AdminSearchProps`, `CURRENCY_SYMBOLS` (+267 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useT()` connect `Product Search Bar` to `Orders & Checkout Pipeline`, `route.ts`, `Blog / Magazine CMS`, `Address Autocomplete Form`, `Reviews System`, `ReviewsAdminList.tsx`, `Cart Page (Kosik)`, `messages.ts`, `posthog-node`, `Core NPM Dependencies`, `priceOverrides.ts`, `page.tsx`, `package.json`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `pdfkit`, `qrcode`, `resend`, `page.tsx`, `Core NPM Dependencies`, `package.json`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `qrcode` connect `Core NPM Dependencies` to `dependencies`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `PERMISSION_LABELS`, `AccountsAdminPanelProps`, `AdminDashboardProps` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Orders & Checkout Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._
- **Should `Admin Accounts & Permissions` be split into smaller, more focused modules?**
  _Cohesion score 0.13675213675213677 - nodes in this community are weakly interconnected._
- **Should `Blog / Magazine CMS` be split into smaller, more focused modules?**
  _Cohesion score 0.08673469387755102 - nodes in this community are weakly interconnected._