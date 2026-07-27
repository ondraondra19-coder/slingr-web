"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useRef, useState } from "react";
import {
    ChevronRight, ShieldCheck, Clock, CheckCircle2, ArrowRight,
    HelpCircle, Banknote, Send, AlertCircle,
} from "lucide-react";
import { useT, type T } from "@/lib/useT";
import { isValidEmail } from "@/lib/emailValidation";

// ── Data ──────────────────────────────────────────────────────────────────────

function buildSteps(t: T) {
    return [
        { num: 1, title: t("step1Title"), desc: t("step1Desc") },
        { num: 2, title: t("step2Title"), desc: t("step2Desc") },
        { num: 3, title: t("step3Title"), desc: t("step3Desc") },
        { num: 4, title: t("step4Title"), desc: t("step4Desc") },
    ];
}

// Lhůta na odeslání zboží: 14 dní běží od oznámení o odstoupení (claim.date).
// AŽ BUDE Packeta API (se živností), půjde `from` navázat na datum doručení
// zásilky — zbytek výpočtu zůstane stejný.
// Realistický telefon: +, mezery, závorky, pomlčky, lomítko a 9–15 číslic.
// Stejná pravidla hlídá i server (app/api/claims/route.ts).
function isValidPhone(value: string): boolean {
    const v = value.trim();
    if (!/^\+?[0-9 ()/-]+$/.test(v)) return false;
    const digits = v.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
}

// Číslo objednávky = variabilní symbol z potvrzení → jen číslice (4–12).
function isValidOrderFormat(value: string): boolean {
    return /^\d{4,12}$/.test(value.replace(/\s+/g, ""));
}

// Číslo účtu: český formát [předčíslí-]číslo/kódbanky, nebo IBAN.
function isValidAccount(value: string): boolean {
    const compact = value.replace(/\s+/g, "");
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(compact.toUpperCase())) return true;
    return /^(\d{1,6}-)?\d{2,10}\/\d{4}$/.test(compact);
}

const RETURN_WINDOW_DAYS = 14;
function returnDeadline(from: string): { date: Date; daysLeft: number } {
    const start = new Date(from);
    const date = new Date(start);
    date.setDate(date.getDate() + RETURN_WINDOW_DAYS);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.max(0, Math.ceil((date.getTime() - Date.now()) / msPerDay));
    return { date, daysLeft };
}

// ── Typy formuláře ────────────────────────────────────────────────────────────
// Jen odstoupení od smlouvy do 14 dnů: žádný typ žádosti ani způsob vyřízení —
// výsledek je vždy vrácení peněz na účet. Důvod je NEPOVINNÝ.

type FormState = {
    jmeno: string;
    email: string;
    telefon: string;
    cisloObjednavky: string;
    cisloUctu: string;
    duvod: string;
};

const defaultForm: FormState = {
    jmeno: "",
    email: "",
    telefon: "",
    cisloObjednavky: "",
    cisloUctu: "",
    duvod: "",
};

// ── Komponenty ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-subtle mb-3">
            {children}
        </p>
    );
}

