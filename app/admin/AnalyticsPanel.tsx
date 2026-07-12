"use client";

// app/admin/AnalyticsPanel.tsx
// Záložka "Analytika" v admin panelu. Načítá souhrn z /api/admin/analytics,
// který data čte z PostHogu (HogQL Query API).
//
// Návštěvnost (pageviews, unikátní návštěvníci, zdroje, zařízení) obsahuje
// jen data od návštěvníků, kteří odsouhlasili analytické cookies — pokud
// jsou čísla nízká, je to prostě proto, že málo lidí souhlas dá, ne chyba.
//
// Obchod (tržby, objednávky, top produkty) běží nezávisle na cookies —
// je to napojené na Stripe webhook, který zaznamená každou dokončenou platbu.

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/posthog-query";
import { BarChart, SectionCard, StatCard, RankedTable, formatMoney } from "./adminWidgets";

const RANGE_OPTIONS = [
  { days: 7, label: "7 dní" },
  { days: 30, label: "30 dní" },
  { days: 90, label: "90 dní" },
];

export default function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Nepodařilo se načíst statistiky.");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chyba při načítání.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
          Návštěvnost se počítá jen u návštěvníků, kteří odsouhlasili analytické cookies. Tržby a objednávky
          se zaznamenávají u každé dokončené platby bez ohledu na souhlas.
        </p>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 shrink-0">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                days === opt.days ? "bg-white shadow-sm text-[#0f0f10]" : "text-zinc-500 hover:text-[#0f0f10]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-xs text-zinc-400">Načítám statistiky…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {data && !loading && (
        <>
          {/* Souhrnné karty */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Zobrazení stránek" value={String(data.totalVisits)} hint={`za ${days} dní`} />
            <StatCard label="Unikátní návštěvníci" value={String(data.totalUniqueVisitors)} hint={`za ${days} dní`} />
            <StatCard label="Objednávky" value={String(data.totalOrders)} hint={`za ${days} dní`} />
            {Object.entries(data.revenueByCurrency)
              .filter(([, v]) => v > 0)
              .slice(0, 1)
              .map(([cur, v]) => (
                <StatCard key={cur} label={`Tržby (${cur})`} value={formatMoney(v, cur)} hint={`za ${days} dní`} />
              ))}
          </div>

          {/* Grafy návštěvnosti a objednávek */}
          <div className="grid md:grid-cols-2 gap-3">
            <SectionCard title="Návštěvnost" subtitle="Denní zobrazení stránek — jen se souhlasem cookies">
              <BarChart data={data.visits.map((v) => ({ date: v.date, count: v.pageviews }))} color="#2563eb" />
            </SectionCard>
            <SectionCard title="Objednávky" subtitle="Denní počet dokončených plateb">
              <BarChart data={data.orders} color="#ea580c" />
            </SectionCard>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <SectionCard title="Zařízení" subtitle={`Za ${days} dní, podle typu zařízení`}>
              <RankedTable
                rows={data.devices.map((d) => ({ label: d.device, value: d.count }))}
                emptyLabel="Zatím žádná data."
              />
            </SectionCard>
            <SectionCard title="Odkud přichází návštěvnost" subtitle={`Weby, ze kterých na vás lidé klikli — za ${days} dní`}>
              <RankedTable
                rows={data.topReferrers.map((r) => ({ label: r.host, value: r.count }))}
                emptyLabel="Zatím žádná data."
              />
            </SectionCard>
          </div>

          <SectionCard title="Reklamní kampaně" subtitle={`Návštěvy z odkazů označených jako reklama/kampaň — za ${days} dní`}>
            <RankedTable
              rows={data.topCampaigns.map((c) => ({
                label: c.campaign ? `${c.source} / ${c.campaign}` : c.source,
                value: c.count,
              }))}
              emptyLabel="Zatím žádná návštěva z označené reklamní kampaně."
            />
          </SectionCard>

          {/* Tabulky */}
          <SectionCard title="Nejnavštěvovanější stránky" subtitle={`Za ${days} dní`}>
            <RankedTable
              rows={data.topPages.map((p) => ({ label: p.path === "/" ? "Domovská stránka (/)" : p.path, value: p.count }))}
              emptyLabel="Zatím žádná data — buď málo návštěv, nebo nikdo nesouhlasil s cookies."
            />
          </SectionCard>

          <SectionCard title="Nejprodávanější produkty" subtitle="Celkově od spuštění sledování">
            <RankedTable
              rows={data.topProducts.map((p) => ({ label: p.name, value: p.quantity }))}
              emptyLabel="Zatím žádné dokončené objednávky."
            />
          </SectionCard>

          {/* Tržby all-time */}
          <SectionCard title="Celkové tržby" subtitle="Od spuštění sledování, po měnách">
            <div className="flex gap-4 flex-wrap">
              {Object.entries(data.revenueAllTimeByCurrency)
                .filter(([, v]) => v > 0)
                .map(([cur, v]) => (
                  <div key={cur} className="text-sm font-bold text-[#0f0f10]">
                    {formatMoney(v, cur)}
                  </div>
                ))}
              {Object.values(data.revenueAllTimeByCurrency).every((v) => v === 0) && (
                <p className="text-[11px] text-zinc-400">Zatím žádné dokončené objednávky.</p>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}