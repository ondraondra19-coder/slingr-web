"use client";

// app/admin/adminWidgets.tsx
// Sdílené prezentační kousky admin panelu — používá je AnalyticsPanel.tsx
// i DashboardHome.tsx, ať se stejná karta/graf/tabulka nekopíruje na dvou místech.

import { useState } from "react";

const CURRENCY_LABELS: Record<string, string> = { CZK: "Kč", EUR: "€", USD: "$" };

export function formatMoney(value: number, currency: string): string {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("cs-CZ")} ${CURRENCY_LABELS[currency] ?? currency}`;
}

export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

// ── Jednoduchý sloupcový graf bez externí knihovny ─────────────────────────
// Tooltip se ukazuje na hover (myš) i na tap (dotyk) — na mobilu hover neexistuje,
// proto potřebuje aktivní sloupec i vlastní state.
export function BarChart({ data, color = "#2563eb" }: { data: { date: string; count: number }[]; color?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-[2px] h-32 w-full">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center justify-end h-full group relative"
          onClick={() => setActiveIndex((prev) => (prev === i ? null : i))}
        >
          <div
            className="w-full rounded-t-sm transition-colors"
            style={{
              height: `${Math.max(2, (d.count / max) * 100)}%`,
              backgroundColor: color,
              opacity: 0.85,
            }}
          />
          <div
            className={`absolute -top-6 bg-[#0f0f10] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 group-hover:block ${
              activeIndex === i ? "block" : "hidden"
            }`}
          >
            {formatDateShort(d.date)}: {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <h4 className="text-xs font-bold text-[#0f0f10]">{title}</h4>
        {action}
      </div>
      {subtitle && <p className="text-[11px] text-zinc-500 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <p className="text-[11px] text-zinc-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-[#0f0f10]">{value}</p>
      {hint && <p className="text-[10px] text-zinc-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export function RankedTable({ rows, emptyLabel }: { rows: { label: string; value: number }[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="text-[11px] text-zinc-400">{emptyLabel}</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="flex-1 truncate text-[#0f0f10]">{r.label}</span>
          <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="text-zinc-500 w-8 text-right shrink-0">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
