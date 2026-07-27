"use client";

// Stavová stránka objednávky (/objednavky) — zákazník dohledá stav své
// objednávky podle čísla objednávky (variabilní symbol z potvrzení) a e-mailu.
// Data tahá z /api/orders/status, který ověří obojí a vrátí jen bezpečný výřez
// (žádnou adresu ani telefon). Stav objednávky MĚNÍ admin, tady se jen zobrazuje.

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import React, { useRef, useState } from "react";
import {
    ChevronRight, Package, Truck, MapPin, CheckCircle2, Clock,
    Search, AlertCircle, XCircle, ExternalLink, Mail, RotateCcw,
} from "lucide-react";
import { useT, type T } from "@/lib/useT";
import { isValidEmail } from "@/lib/emailValidation";
import { CURRENCIES, formatPrice, type CurrencyCode } from "@/lib/currency";
import { paymentLabel } from "@/lib/shippingLabels";

// ── Typy ────────────────────────────────────────────────────────────────────

type OrderStatus = "nova" | "zabalena" | "odeslana" | "na_ceste" | "dorucena" | "zrusena";

type StatusOrder = {
    number: string;
    createdAt: number;
    status: OrderStatus;
    paymentStatus: "zaplaceno" | "ceka_na_platbu" | "zaplatit_pri_prevzeti";
    paymentMethod: "karta" | "dobirka" | "prevod";
    currency: string;
    total: number;
    shippingName: string;
    items: { name: string; quantity: number }[];
    tracking: { number: string; url: string | null } | null;
};

// Pořadí kroků, kterými objednávka prochází. "zrusena" tu není — je to
// oddělený koncový stav, který timeline nahradí (viz níže).
const TIMELINE: { status: OrderStatus; icon: typeof Package }[] = [
    { status: "nova", icon: CheckCircle2 },
    { status: "zabalena", icon: Package },
    { status: "odeslana", icon: Truck },
    { status: "na_ceste", icon: MapPin },
    { status: "dorucena", icon: CheckCircle2 },
];

// ── Pomůcky ──────────────────────────────────────────────────────────────────

function isValidOrderFormat(value: string): boolean {
    return /^\d{4,12}$/.test(value.replace(/\s+/g, ""));
}

function currencyOf(code: string) {
    return CURRENCIES[code as CurrencyCode] ?? CURRENCIES.CZK;
}

// ── UI kousky ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-subtle mb-3">{children}</p>;
}

