// lib/posthog-query.ts
// Server-only: čte statistiky z PostHogu (HogQL Query API) pro admin panel.
//
// POZOR na dva různé hosty:
//  - NEXT_PUBLIC_POSTHOG_HOST (eu.i.posthog.com) je INGEST host pro
//    capture() z posthog-js/posthog-node.
//  - Query/REST API běží na app hostu (eu.posthog.com) — proto je tu
//    natvrdo, nezávisle na NEXT_PUBLIC_POSTHOG_HOST.
const POSTHOG_APP_HOST = "https://eu.posthog.com";
const CURRENCIES = ["CZK", "EUR", "USD"] as const;
type Currency = (typeof CURRENCIES)[number];

function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(todayKey(d));
  }
  return days;
}

async function runHogQL<Row extends unknown[] = unknown[]>(query: string): Promise<Row[]> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("PostHog není nakonfigurován (chybí POSTHOG_PERSONAL_API_KEY nebo POSTHOG_PROJECT_ID).");
  }

  const res = await fetch(`${POSTHOG_APP_HOST}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PostHog dotaz selhal (${res.status}): ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  return (json.results ?? []) as Row[];
}

export type AnalyticsSummary = {
  rangeDays: number;
  visits: { date: string; pageviews: number; visitors: number }[];
  topPages: { path: string; count: number }[];
  topReferrers: { host: string; count: number }[];
  topCampaigns: { source: string; campaign: string | null; count: number }[];
  devices: { device: string; count: number }[];
  orders: { date: string; count: number }[];
  revenueByCurrency: Record<string, number>;
  revenueAllTimeByCurrency: Record<string, number>;
  topProducts: { slug: string; name: string; quantity: number }[];
  // Vyhledávání na webu (search_performed / search_zero_results z overlaye i
  // /hledani). `topSearches` = co lidi hledají nejčastěji; `zeroSearches` =
  // dotazy BEZ výsledku — přímý zdroj pro doplňování synonym a odhalování děr
  // v katalogu (viz lib/productSearch.ts).
  topSearches: { query: string; count: number }[];
  zeroSearches: { query: string; count: number }[];
  totalVisits: number;
  totalUniqueVisitors: number;
  totalOrders: number;
};

// Krátká cache, stejně jako měl starý Redis-based getAnalyticsSummary —
// ušetří opakované dotazy do PostHogu při přepínání záložek v adminu.
const summaryCache = new Map<number, { data: AnalyticsSummary; time: number }>();
const CACHE_TTL = 60 * 1000;

export async function getAnalyticsSummary(rangeDays: number = 30): Promise<AnalyticsSummary> {
  const cached = summaryCache.get(rangeDays);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;

  const days = lastNDays(rangeDays);

  const [
    dailyVisits,
    dailyOrders,
    revenueRange,
    revenueAllTime,
    referrers,
    campaigns,
    pages,
    devices,
    products,
    topSearches,
    zeroSearches,
  ] = await Promise.all([
    runHogQL<[string, number, number]>(`
      SELECT toDate(timestamp) AS day, count() AS pageviews, count(DISTINCT distinct_id) AS visitors
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY day ORDER BY day
    `),
    runHogQL<[string, number]>(`
      SELECT toDate(timestamp) AS day, count() AS orders
      FROM events
      WHERE event = 'order_completed' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY day ORDER BY day
    `),
    runHogQL<[string, number]>(`
      SELECT properties.currency AS currency, sum(toFloat(properties.revenue)) AS revenue
      FROM events
      WHERE event = 'order_completed' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY currency
    `),
    runHogQL<[string, number]>(`
      SELECT properties.currency AS currency, sum(toFloat(properties.revenue)) AS revenue
      FROM events
      WHERE event = 'order_completed'
      GROUP BY currency
    `),
    runHogQL<[string | null, number]>(`
      SELECT properties.$referring_domain AS referrer, count() AS count
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY referrer ORDER BY count DESC LIMIT 10
    `),
    runHogQL<[string, string | null, number]>(`
      SELECT properties.utm_source AS source, properties.utm_campaign AS campaign, count() AS count
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
        AND properties.utm_source IS NOT NULL AND properties.utm_source != ''
      GROUP BY source, campaign ORDER BY count DESC LIMIT 10
    `),
    runHogQL<[string, number]>(`
      SELECT properties.$pathname AS path, count() AS count
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY path ORDER BY count DESC LIMIT 10
    `),
    runHogQL<[string | null, number]>(`
      SELECT properties.$device_type AS device, count() AS count
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
      GROUP BY device ORDER BY count DESC
    `),
    runHogQL<[string, string, number]>(`
      SELECT properties.slug AS slug, any(properties.name) AS name, sum(toInt(properties.quantity)) AS quantity
      FROM events
      WHERE event = 'product_purchased'
      GROUP BY slug ORDER BY quantity DESC LIMIT 10
    `),
    runHogQL<[string, number]>(`
      SELECT properties.query AS query, count() AS count
      FROM events
      WHERE event = 'search_performed' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
        AND properties.query IS NOT NULL AND properties.query != ''
      GROUP BY query ORDER BY count DESC LIMIT 10
    `),
    runHogQL<[string, number]>(`
      SELECT properties.query AS query, count() AS count
      FROM events
      WHERE event = 'search_zero_results' AND timestamp >= now() - INTERVAL ${rangeDays} DAY
        AND properties.query IS NOT NULL AND properties.query != ''
      GROUP BY query ORDER BY count DESC LIMIT 10
    `),
  ]);

  const visitsByDay = new Map(dailyVisits.map(([day, pageviews, visitors]) => [day, { pageviews, visitors }]));
  const ordersByDay = new Map(dailyOrders.map(([day, count]) => [day, count]));

  const visits = days.map((date) => ({
    date,
    pageviews: visitsByDay.get(date)?.pageviews ?? 0,
    visitors: visitsByDay.get(date)?.visitors ?? 0,
  }));
  const orders = days.map((date) => ({ date, count: ordersByDay.get(date) ?? 0 }));

  const revenueByCurrency: Record<string, number> = {};
  const revenueAllTimeByCurrency: Record<string, number> = {};
  for (const cur of CURRENCIES) {
    revenueByCurrency[cur] = 0;
    revenueAllTimeByCurrency[cur] = 0;
  }
  for (const [currency, revenue] of revenueRange) {
    const cur = currency?.toUpperCase() as Currency | undefined;
    if (cur && CURRENCIES.includes(cur)) revenueByCurrency[cur] = Math.round((revenue || 0) * 100) / 100;
  }
  for (const [currency, revenue] of revenueAllTime) {
    const cur = currency?.toUpperCase() as Currency | undefined;
    if (cur && CURRENCIES.includes(cur)) revenueAllTimeByCurrency[cur] = Math.round((revenue || 0) * 100) / 100;
  }

  const summary: AnalyticsSummary = {
    rangeDays,
    visits,
    topPages: pages.map(([path, count]) => ({ path, count })),
    topReferrers: referrers.map(([host, count]) => ({
      host: !host || host === "$direct" ? "Přímá návštěva (bez odkazu)" : host,
      count,
    })),
    topCampaigns: campaigns.map(([source, campaign, count]) => ({ source, campaign, count })),
    devices: devices.map(([device, count]) => ({ device: device || "Neznámé", count })),
    orders,
    revenueByCurrency,
    revenueAllTimeByCurrency,
    topProducts: products.map(([slug, name, quantity]) => ({ slug, name: name || slug, quantity })),
    topSearches: topSearches.map(([query, count]) => ({ query, count })),
    zeroSearches: zeroSearches.map(([query, count]) => ({ query, count })),
    totalVisits: visits.reduce((s, v) => s + v.pageviews, 0),
    totalUniqueVisitors: visits.reduce((s, v) => s + v.visitors, 0),
    totalOrders: orders.reduce((s, o) => s + o.count, 0),
  };

  summaryCache.set(rangeDays, { data: summary, time: Date.now() });
  return summary;
}
