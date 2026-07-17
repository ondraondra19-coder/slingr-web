"use client";

// components/legal/LegalLayout.tsx
// Společná kostra právních stránek: drobečky, titulek, datum účinnosti,
// doložka o závazné verzi a typografie sekcí.
//
// Text samotný je v content/legal/*.tsx zvlášť pro každý jazyk — právní próza
// je prošpikovaná <strong>, <a> a seznamy a do JSON by se dala nacpat jen jako
// HTML v řetězcích, což by nikdo nezkontroloval ani nepřeložil.

import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/useT";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-text-base mb-5 pb-3 border-b border-border">{title}</h2>
      <div className="flex flex-col gap-4 text-text-muted text-base leading-relaxed [&_strong]:text-text-base [&_a]:text-primary-ink [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </div>
  );
}

export default function LegalLayout({
  title,
  effectiveFrom,
  children,
}: {
  title: string;
  effectiveFrom: string;
  children: React.ReactNode;
}) {
  const t = useT("legal");

  return (
    <main className="min-h-screen bg-dark">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">

        <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
          <a href="/" className="hover:text-text-muted transition-colors">{t("home")}</a>
          <ChevronRight size={12} className="text-border" aria-hidden="true" />
          <span className="text-text-muted">{title}</span>
        </nav>

        <h1 className="text-4xl font-extrabold text-text-base mb-2">{title}</h1>
        <p className="text-text-subtle text-sm mb-8">{t("effectiveFrom", { date: effectiveFrom })}</p>

        {/* Doložka o závazné verzi. Překlad je vstřícnost k zákazníkovi, ale
            závazná je česká verze — u sporu se soud opírá o ni. Bez tohohle by
            šlo argumentovat nepřesností překladu. V češtině se doložka
            nezobrazuje: tam je závazný text právě ten, který zákazník čte. */}
        {t.locale !== "cs" && (
          <div className="mb-12 rounded-xl border border-border bg-surface px-5 py-4">
            <p className="text-text-muted text-sm leading-relaxed">{t("bindingVersion")}</p>
          </div>
        )}

        {children}

      </div>
    </main>
  );
}
