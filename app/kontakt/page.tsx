"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Phone, Mail, MapPin, Clock, Check, Send } from "lucide-react";

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!name || !email || !message) return;
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-subtle mb-8">
            <a href="/" className="hover:text-text-muted transition-colors">Domů</a>
            <ChevronRight size={12} className="text-border" />
            <span className="text-text-muted">Kontakt</span>
          </nav>

          <div className="mb-10">
            <p className="text-text-subtle text-xs font-semibold uppercase tracking-widest mb-2">Jsme tu pro tebe</p>
            <h1 className="text-4xl font-extrabold text-text-base tracking-tight">Kontakt</h1>
          </div>

          {/* Dvě karty vedle sebe */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Kontaktní info */}
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-8">
              <div>
                <h2 className="text-lg font-bold text-text-base mb-5">Kontaktní údaje</h2>
                <div className="flex flex-col gap-5">
                  <a href="tel:+420737565577" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-text-subtle text-xs mb-0.5">Telefon</p>
                      <p className="text-text-base font-semibold group-hover:text-primary transition-colors">+420 737 565 577</p>
                    </div>
                  </a>
                  <a href="mailto:info@techgadgets.cz" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-text-subtle text-xs mb-0.5">E-mail</p>
                      <p className="text-text-base font-semibold group-hover:text-primary transition-colors">info@techgadgets.cz</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-text-subtle text-xs mb-0.5">Adresa</p>
                      <p className="text-text-base font-semibold">Václavské náměstí 1</p>
                      <p className="text-text-muted text-sm">110 00 Praha 1</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-text-base mb-5">Otevírací doba</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { day: "Pondělí – Pátek", time: "9:00 – 17:00" },
                    { day: "Sobota", time: "10:00 – 14:00" },
                    { day: "Neděle", time: "Zavřeno" },
                  ].map((row) => (
                    <div key={row.day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-text-subtle" />
                        <span className="text-text-muted text-sm">{row.day}</span>
                      </div>
                      <span className={`text-sm font-semibold ${row.time === "Zavřeno" ? "text-text-subtle" : "text-text-base"}`}>{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulář */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-lg font-bold text-text-base mb-5">Napsat zprávu</h2>

              {sent ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="text-text-base font-semibold">Zpráva odeslána!</p>
                  <p className="text-text-muted text-sm">Ozveme se ti co nejdříve, zpravidla do 24 hodin.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-muted text-xs font-medium mb-1.5">Jméno *</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Jan Novák"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors bg-surface" />
                    </div>
                    <div>
                      <label className="block text-text-muted text-xs font-medium mb-1.5">E-mail *</label>
                      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@email.cz"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors bg-surface" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-muted text-xs font-medium mb-1.5">Zpráva *</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Jak ti můžeme pomoci?"
                      rows={6}
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-base placeholder-text-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none bg-surface" />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!name || !email || !message}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all w-fit ${
                      !name || !email || !message
                        ? "bg-border text-text-subtle cursor-not-allowed"
                        : "bg-primary text-dark hover:brightness-105 active:scale-[0.98]"
                    }`}
                  >
                    <Send size={14} />
                    Odeslat zprávu
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="rounded-2xl overflow-hidden shadow-sm h-80 bg-secondary">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d556.5826985800264!2d14.49496265000414!3d50.01383019076257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b9188ab408c39%3A0x5c94b3ab8962c3c1!2sV%20Jahod%C3%A1ch%20887%2C%20148%2000%20Praha-Kunratice!5e0!3m2!1scs!2scz!4v1775937349401!5m2!1scs!2scz"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}