function Field({
    label, name, value, onChange, placeholder, error, type = "text", inputMode,
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; error?: string; type?: string;
    inputMode?: "text" | "numeric" | "email";
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">{label} *</label>
            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                error ? "border-red-400" : "border-border focus-within:border-primary/50"
            }`}>
                <input
                    name={name} type={type} value={value} onChange={onChange}
                    placeholder={placeholder} inputMode={inputMode}
                    className="flex-1 bg-surface px-4 py-3 text-sm text-text-base placeholder-text-subtle focus:outline-none"
                />
            </div>
            {error && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle size={11} /> {error}</p>}
        </div>
    );
}

// Vizuální stavová osa objednávky.
function StatusTimeline({ order, t }: { order: StatusOrder; t: T }) {
    if (order.status === "zrusena") {
        return (
            <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle size={22} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-extrabold text-red-700 mb-1">{t("status_zrusena")}</p>
                    <p className="text-xs text-red-600/80 leading-relaxed">{t("cancelledDesc")}</p>
                </div>
            </div>
        );
    }

    const currentIndex = TIMELINE.findIndex((s) => s.status === order.status);

    return (
        <ol className="flex flex-col gap-0">
            {TIMELINE.map((step, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                const Icon = step.icon;
                return (
                    <li key={step.status} className="flex gap-4 relative">
                        {i < TIMELINE.length - 1 && (
                            <div className={`absolute left-[21px] top-11 w-0.5 h-[calc(100%-12px)] ${done ? "bg-primary" : "bg-border"}`} />
                        )}
                        <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center z-10 transition-colors ${
                            active ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                : done ? "bg-primary/15 text-primary-ink"
                                : "bg-surface border border-border text-text-subtle"
                        }`}>
                            <Icon size={18} />
                        </div>
                        <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold ${active || done ? "text-text-base" : "text-text-subtle"}`}>
                                    {t(`status_${step.status}`)}
                                </p>
                                {active && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-ink text-[10px] font-bold uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        {t("currentStep")}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-muted leading-snug mt-0.5">{t(`status_${step.status}_desc`)}</p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

// Výsledná karta se stavem nalezené objednávky.
function OrderResult({ order, email, onReset, t, tc }: { order: StatusOrder; email: string; onReset: () => void; t: T; tc: T }) {
    // Do reklamace propašujeme číslo objednávky i ověřený e-mail, ať je formulář
    // rovnou předvyplněný (viz čtení query paramů na /reklamace).
    const returnHref = `/reklamace?order=${encodeURIComponent(order.number)}&email=${encodeURIComponent(email)}`;
    const cur = currencyOf(order.currency);
    const paidLabel =
        order.paymentStatus === "zaplaceno" ? t("payPaid")
        : order.paymentStatus === "zaplatit_pri_prevzeti" ? t("payOnDelivery")
        : t("payAwaiting");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stavová osa */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                    <div>
                        <SectionLabel>{t("orderNumber")}</SectionLabel>
                        <p className="font-mono text-2xl font-black text-text-base">#{order.number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-subtle mb-1">{t("orderedOn")}</p>
                        <p className="text-sm font-semibold text-text-base">{new Date(order.createdAt).toLocaleDateString(t.locale)}</p>
                    </div>
                </div>

                <StatusTimeline order={order} t={t} />

                {/* Tracking */}
                {order.tracking && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 bg-surface rounded-xl border border-border px-5 py-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-subtle mb-0.5">{t("trackingNumber")}</p>
                            <p className="font-mono text-sm font-bold text-text-base">{order.tracking.number}</p>
                        </div>
                        {order.tracking.url && (
                            <a href={order.tracking.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:brightness-110 transition-all">
                                {t("trackShipment")} <ExternalLink size={13} />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Souhrn */}
            <div className="lg:col-span-1 flex flex-col gap-5">
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                    <SectionLabel>{t("summary")}</SectionLabel>
                    <div className="space-y-3 mb-4">
                        {order.items.map((it, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-text-base font-medium leading-snug">{it.name}</span>
                                <span className="text-text-subtle shrink-0 tabular-nums">{it.quantity}&nbsp;ks</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border pt-3 space-y-2">
                        <div className="flex justify-between text-xs text-text-muted">
                            <span>{tc("shipping")}</span>
                            <span>{order.shippingName}</span>
                        </div>
                        <div className="flex justify-between text-xs text-text-muted">
                            <span>{t("payment")}</span>
                            <span>{paymentLabel(tc, order.paymentMethod, order.paymentMethod)} · {paidLabel}</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-text-base pt-2 border-t border-border">
                            <span>{tc("total")}</span>
                            <span className="text-primary-ink tabular-nums">{formatPrice(order.total, cur)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                    <p className="text-xs text-text-muted leading-relaxed mb-4">{t("wrongOrderHint")}</p>
                    <div className="flex flex-col gap-2">
                        <button onClick={onReset}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-text-base font-bold text-xs hover:bg-border/50 transition-colors">
                            <Search size={13} /> {t("searchAnother")}
                        </button>
                        <Link href={returnHref}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border text-text-muted font-bold text-xs hover:bg-surface hover:text-text-base transition-colors">
                            <RotateCcw size={13} /> {t("returnLink")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Stránka ───────────────────────────────────────────────────────────────────

export default function StavObjednavkyPage() {
    const t = useT("orderStatus");
    const tc = useT("checkout");

    const [cisloObjednavky, setCisloObjednavky] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ cisloObjednavky?: string; email?: string }>({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [order, setOrder] = useState<StatusOrder | null>(null);
    const submittingRef = useRef(false);

    function messageForCode(code: unknown): string {
        switch (code) {
            case "invalid_order":
            case "invalid_order_format": return t("errOrderFormat");
            case "invalid_email":        return t("errEmailFormat");
            case "not_found":            return t("errNotFound");
            case "cooldown":             return t("errCooldown");
            default:                     return t("errFailed");
        }
    }

    function validate() {
        const e: { cisloObjednavky?: string; email?: string } = {};
        if (!cisloObjednavky.trim()) e.cisloObjednavky = t("errOrderRequired");
        else if (!isValidOrderFormat(cisloObjednavky)) e.cisloObjednavky = t("errOrderFormat");
        if (!email.trim()) e.email = t("errEmailRequired");
        else if (!isValidEmail(email)) e.email = t("errEmailFormat");
        return e;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submittingRef.current) return;

        const e2 = validate();
        if (Object.keys(e2).length > 0) { setErrors(e2); return; }

        submittingRef.current = true;
        setLoading(true);
        setSubmitError(null);
        setErrors({});

        try {
            const res = await fetch("/api/orders/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cisloObjednavky, email }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                throw new Error(messageForCode(data?.code));
            }
            setOrder(data.order as StatusOrder);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : t("errFailed"));
        } finally {
            setLoading(false);
            submittingRef.current = false;
        }
    }

    function reset() {
        setOrder(null);
        setCisloObjednavky("");
        setEmail("");
        setErrors({});
        setSubmitError(null);
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-surface">

                {/* Hero */}
                <div className="bg-header relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
                    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-14 lg:py-20 relative z-10">
                        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
                            <Link href="/" className="hover:text-white/60 transition-colors">{tc("home")}</Link>
                            <ChevronRight size={11} aria-hidden="true" />
                            <span className="text-white/60">{t("breadcrumb")}</span>
                        </nav>
                        <div className="max-w-2xl">
                            <p className="text-primary-ink text-xs font-bold uppercase tracking-[0.18em] mb-4">{t("eyebrow")}</p>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">{t("title")}</h1>
                            <p className="text-white/50 text-base leading-relaxed">{t("intro")}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
                    {!order ? (
                        <div className="max-w-xl">
                            <SectionLabel>{t("formEyebrow")}</SectionLabel>
                            <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-2">{t("formTitle")}</h2>
                            <p className="text-text-muted text-sm leading-relaxed mb-8">{t("formDesc")}</p>

                            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-border shadow-sm p-8 space-y-5">
                                <Field
                                    label={t("orderNumber")} name="cisloObjednavky" value={cisloObjednavky}
                                    onChange={(e) => { setCisloObjednavky(e.target.value); setErrors((p) => ({ ...p, cisloObjednavky: undefined })); }}
                                    placeholder="např. 00123456" inputMode="numeric" error={errors.cisloObjednavky}
                                />
                                <Field
                                    label={t("email")} name="email" type="email" value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                                    placeholder="jan.novak@priklad.cz" inputMode="email" error={errors.email}
                                />
                                <p className="flex items-start gap-2 text-xs text-text-subtle leading-relaxed">
                                    <Mail size={13} className="shrink-0 mt-0.5" />
                                    {t("emailHint")}
                                </p>
                                <button type="submit" disabled={loading}
                                    className="w-full px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                                    {loading ? t("searching") : t("submit")}
                                    <Search size={16} aria-hidden="true" />
                                </button>
                                {submitError && (
                                    <p role="alert" className="flex items-center gap-1.5 text-red-500 text-xs justify-center">
                                        <AlertCircle size={12} aria-hidden="true" /> {submitError}
                                    </p>
                                )}
                            </form>

                            <div className="mt-8 flex items-start gap-3 bg-white rounded-2xl border border-border p-5">
                                <Clock size={16} className="text-text-muted shrink-0 mt-0.5" />
                                <p className="text-xs text-text-muted leading-relaxed">
                                    {t("noNumberHint")}{" "}
                                    <Link href="/kontakt" className="text-primary-ink font-semibold hover:underline">{t("contactLink")}</Link>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <OrderResult order={order} email={email} onReset={reset} t={t} tc={tc} />
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
