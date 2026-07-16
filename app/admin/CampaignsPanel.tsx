"use client";

import { useEffect, useState } from "react";
import { Users, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

type CampaignSummary = {
  id: string;
  name: string | null;
  subject: string | null;
  status: string | null;
  sentAt: string | null;
};

type Context = {
  subscriberCount: number | null;
  recent: CampaignSummary[];
};

export default function CampaignsPanel() {
  const [ctx, setCtx] = useState<Context | null>(null);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function loadContext() {
    try {
      const res = await fetch("/api/admin/campaigns", { cache: "no-store" });
      if (res.ok) setCtx(await res.json());
    } catch {
      // Tiché — panel jen neukáže počet odběratelů.
    }
  }

  useEffect(() => {
    loadContext();
  }, []);

  async function handleSend() {
    if (sending) return;
    if (!subject.trim() || !body.trim()) {
      setNotice({ kind: "error", text: "Vyplň předmět i text kampaně." });
      return;
    }
    const count = ctx?.subscriberCount;
    const who = typeof count === "number" ? `${count} odběratel${count === 1 ? "e" : "ům"}` : "všem odběratelům";
    if (!confirm(`Opravdu rozeslat kampaň „${subject.trim()}" ${who}? Tuto akci nelze vzít zpět.`)) {
      return;
    }

    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), previewText: previewText.trim() || undefined, body: body.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setNotice({ kind: "success", text: "Kampaň byla odeslána. 🎉" });
        setSubject("");
        setPreviewText("");
        setBody("");
        loadContext();
      } else {
        setNotice({ kind: "error", text: data?.error ?? "Odeslání se nezdařilo." });
      }
    } catch {
      setNotice({ kind: "error", text: "Odeslání se nezdařilo. Zkontroluj připojení." });
    } finally {
      setSending(false);
    }
  }

  const subscriberCount = ctx?.subscriberCount;

  return (
    <div className="space-y-6">
      <p className="text-zinc-500 text-xs leading-relaxed max-w-lg">
        Rozešli novinku nebo akční nabídku všem odběratelům newsletteru. Odhlašovací
        odkaz přidá Resend do každého e-mailu automaticky.
      </p>

      {/* Počet odběratelů */}
      <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 border border-[#e5e7eb] rounded-xl px-4 py-3 w-fit">
        <Users size={15} className="text-primary-ink" />
        <span>
          Odběratelé:{" "}
          <strong className="text-[#0f0f10]">
            {typeof subscriberCount === "number" ? subscriberCount : "—"}
          </strong>
        </span>
      </div>

      {/* Formulář */}
      <div className="border border-[#e5e7eb] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#0f0f10]">Nová kampaň</h3>

        <div>
          <label className="block text-[10px] text-zinc-500 mb-1">Předmět e-mailu</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setNotice(null); }}
            placeholder="Např. Back to school — sleva 20 % na všechno"
            maxLength={200}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-xs text-[#0f0f10] focus:outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label className="block text-[10px] text-zinc-500 mb-1">
            Text náhledu <span className="text-zinc-400">(volitelné — krátký text vedle předmětu ve schránce)</span>
          </label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Např. Jen do neděle, na nic nečekej"
            maxLength={200}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-xs text-[#0f0f10] focus:outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label className="block text-[10px] text-zinc-500 mb-1">
            Text kampaně <span className="text-zinc-400">(prázdný řádek = nový odstavec)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setNotice(null); }}
            placeholder={"Ahoj,\n\nškola je za dveřmi a my máme něco, co ti ji osladí…"}
            rows={8}
            maxLength={20000}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-xs text-[#0f0f10] focus:outline-none focus:border-primary/50 resize-y leading-relaxed"
          />
        </div>

        {/* Náhled (jak to zhruba uvidí zákazník) */}
        {(subject.trim() || body.trim()) && (
          <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50 px-3 py-1.5 border-b border-[#e5e7eb]">
              Náhled
            </div>
            <div className="bg-white p-4">
              <div className="text-[#1c1c1c] font-extrabold text-sm mb-2">
                Hack<span className="text-primary-ink">Pack</span>
              </div>
              {subject.trim() && <div className="font-bold text-[#0f0f10] text-sm mb-2">{subject}</div>}
              <div className="text-zinc-600 text-xs leading-relaxed whitespace-pre-wrap">{body}</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-[#1c1c1c] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
          >
            <Send size={13} />
            {sending ? "Odesílám…" : "Rozeslat kampaň"}
          </button>
          {typeof subscriberCount === "number" && (
            <span className="text-[11px] text-zinc-400">→ {subscriberCount} odběratelů</span>
          )}
        </div>

        {notice && (
          <div
            className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 ${
              notice.kind === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-primary-ink border border-red-200"
            }`}
          >
            {notice.kind === "success" ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}
      </div>

      {/* Poslední kampaně */}
      {ctx?.recent && ctx.recent.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#0f0f10]">Poslední kampaně</h3>
          <div className="space-y-2">
            {ctx.recent.map((c) => (
              <div key={c.id} className="border border-[#e5e7eb] rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                <span className="text-xs text-[#0f0f10] truncate">{c.subject ?? c.name ?? "(bez předmětu)"}</span>
                <span className="text-[10px] text-zinc-400 shrink-0">{c.status ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