function Field({
    label, name, value, onChange, placeholder, error, type = "text", required = false
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; error?: string; type?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                {label}{required && " *"}
            </label>
            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                error ? "border-red-400" : "border-border focus-within:border-primary/50"
            }`}>
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="flex-1 bg-surface px-4 py-3 text-sm text-text-base placeholder-text-subtle focus:outline-none"
                />
            </div>
            {error && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle size={11} /> {error}
                </p>
            )}
        </div>
    );
}

// ── Stránka ───────────────────────────────────────────────────────────────────

function ReklamaceContent() {
    const t = useT("claims");
    const steps = buildSteps(t);
    // Ze sledování objednávky (/objednavky) sem chodí odkaz s ?order=&email=,
    // ať zákazník nemusí číslo objednávky a e-mail psát podruhé. Bereme je jen
    // jako předvyplnění — formulář i server si je stejně znovu zvalidují.
    const searchParams = useSearchParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    // Číslo případu přiděluje server (atomický INCR, viz lib/claims.ts) a vrací
    // ho v odpovědi. Dřív se tady losovalo přes Math.random(), takže se nikam
    // neukládalo, po reloadu se změnilo a zákazníkovi bylo k ničemu.
    const [ticket, setTicket] = useState<string | null>(null);
    // Lhůta na odeslání zboží — dopočítaná z data oznámení (viz returnDeadline).
    const [deadline, setDeadline] = useState<{ date: Date; daysLeft: number } | null>(null);
    const [form, setForm] = useState<FormState>(() => ({
        ...defaultForm,
        cisloObjednavky: searchParams.get("order") ?? "",
        email: searchParams.get("email") ?? "",
    }));
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [sending, setSending] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // Pojistka proti dvojímu odeslání: `sending` je stav a aktualizuje se až po
    // re-renderu, takže dva rychlé kliky by se přes něj protáhly a založily dvě
    // žádosti. Ref se nastaví okamžitě, ještě v tomtéž ticku.
    const submittingRef = useRef(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Důvod (duvod) SCHVÁLNĚ nevaliduji — u odstoupení do 14 dnů se nesmí
    // vyžadovat. Ostatní pole jsou povinná (kdo vrací, co vrací, kam vrátit peníze).
    function validate() {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.jmeno.trim()) e.jmeno = t("errName");
        if (!form.email.trim()) e.email = t("errEmail");
        else if (!isValidEmail(form.email)) e.email = t("errEmailFormat");
        if (!form.telefon.trim()) e.telefon = t("errPhone");
        else if (!isValidPhone(form.telefon)) e.telefon = t("errPhoneFormat");
        if (!form.cisloObjednavky.trim()) e.cisloObjednavky = t("errOrderNumber");
        else if (!isValidOrderFormat(form.cisloObjednavky)) e.cisloObjednavky = t("errOrderFormat");
        if (!form.cisloUctu.trim()) e.cisloUctu = t("errAccount");
        else if (!isValidAccount(form.cisloUctu)) e.cisloUctu = t("errAccountFormat");
        return e;
    }

    // API vrací kód, ne hotovou větu — text vybíráme tady podle jazyka. Neznámý
    // kód spadne na obecné "nepovedlo se", ať nikdy neukážeme "claims.neco".
    function messageForCode(code: unknown, minutes: unknown): string {
        switch (code) {
            case "invalid_name":          return t("errName");
            case "invalid_email":         return t("errEmailFormat");
            case "invalid_phone":         return t("errPhone");
            case "invalid_phone_format":  return t("errPhoneFormat");
            case "invalid_order":         return t("errOrderNumber");
            case "invalid_order_format":  return t("errOrderFormat");
            case "order_not_found":       return t("errOrderNotFound");
            case "invalid_account":       return t("errAccount");
            case "invalid_account_format": return t("errAccountFormat");
            case "cooldown":              return t("errCooldown", { minutes: typeof minutes === "number" ? minutes : 5 });
            default:                      return t("errFailed");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingRef.current) return;

        const e2 = validate();
        if (Object.keys(e2).length > 0) {
            setErrors(e2);
            const firstKey = Object.keys(e2)[0];
            document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        submittingRef.current = true;
        setSending(true);
        setSubmitError(null);

        try {
            const res = await fetch("/api/claims", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                // Číslo objednávky server ověřuje proti reálným objednávkám —
                // když neexistuje, ukážeme chybu přímo u políčka.
                if (data?.code === "order_not_found") {
                    setErrors(prev => ({ ...prev, cisloObjednavky: t("errOrderNotFound") }));
                    document.querySelector('[name="cisloObjednavky"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
                    return;
                }
                throw new Error(messageForCode(data?.code, data?.minutes));
            }

            setTicket(data.ticket);
            setDeadline(returnDeadline(typeof data.date === "string" ? data.date : new Date().toISOString()));
            setIsSubmitted(true);
            window.scrollTo({
                top: document.getElementById('formular')?.offsetTop
                    ? document.getElementById('formular')!.offsetTop - 100
                    : 0,
                behavior: 'smooth'
            });
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : t("errFailed"));
        } finally {
            setSending(false);
            submittingRef.current = false;
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-surface">

                {/* ── Hero ── */}
                <div className="bg-header relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

                    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-14 lg:py-20 relative z-10">
                        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
                            <Link href="/" className="hover:text-white/60 transition-colors">{t("home")}</Link>
                            <ChevronRight size={11} aria-hidden="true" />
                            <span className="text-white/60">{t("breadcrumb")}</span>
                        </nav>

                        <div className="max-w-2xl">
                            <p className="text-primary-ink text-xs font-bold uppercase tracking-[0.18em] mb-4">
                                {t("eyebrow")}
                            </p>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                                {t("title")}
                            </h1>
                            <p className="text-white/50 text-base leading-relaxed">
                                {t("intro")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

                    {/* ── Kroky ── */}
                    <section className="mb-16">
                        <SectionLabel>{t("howToEyebrow")}</SectionLabel>
                        <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-10">
                            {t("howToTitle")}
                        </h2>

                        <div className="flex flex-col gap-0">
                            {steps.map((s, i) => (
                                <div key={s.num} className="flex gap-5 relative">
                                    {i < steps.length - 1 && (
                                        <div className="absolute left-[19px] top-12 w-0.5 h-[calc(100%-8px)] bg-border" />
                                    )}

                                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm z-10">
                                        {s.num}
                                    </div>

                                    <div className="flex-1 pb-10">
                                        <h3 className="text-text-base font-bold text-base mb-1.5">{s.title}</h3>
                                        <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Formulář pro odstoupení ── */}
                    <section className="mb-16" id="formular">
                        <SectionLabel>{t("formEyebrow")}</SectionLabel>
                        <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-8">
                            {t("formTitle")}
                        </h2>

                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            {!isSubmitted ? (
                                <form className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} noValidate>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-text-base uppercase tracking-wider mb-2">{t("personalHeading")}</h3>
                                        <Field
                                            label={t("fullName")} name="jmeno" value={form.jmeno}
                                            onChange={handleChange} placeholder={t("namePlaceholder")}
                                            error={errors.jmeno} required
                                        />
                                        <Field
                                            label={t("email")} name="email" type="email" value={form.email}
                                            onChange={handleChange} placeholder="jan.novak@priklad.cz"
                                            error={errors.email} required
                                        />
                                        <Field
                                            label={t("phone")} name="telefon" type="tel" value={form.telefon}
                                            onChange={handleChange} placeholder="+420 123 456 789"
                                            error={errors.telefon} required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-text-base uppercase tracking-wider mb-2">{t("goodsHeading")}</h3>
                                        <Field
                                            label={t("orderNumber")} name="cisloObjednavky" value={form.cisloObjednavky}
                                            onChange={handleChange} placeholder="např. 00123456"
                                            error={errors.cisloObjednavky} required
                                        />
                                        <Field
                                            label={t("accountLabel")} name="cisloUctu" value={form.cisloUctu}
                                            onChange={handleChange} placeholder={t("accountPlaceholder")}
                                            error={errors.cisloUctu} required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                                {t("reasonLabel")}
                                            </label>
                                            <div className="border rounded-xl overflow-hidden transition-colors border-border focus-within:border-primary/50">
                                                <textarea
                                                    name="duvod"
                                                    value={form.duvod}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    placeholder={t("reasonPlaceholder")}
                                                    className="w-full px-4 py-3 bg-surface text-sm focus:outline-none resize-none text-text-base placeholder-text-subtle"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <p className="text-xs text-text-subtle leading-relaxed max-w-md text-center sm:text-left">
                                            {t("consentNote").split(/(\{privacy\}|\{terms\})/).map((part, i) => {
                                                if (part === "{privacy}") return (
                                                    <a key={i} href="/ochrana-osobnich-udaju" className="text-primary-ink hover:underline font-semibold">{t("consentPrivacyLink")}</a>
                                                );
                                                if (part === "{terms}") return (
                                                    <a key={i} href="/obchodni-podminky" className="text-primary-ink hover:underline font-semibold">{t("consentTermsLink")}</a>
                                                );
                                                return <React.Fragment key={i}>{part}</React.Fragment>;
                                            })}
                                        </p>
                                        <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
                                            <button
                                                type="submit"
                                                disabled={sending}
                                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                                            >
                                                {sending ? t("sending") : t("submit")}
                                                <Send size={16} aria-hidden="true" />
                                            </button>
                                            {submitError && (
                                                <p role="alert" className="flex items-center gap-1 text-red-500 text-xs">
                                                    <AlertCircle size={11} aria-hidden="true" /> {submitError}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                /* ── Success state ── */
                                <div className="p-8 lg:p-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                                        {/* Levý sloupec: heading + ticket karta */}
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-start gap-5">
                                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                    <CheckCircle2 size={28} className="text-primary-ink" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-extrabold text-text-base mb-1 leading-tight">
                                                        {t("sentTitle")}
                                                    </h3>
                                                    <p className="text-text-muted text-sm">
                                                        {t("sentDesc")}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Ticket info card */}
                                            <div className="bg-surface rounded-2xl border border-border p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <p className="text-xs font-bold text-text-subtle uppercase tracking-widest">{t("ticketNumber")}</p>
                                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-ink text-xs font-extrabold tracking-wide">
                                                        {ticket}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <Clock size={13} className="text-text-subtle" />
                                                            {t("infoReplyIn")}
                                                        </span>
                                                        <span className="font-bold text-text-base">{t("infoReplyValue")}</span>
                                                    </div>
                                                    <div className="h-px bg-border" />
                                                    <div className="flex items-start justify-between text-sm gap-3">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <ShieldCheck size={13} className="text-text-subtle shrink-0" />
                                                            {t("infoLegalLimit")}
                                                        </span>
                                                        {deadline && (
                                                            <span className="text-right">
                                                                <span className="block font-bold text-text-base">
                                                                    {t.plural(deadline.daysLeft, "daysLeft")}
                                                                </span>
                                                                <span className="block text-xs text-text-subtle">
                                                                    {t("sendBy", { date: deadline.date.toLocaleDateString(t.locale) })}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="h-px bg-border" />
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <Banknote size={13} className="text-text-subtle" />
                                                            {t("infoRefund")}
                                                        </span>
                                                        <span className="font-bold text-text-base">{t("infoRefundValue")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pravý sloupec: kroky + akce */}
                                        <div className="flex flex-col gap-6 justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-text-subtle uppercase tracking-widest mb-4">{t("whatsNext")}</p>
                                                <div className="space-y-4">
                                                    {[
                                                        { title: t("next1Title"), desc: t("next1Desc") },
                                                        { title: t("next2Title"), desc: t("next2Desc") },
                                                        { title: t("next3Title"), desc: t("next3Desc") },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-start gap-4">
                                                            <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-primary/10 text-primary-ink text-xs font-extrabold flex items-center justify-center">
                                                                {i + 1}
                                                            </span>
                                                            <div>
                                                                <p className="text-sm font-bold text-text-base leading-snug">{item.title}</p>
                                                                <p className="text-sm text-text-muted leading-snug">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">

                                                <a
                                                    href="/kontakt"
                                                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                                                >
                                                    {t("contactSupport")}
                                                    <ArrowRight size={14} aria-hidden="true" />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setIsSubmitted(false);
                                                        setForm(defaultForm);
                                                        setErrors({});
                                                        setTicket(null);
                                                        setDeadline(null);
                                                        setSubmitError(null);
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-border text-text-muted font-semibold text-sm hover:bg-surface hover:text-text-base transition-all flex items-center justify-center gap-2"
                                                >
                                                    {t("newRequest")}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── CTA ── */}
                    <div className="rounded-2xl bg-header relative overflow-hidden p-10 lg:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                            }}
                        />
                        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
                        <HelpCircle className="absolute -bottom-10 -left-10 w-48 h-48 text-white/[0.03]" />

                        <div className="relative z-10">
                            <p className="text-white font-extrabold text-2xl mb-2">{t("ctaTitle")}</p>
                            <p className="text-white/70 text-sm">
                                {t("ctaDesc")}
                            </p>
                        </div>

                        <a
                            href="/kontakt"
                            className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
                        >
                            {t("ctaButton")}
                            <ArrowRight size={15} aria-hidden="true" />
                        </a>
                    </div>

                </div>
            </main>
            <Footer />
        </>
    );
}

// useSearchParams vyžaduje Suspense hranici (jinak spadne build na statické
// generaci). Předvyplnění z /objednavky ji potřebuje.
export default function ReklamaceAVraceniPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <ReklamaceContent />
        </Suspense>
    );
}
