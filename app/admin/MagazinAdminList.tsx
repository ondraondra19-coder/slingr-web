"use client";

// app/admin/MagazinAdminList.tsx
// Správa SEO článků magazínu — výpis, editor s živým náhledem, mazání.
// Nahrazuje starý natvrdo zapsaný lib/blog.ts.
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { parseBlogContent, splitBold, slugify } from "@/lib/blog";

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  img: string;
  content: string;
};

const EMPTY_FORM: FormState = { slug: "", title: "", excerpt: "", date: "", tag: "", img: "", content: "" };

function toForm(post: BlogPost): FormState {
  return { slug: post.slug, title: post.title, excerpt: post.excerpt, date: post.date, tag: post.tag, img: post.img, content: post.content };
}

// Datum se ukládá a zobrazuje na webu jako "22. 4. 2026" (kvůli zpětné
// kompatibilitě se staršími články), ale v editoru je pohodlnější klasický
// kalendář, kam se píšou jen čísla — tyhle dvě funkce mezi tvary převádí.
function czechDateToInputValue(czech: string): string {
  const m = czech.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!m) return "";
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function inputValueToCzechDate(value: string): string {
  if (!value) return "";
  const [y, mo, d] = value.split("-");
  return `${Number(d)}. ${Number(mo)}. ${y}`;
}

// ── Živý náhled — stejná logika jako na webu (parseBlogContent + splitBold) ─
function ContentPreview({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlogContent(text || ""), [text]);

  function renderInline(t: string) {
    return splitBold(t).map((part, i) => (part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>));
  }

  if (!text.trim()) return <p className="text-xs text-zinc-400 italic">Náhled se objeví, jakmile začneš psát obsah.</p>;

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === "heading") return <h3 key={i} className="text-lg font-bold text-[#0f0f10]">{renderInline(block.text)}</h3>;
        if (block.type === "list") return (
          <ul key={i} className="list-disc list-inside space-y-1 text-sm text-zinc-600">
            {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
          </ul>
        );
        return <p key={i} className="text-sm text-zinc-600 leading-relaxed">{renderInline(block.text)}</p>;
      })}
    </div>
  );
}

