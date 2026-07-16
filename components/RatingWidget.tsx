"use client";

import { useState, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";

type StoredReview = { rating: number };

export default function RatingWidget() {
  const [avg, setAvg] = useState<number | null>(null);
  const [recommend, setRecommend] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        const reviews: StoredReview[] = data.reviews ?? [];
        if (reviews.length === 0) { setAvg(null); setRecommend(null); setTotal(0); return; }
        const sum = reviews.reduce((a, r) => a + r.rating, 0);
        const average = Math.round((sum / reviews.length) * 10) / 10;
        const positiveCount = reviews.filter(r => r.rating >= 3).length;
        const pct = Math.round((positiveCount / reviews.length) * 100);
        setAvg(average);
        setRecommend(pct);
        setTotal(reviews.length);
      })
      .catch(() => {});
  }, []);

  const fullStars = avg !== null ? Math.floor(avg) : 0;
  const fraction = avg !== null ? avg % 1 : 0;
  const emptyStars = avg !== null ? 5 - fullStars - (fraction > 0 ? 1 : 0) : 5;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden relative">
      <div className="flex flex-col gap-0">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <p className="text-text-subtle text-xs font-semibold uppercase tracking-widest">Hodnocení obchodu</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {avg === null ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="fill-border text-border" />
                ))}
              </div>
              <p className="text-text-subtle text-xs">Zatím žádné hodnocení</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-extrabold text-text-base leading-none">{avg}</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <Star key={`f${i}`} size={18} className="fill-amber-400 text-amber-400" />
                    ))}
                    {fraction > 0 && (
                      <span className="relative inline-block w-[18px] h-[18px]">
                        <Star size={18} className="fill-border text-border absolute inset-0" />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.round(fraction * 100)}%` }}>
                          <Star size={18} className="fill-amber-400 text-amber-400" />
                        </span>
                      </span>
                    )}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                      <Star key={`e${i}`} size={18} className="fill-border text-border" />
                    ))}
                  </div>
                  <p className="text-text-subtle text-xs">{total} hodnocení</p>
                </div>
              </div>
              <div className="bg-surface rounded-xl px-4 py-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-primary-ink">{recommend}%</span>
                </div>
                <p className="text-text-muted text-sm mt-1 leading-relaxed">zákazníků by doporučilo náš obchod</p>
                <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${recommend}%` }} />
                </div>
              </div>
            </>
          )}
          <a href="/napsat-recenzi" className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:brightness-105 transition-all">
            Napsat recenzi
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}