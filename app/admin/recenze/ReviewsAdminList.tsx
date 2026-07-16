"use client";

import { useState } from "react";
import type { Review } from "@/lib/reviews";
import { parseUserAgent } from "@/lib/parseUserAgent";

type ReviewsAdminListProps = {
  reviews: Review[];
  onDeleted: (id: string) => void;
};

export default function ReviewsAdminList({ reviews, onDeleted }: ReviewsAdminListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat tuto recenzi?")) return;

    setDeletingId(id);
    setError(null);

    const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Smazání se nezdařilo.");
      setDeletingId(null);
      return;
    }

    // Smaže se okamžitě ze stavu v rodiči — recenze díky tomu zmizí hned
    // a zůstane pryč i po přepnutí mezi taby (žádný návrat ke starým datům).
    onDeleted(id);
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-zinc-500">Žádné recenze.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-primary-ink">{error}</p>}

      {reviews.map((review) => (
        <div
          key={review.id}
          className="border border-[#e5e7eb] rounded-xl p-4 flex justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-[#0f0f10]">{review.name}</span>
              <span className="text-amber-500 text-xs tracking-tight">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
              <span className="text-[11px] text-zinc-400">
                {new Date(review.date).toLocaleDateString("cs-CZ")}
              </span>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap mb-2">
              {review.text}
            </p>

            <div className="text-[11px] text-zinc-400">
              {review.email && (
                <>
                  <a href={`mailto:${review.email}`} className="hover:text-[#0f0f10] hover:underline">
                    {review.email}
                  </a>
                  <span className="mx-1.5">·</span>
                </>
              )}
              <span>{parseUserAgent(review.userAgent)}</span>
            </div>
          </div>

          <button
            onClick={() => handleDelete(review.id)}
            disabled={deletingId === review.id}
            className="shrink-0 self-start text-xs font-semibold text-primary-ink hover:text-primary-ink/80 disabled:opacity-50"
          >
            {deletingId === review.id ? "Mažu…" : "Smazat"}
          </button>
        </div>
      ))}
    </div>
  );
}