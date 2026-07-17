"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Check } from "lucide-react";
import { useT } from "@/lib/useT";

export default function ChatWidget() {
  const pathname = usePathname();
  const t = useT("chat");
  const tc = useT("common");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!name && !!email && !!message && !sending;

  // API vrací kód, ne hotovou větu — text se vybírá tady podle jazyka.
  // Neznámý kód spadne na obecné "nepovedlo se", ať nikdy neukážeme
  // "chat.neco" místo chyby.
  function messageForCode(code: unknown, minutes: unknown): string {
    switch (code) {
      case "invalid_name":  return t("errorInvalidName");
      case "invalid_email": return t("errorInvalidEmail");
      case "invalid_text":  return t("errorInvalidText");
      case "cooldown":      return t("errorCooldown", { minutes: typeof minutes === "number" ? minutes : 5 });
      default:              return t("errorFailed");
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, text: message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(messageForCode(data?.code, data?.minutes));
      }

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setName("");
        setEmail("");
        setMessage("");
        setOpen(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorFailed"));
    } finally {
      setSending(false);
    }
  }

  // V adminu widget vůbec nevykreslujeme.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Formulář */}
      {open && (
        <div className="bg-white rounded-2xl shadow-xl border border-border w-80 overflow-hidden">
          {/* Header */}
          {/* Hlavička sedí na růžové — bílý text by měl 2.14:1, tmavý má 8.94:1. */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-on-primary font-semibold text-sm">{t("title")}</p>
              <p className="text-on-primary/80 text-xs mt-0.5">{t("subtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("closeForm")}
              className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Obsah */}
          <div className="p-5">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={22} className="text-green-600" />
                </div>
                <p className="text-text-base font-semibold text-sm">{t("sentTitle")}</p>
                <p className="text-text-muted text-xs">{t("sentDesc")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                {/* Placeholder sám o sobě není spolehlivý přístupný název —
                    po vyplnění zmizí a čtečka pak pole nepojmenuje. */}
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  aria-label={t("namePlaceholder")}
                  autoComplete="name"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors bg-surface"
                />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  aria-label={t("emailPlaceholder")}
                  autoComplete="email"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors bg-surface"
                />
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  aria-label={t("messageLabel")}
                  rows={4}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none bg-surface"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    !canSubmit
                      ? "bg-border text-text-subtle cursor-not-allowed"
                      : "bg-primary text-on-primary hover:brightness-105"
                  }`}
                >
                  <Send size={14} aria-hidden="true" />
                  <span>{sending ? tc("sending") : t("submit")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tlačítko */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? t("closeChat") : t("openChat")}
        aria-expanded={open}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open ? "bg-text-base text-white" : "bg-primary text-on-primary hover:brightness-105 hover:scale-105"
        }`}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

    </div>
  );
}