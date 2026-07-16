"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import {
    ChevronRight, Package, MapPin, Home, ShoppingCart,
    ShieldCheck, Clock, CheckCircle2, ArrowRight,
    HelpCircle, Banknote, Send, AlertCircle,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const steps = [
    {
        num: 1,
        tag: "Příprava",
        tagColor: "text-primary-ink bg-primary/10",
        title: "Vyplňte reklamační formulář",
        desc: "Popište závadu co nejpodrobněji a přiložte fotografie poškození. Formulář naleznete níže na stránce nebo nás kontaktujte e-mailem.",
    },
    {
        num: 2,
        tag: "Odeslání",
        tagColor: "text-primary-ink bg-primary/10",
        title: "Zašlete nám zboží",
        desc: "Zabalte zboží do původního nebo dostatečně pevného obalu. Přiložte vytištěný formulář a doklad o koupi (stačí kopie). Zásilku pošlete na naši adresu.",
    },
    {
        num: 3,
        tag: "Zpracování",
        tagColor: "text-primary-ink bg-primary/10",
        title: "Posoudíme reklamaci",
        desc: "Do 3 pracovních dnů od přijetí zásilky vás e-mailem informujeme o stavu reklamace. Zákonná lhůta pro vyřízení je 30 dní.",
    },
    {
        num: 4,
        tag: "Vyřízení",
        tagColor: "text-primary-ink bg-primary/10",
        title: "Oprava, výměna nebo vrácení peněz",
        desc: "Po uznání reklamace zvolíte preferovaný způsob vyřízení — opravený nebo nový kus zašleme zpět, případně vrátíme celou částku.",
    },
];

const returnMethods = [
    {
        icon: Package,
        title: "Vrácení přes Zásilkovnu",
        desc: "Zboží podejte na nejbližší pobočce Zásilkovny. Štítek vám zašleme e-mailem zdarma po odeslání žádosti.",
        isFree: true,
        freeNote: "Štítek zašleme e-mailem",
    },
    {
        icon: Home,
        title: "Osobní předání v Praze",
        desc: "Přineste zboží osobně na naši pobočku na Václavském náměstí. Vyřídíme vše okamžitě na místě.",
        isFree: true,
        freeNote: "Václavské nám. 1, Praha 1",
    },
    {
        icon: MapPin,
        title: "Zaslání vlastním přepravcem",
        desc: "Zboží zašlete libovolnou přepravní službou na naši adresu. Doporučujeme pojistit zásilku na hodnotu zboží.",
        isFree: false,
        freeNote: "",
    },
    {
        icon: ShoppingCart,
        title: "Vrácení v rámci 14 dní",
        desc: "Zboží koupené online lze vrátit bez udání důvodu do 14 dnů. Zboží musí být nepoužité a v originálním obalu.",
        isFree: true,
        freeNote: "Zákonné právo spotřebitele",
    },
];

// ── Typy formuláře ────────────────────────────────────────────────────────────

type FormState = {
    jmeno: string;
    email: string;
    telefon: string;
    cisloObjednavky: string;
    typZadosti: string;
    zpusobVyrizeni: string;
    popis: string;
};