export default function MagazinAdminList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // null = seznam, "new" = nový článek, string = editace existujícího slugu
  const [editingSlug, setEditingSlug] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      if (!res.ok) throw new Error("Nepodařilo se načíst články.");
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při načítání.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    const today = new Date();
    setForm({ ...EMPTY_FORM, date: `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}` });
    setSlugTouched(false);
    setEditingSlug("new");
  }

  function openEdit(post: BlogPost) {
    setForm(toForm(post));
    setSlugTouched(true); // u existujícího článku se slug needituje
    setEditingSlug(post.slug);
  }

  function closeEditor() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Slug se dopočítává automaticky z názvu, dokud ho admin sám neupraví.
      if (key === "title" && editingSlug === "new" && !slugTouched) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      alert("Vyplň prosím název článku.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingSlug === "new";
      const res = await fetch(isNew ? "/api/admin/blog" : `/api/admin/blog/${editingSlug}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Uložení se nezdařilo.");

      if (isNew) {
        setPosts((prev) => [data.post, ...prev]);
      } else {
        setPosts((prev) => prev.map((p) => (p.slug === data.post.slug ? data.post : p)));
      }
      closeEditor();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Uložení se nezdařilo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Opravdu smazat článek „${post.title}“? Tohle nejde vrátit zpět.`)) return;
    try {
      const res = await fetch(`/api/admin/blog/${post.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Smazání se nezdařilo.");
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Smazání se nezdařilo.");
    }
  }

  if (loading) return <p className="text-xs text-zinc-400">Načítám články…</p>;
  if (error) return <p className="text-xs text-red-500">{error}</p>;

  // ── Editor (nový / úprava) ─────────────────────────────────────────────
  if (editingSlug !== null) {
    const isNew = editingSlug === "new";
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#0f0f10]">{isNew ? "Nový článek" : "Upravit článek"}</h4>
          <button onClick={closeEditor} aria-label="Zavřít editor článku" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Formulář */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Název článku</label>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Např. 5 tipů, jak prodloužit výdrž baterie"
                className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2"
              />
            </div>

            {isNew && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                  URL adresa (slug) — {slugTouched ? "upraveno ručně" : "dopočítá se automaticky"}
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); updateField("slug", slugify(e.target.value)); }}
                  placeholder="5-tipu-jak-prodlouzit-vydrz-baterie"
                  className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Datum</label>
                <input
                  type="date"
                  value={czechDateToInputValue(form.date)}
                  onChange={(e) => updateField("date", inputValueToCzechDate(e.target.value))}
                  className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Štítek</label>
                <input
                  value={form.tag}
                  onChange={(e) => updateField("tag", e.target.value)}
                  placeholder="Průvodce / Recenze / Tipy / Aktuálně"
                  list="magazin-tags"
                  className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2"
                />
                <datalist id="magazin-tags">
                  <option value="Průvodce" /><option value="Recenze" /><option value="Tipy" /><option value="Aktuálně" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Odkaz na fotku</label>
              <input
                value={form.img}
                onChange={(e) => updateField("img", e.target.value)}
                placeholder="/images/blog/nazev.jpg nebo https://…"
                className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2"
              />
              {form.img && (
                <div className="relative w-full aspect-video mt-2 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                  <Image src={form.img} alt="" fill className="object-cover" unoptimized onError={() => {}} />
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Krátký popisek (excerpt)</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                rows={2}
                placeholder="Krátká anotace, co se v článku dozví — zobrazuje se ve výpisu."
                className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-zinc-500">Obsah</label>
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="lg:hidden text-[11px] font-semibold text-zinc-500 flex items-center gap-1"
                >
                  {showPreview ? <EyeOff size={12} /> : <Eye size={12} />} {showPreview ? "Skrýt náhled" : "Zobrazit náhled"}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mb-1.5">
                <code className="bg-zinc-100 px-1 rounded">## Nadpis</code> na vlastním řádku = nadpis ·{" "}
                <code className="bg-zinc-100 px-1 rounded">- text</code> = odrážka ·{" "}
                <code className="bg-zinc-100 px-1 rounded">**text**</code> = tučně · prázdný řádek odděluje odstavce
              </p>
              <textarea
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={16}
                placeholder={"## První nadpis\n\nText odstavce s **tučným** slovem.\n\n- první bod\n- druhý bod"}
                className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2 font-mono resize-y"
              />
            </div>
          </div>

          {/* Živý náhled */}
          <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-4 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Náhled</p>
                <h2 className="text-xl font-extrabold text-[#0f0f10] leading-tight">{form.title || "Název článku"}</h2>
                <p className="text-xs text-zinc-500 mt-1">{form.date || "Datum"} {form.tag && `· ${form.tag}`}</p>
              </div>
              {form.img && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100">
                  <Image src={form.img} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="border-t border-zinc-100 pt-4">
                <ContentPreview text={form.content} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#0f0f10] text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Ukládám…" : isNew ? "Publikovat článek" : "Uložit změny"}
          </button>
          <button onClick={closeEditor} className="text-xs font-semibold px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors">
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  // ── Seznam článků ────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-400">{posts.length} článků</p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f0f10] text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus size={14} /> Nový článek
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6 text-center">Zatím žádné články. Klikni na „Nový článek" a napiš první.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.slug} className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                {post.img && <Image src={post.img} alt="" fill className="object-cover" unoptimized />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0f0f10] truncate">{post.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{post.date} {post.tag && `· ${post.tag}`}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(post)} aria-label={`Upravit článek: ${post.title}`} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-[#0f0f10] transition-colors">
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button onClick={() => handleDelete(post)} aria-label={`Smazat článek: ${post.title}`} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}