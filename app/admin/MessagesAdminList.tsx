"use client";

import { useState } from "react";
import { ChevronDown, Reply } from "lucide-react";
import type { Message } from "@/lib/messages";

type MessagesAdminListProps = {
  messages: Message[];
  onChange: (messages: Message[]) => void;
};

function ReplyForm({ msg, onSent, onCancel }: { msg: Message; onSent: () => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, replyText: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Odeslání se nezdařilo.");
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání se nezdařilo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
      {error && <p className="text-xs text-primary-ink mb-2">{error}</p>}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Odpověď pro ${msg.name}…`}
        rows={3}
        autoFocus
        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-xs text-[#0f0f10] focus:outline-none focus:border-primary/50 resize-none"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          disabled={sending}
          className="text-xs font-semibold text-zinc-500 hover:text-[#0f0f10] disabled:opacity-50 px-2"
        >
          Zrušit
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="bg-[#1c1c1c] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
        >
          {sending ? "Odesílám…" : "Odeslat odpověď"}
        </button>
      </div>
    </div>
  );
}

function MessageCard({
  msg,
  busy,
  onToggleRead,
  onDelete,
  onReplied,
}: {
  msg: Message;
  busy: boolean;
  onToggleRead: (msg: Message) => void;
  onDelete: (id: string) => void;
  onReplied: (id: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [justReplied, setJustReplied] = useState(false);

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        msg.read ? "border-[#e5e7eb] bg-white" : "border-zinc-300 bg-[#fafafa]"
      }`}
    >
      <div className="flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
            <span className="text-sm font-semibold text-[#0f0f10]">{msg.name}</span>
            <span className="text-[11px] text-zinc-400">
              {new Date(msg.date).toLocaleString("cs-CZ")}
            </span>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap mb-2">
            {msg.text}
          </p>

          <a href={`mailto:${msg.email}`} className="text-[11px] text-zinc-400 hover:text-[#0f0f10] hover:underline">
            {msg.email}
          </a>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => setReplying((v) => !v)}
            disabled={busy}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-[#0f0f10] disabled:opacity-50"
          >
            <Reply size={12} /> Odpovědět
          </button>
          <button
            onClick={() => onToggleRead(msg)}
            disabled={busy}
            className="text-xs font-semibold text-zinc-500 hover:text-[#0f0f10] disabled:opacity-50"
          >
            {msg.read ? "Označit jako nepřečtené" : "Označit jako přečtené"}
          </button>
          <button
            onClick={() => onDelete(msg.id)}
            disabled={busy}
            className="text-xs font-semibold text-primary-ink hover:text-primary-ink/80 disabled:opacity-50"
          >
            {busy ? "Pracuji…" : "Smazat"}
          </button>
        </div>
      </div>

      {replying && !justReplied && (
        <ReplyForm
          msg={msg}
          onCancel={() => setReplying(false)}
          onSent={() => {
            setReplying(false);
            setJustReplied(true);
            onReplied(msg.id);
          }}
        />
      )}

      {justReplied && (
        <p className="mt-3 pt-3 border-t border-[#e5e7eb] text-xs font-semibold text-green-600">
          Odpověď odeslána na {msg.email}.
        </p>
      )}
    </div>
  );
}

export default function MessagesAdminList({ messages, onChange }: MessagesAdminListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRead, setShowRead] = useState(false);

  async function handleToggleRead(msg: Message) {
    setBusyId(msg.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, read: !msg.read }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Úprava se nezdařila.");
      }
      onChange(messages.map((m) => (m.id === msg.id ? { ...m, read: !msg.read } : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Úprava se nezdařila.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat tuto zprávu?")) return;

    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Smazání se nezdařilo.");
      }
      onChange(messages.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Smazání se nezdařilo.");
    } finally {
      setBusyId(null);
    }
  }

  function handleReplied(id: string) {
    onChange(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }

  if (messages.length === 0) {
    return <p className="text-sm text-zinc-500">Zatím žádné zprávy.</p>;
  }

  const unread = messages.filter((m) => !m.read);
  const read = messages.filter((m) => m.read);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-primary-ink">{error}</p>}

      {unread.length === 0 && (
        <p className="text-sm text-zinc-500">Žádné nové zprávy.</p>
      )}

      {unread.map((msg) => (
        <MessageCard
          key={msg.id}
          msg={msg}
          busy={busyId === msg.id}
          onToggleRead={handleToggleRead}
          onDelete={handleDelete}
          onReplied={handleReplied}
        />
      ))}

      {read.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowRead((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-1 py-2 text-xs font-semibold text-zinc-500 hover:text-[#0f0f10] transition-colors"
          >
            <span>
              Přečtené zprávy <span className="text-zinc-400 font-normal">({read.length})</span>
            </span>
            <ChevronDown size={15} className={`transition-transform duration-150 ${showRead ? "rotate-180" : ""}`} />
          </button>

          {showRead && (
            <div className="space-y-3 mt-1">
              {read.map((msg) => (
                <MessageCard
                  key={msg.id}
                  msg={msg}
                  busy={busyId === msg.id}
                  onToggleRead={handleToggleRead}
                  onDelete={handleDelete}
                  onReplied={handleReplied}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