const defaultForm: FormState = {
    jmeno: "",
    email: "",
    telefon: "",
    cisloObjednavky: "",
    typZadosti: "",
    zpusobVyrizeni: "",
    popis: "",
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

function SelectField({
    label, name, value, onChange, options, error, required = false
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    error?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                {label}{required && " *"}
            </label>
            <div className={`border rounded-xl overflow-hidden transition-colors ${
                error ? "border-red-400" : "border-border focus-within:border-primary/50"
            }`}>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-surface text-sm focus:outline-none appearance-none cursor-pointer text-text-base"
                >
                    {options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
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

export default function ReklamaceAVraceniPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [ticketNumber] = useState(() => Math.floor(Math.random() * 90000) + 10000);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    function validate() {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.jmeno.trim()) e.jmeno = "Vyplňte jméno a příjmení";
        if (!form.email.trim()) e.email = "Vyplňte e-mail";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Neplatný formát e-mailu";
        if (!form.telefon.trim()) e.telefon = "Vyplňte telefonní číslo";
        if (!form.cisloObjednavky.trim()) e.cisloObjednavky = "Vyplňte číslo objednávky";
        if (!form.typZadosti) e.typZadosti = "Vyberte typ žádosti";
        if (!form.zpusobVyrizeni) e.zpusobVyrizeni = "Vyberte způsob vyřízení";
        if (!form.popis.trim()) e.popis = "Popište závadu nebo důvod vrácení";
        return e;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length > 0) {
            setErrors(e2);
            const firstKey = Object.keys(e2)[0];
            document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setIsSubmitted(true);
        window.scrollTo({
            top: document.getElementById('formular')?.offsetTop
                ? document.getElementById('formular')!.offsetTop - 100
                : 0,
            behavior: 'smooth'
        });
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
                            <a href="/" className="hover:text-white/60 transition-colors">Domů</a>
                            <ChevronRight size={11} />
                            <span className="text-white/60">Reklamace a vrácení zboží</span>
                        </nav>

                        <div className="max-w-2xl">
                            <p className="text-primary-ink text-xs font-bold uppercase tracking-[0.18em] mb-4">
                                Zákaznický servis
                            </p>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
                                Reklamace &amp; vrácení<br />zboží
                            </h1>
                            <p className="text-white/50 text-base leading-relaxed">
                                Vaše spokojenost je pro nás priorita. Poradíme vám, jak rychle
                                a jednoduše reklamovat nebo vrátit zakoupené zboží.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

                    {/* ── Kroky ── */}
                    <section className="mb-16">
                        <SectionLabel>Jak postupovat</SectionLabel>
                        <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-10">
                            Reklamace krok za krokem
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
                                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full mb-2 ${s.tagColor}`}>
                                            {s.tag}
                                        </span>
                                        <h3 className="text-text-base font-bold text-base mb-1.5">{s.title}</h3>
                                        <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Způsoby vrácení ── */}
                    <section className="mb-16">
                        <SectionLabel>Vrácení zboží</SectionLabel>
                        <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-8">
                            Způsoby a podmínky vrácení
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {returnMethods.map(m => (
                                <div
                                    key={m.title}
                                    className="flex gap-5 p-6 bg-white rounded-2xl border border-border shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                                        <m.icon size={20} className="text-text-muted" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="text-text-base font-bold text-sm">{m.title}</h3>
                                            
                                        </div>
                                        <p className="text-text-muted text-sm leading-relaxed mb-2">{m.desc}</p>
                                        {m.isFree && (
                                            <div className="inline-flex items-center gap-1 text-primary-ink text-[11px] font-bold">
                                                <CheckCircle2 size={11} />
                                                {m.freeNote}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Reklamační formulář ── */}
                    <section className="mb-16" id="formular">
                        <SectionLabel>Online žádost</SectionLabel>
                        <h2 className="text-2xl font-extrabold text-text-base tracking-tight mb-8">
                            Reklamační formulář
                        </h2>

                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            {!isSubmitted ? (
                                <form className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} noValidate>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-text-base uppercase tracking-wider mb-2">Osobní údaje</h3>
                                        <Field
                                            label="Jméno a příjmení" name="jmeno" value={form.jmeno}
                                            onChange={handleChange} placeholder="Jan Novák"
                                            error={errors.jmeno} required
                                        />
                                        <Field
                                            label="E-mail" name="email" type="email" value={form.email}
                                            onChange={handleChange} placeholder="jan.novak@priklad.cz"
                                            error={errors.email} required
                                        />
                                        <Field
                                            label="Telefon" name="telefon" type="tel" value={form.telefon}
                                            onChange={handleChange} placeholder="+420 123 456 789"
                                            error={errors.telefon} required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-text-base uppercase tracking-wider mb-2">Informace o zboží</h3>
                                        <Field
                                            label="Číslo objednávky" name="cisloObjednavky" value={form.cisloObjednavky}
                                            onChange={handleChange} placeholder="TG-2024-XXXX"
                                            error={errors.cisloObjednavky} required
                                        />
                                        <SelectField
                                            label="Typ žádosti" name="typZadosti" value={form.typZadosti}
                                            onChange={handleChange}
                                            options={[
                                                { value: "", label: "Vyberte typ..." },
                                                { value: "reklamace", label: "Reklamace závady" },
                                                { value: "vraceni", label: "Vrácení zboží v 14denní lhůtě" },
                                                { value: "vymena", label: "Výměna zboží" },
                                            ]}
                                            error={errors.typZadosti} required
                                        />
                                        <SelectField
                                            label="Preferovaný způsob vyřízení" name="zpusobVyrizeni" value={form.zpusobVyrizeni}
                                            onChange={handleChange}
                                            options={[
                                                { value: "", label: "Vyberte způsob..." },
                                                { value: "oprava", label: "Oprava / Výměna za nový kus" },
                                                { value: "penize", label: "Vrácení peněz na účet" },
                                                { value: "sleva", label: "Sleva z kupní ceny" },
                                            ]}
                                            error={errors.zpusobVyrizeni} required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                                Popis závady / Důvod vrácení *
                                            </label>
                                            <div className={`border rounded-xl overflow-hidden transition-colors ${
                                                errors.popis ? "border-red-400" : "border-border focus-within:border-primary/50"
                                            }`}>
                                                <textarea
                                                    name="popis"
                                                    value={form.popis}
                                                    onChange={handleChange}
                                                    rows={4}
                                                    placeholder="Popište prosím co nejpodrobněji, co se s produktem děje..."
                                                    className="w-full px-4 py-3 bg-surface text-sm focus:outline-none resize-none text-text-base placeholder-text-subtle"
                                                />
                                            </div>
                                            {errors.popis && (
                                                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                                                    <AlertCircle size={11} /> {errors.popis}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <p className="text-xs text-text-subtle leading-relaxed max-w-md text-center sm:text-left">
                                            Odesláním formuláře berete na vědomí{" "}
                                            <a href="/ochrana-osobnich-udaju" className="text-primary-ink hover:underline font-semibold">zpracování osobních údajů</a>
                                            {" "}pro účely vyřízení reklamace. Pole označená * jsou povinná.
                                        </p>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-on-primary font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                                        >
                                            Odeslat žádost
                                            <Send size={16} />
                                        </button>
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
                                                        Žádost byla úspěšně odeslána
                                                    </h3>
                                                    <p className="text-text-muted text-sm">
                                                        Potvrzení jsme zaslali na váš e-mail.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Ticket info card */}
                                            <div className="bg-surface rounded-2xl border border-border p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <p className="text-xs font-bold text-text-subtle uppercase tracking-widest">Číslo žádosti</p>
                                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-ink text-xs font-extrabold tracking-wide">
                                                        TG-{ticketNumber}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <Clock size={13} className="text-text-subtle" />
                                                            Ozveme se do
                                                        </span>
                                                        <span className="font-bold text-text-base">3 pracovních dnů</span>
                                                    </div>
                                                    <div className="h-px bg-border" />
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <ShieldCheck size={13} className="text-text-subtle" />
                                                            Zákonná lhůta vyřízení
                                                        </span>
                                                        <span className="font-bold text-text-base">30 dní</span>
                                                    </div>
                                                    <div className="h-px bg-border" />
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-text-muted flex items-center gap-2">
                                                            <Banknote size={13} className="text-text-subtle" />
                                                            Vrácení peněz (po uznání)
                                                        </span>
                                                        <span className="font-bold text-text-base">3–5 dní</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pravý sloupec: kroky + akce */}
                                        <div className="flex flex-col gap-6 justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-text-subtle uppercase tracking-widest mb-4">Co bude dál?</p>
                                                <div className="space-y-4">
                                                    {[
                                                        { title: "Zkontrolujte e-mail", desc: "Potvrzení dorazí během pár minut na váš e-mail." },
                                                        { title: "Zabalte zboží", desc: "Přiložte kopii dokladu o koupi do zásilky." },
                                                        { title: "Odešlete zásilku", desc: "Zašlete ji dle zvoleného způsobu dopravy na naši adresu." },
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
                                                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-on-primary font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                                                >
                                                    Kontaktovat podporu
                                                    <ArrowRight size={14} />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setIsSubmitted(false);
                                                        setForm(defaultForm);
                                                        setErrors({});
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-border text-text-muted font-bold text-sm hover:bg-surface hover:text-text-base transition-all flex items-center justify-center gap-2"
                                                >
                                                    Podat další žádost
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Odkaz na Obchodní podmínky ── */}
                    <section className="mb-16">
                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1.5 bg-primary shrink-0" />
                                <div className="flex-1 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col sm:flex-row items-start gap-5">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                                            <ShieldCheck size={22} className="text-text-muted" />
                                        </div>
                                        <div>
                                            <h3 className="text-text-base font-bold text-base mb-1">
                                                Právní náležitosti a dokumenty
                                            </h3>
                                            <p className="text-text-muted text-sm leading-relaxed max-w-xl">
                                                Podrobný postup reklamací, práva z vadného plnění a informace o mimosoudním řešení sporů (ADR) naleznete v našich kompletních obchodních podmínkách.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="/obchodni-podminky"
                                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-text-base font-bold text-xs hover:bg-border transition-colors"
                                    >
                                        Zobrazit obchodní podmínky
                                        <ArrowRight size={14} />
                                    </a>
                                </div>
                            </div>
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
                            <p className="text-white font-extrabold text-2xl mb-2">Potřebujete pomoc s reklamací?</p>
                            <p className="text-white/70 text-sm">
                                Rádi poradíme — Po–Pá 9–18 h, So 10–14 h.
                            </p>
                        </div>

                        <a
                            href="/kontakt"
                            className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-primary/20"
                        >
                            Kontaktovat nás
                            <ArrowRight size={15} />
                        </a>
                    </div>

                </div>
            </main>
            <Footer />
        </>
    );
}