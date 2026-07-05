'use client';

import React, { useState } from 'react';

type Tab = 'dashboard' | 'reservations' | 'products' | 'reviews' | 'messages' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    alert('Odhlášeno!');
    setIsProfileOpen(false);
  };

  const menuItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
    )},
    { id: 'reservations' as Tab, label: 'Rezervace produktů', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    )},
    { id: 'products' as Tab, label: 'Produkty', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { id: 'reviews' as Tab, label: 'Recenze', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    )},
    { id: 'messages' as Tab, label: 'Zprávy', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    )},
    { id: 'settings' as Tab, label: 'Nastavení', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
    )},
  ];

  return (
    <div className="flex h-screen bg-[#f7f6f4] text-[#0f0f10] font-sans antialiased overflow-hidden selection:bg-[#dc143c]/10 selection:text-[#dc143c]">
      
      {/* 1. LEVÁ LIŠTA (SIDEBAR) - Tmavá podle tvého headeru */}
      <aside className="w-64 bg-[#1c1c1c] text-[#fafafa] flex flex-col justify-between z-20 shadow-xl">
        <div>
          {/* Logo upravené přesně podle tvého webu */}
          <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
            <div className="flex items-baseline font-bold tracking-tight text-lg">
              <span>Tech</span>
              <span className="text-[#dc143c]">Gadgets</span>
              <span className="ml-1.5 text-[9px] font-mono font-medium bg-white/10 text-zinc-400 px-1 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>

          {/* Navigace s aktivní barvou z e-shopu */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#dc143c] text-white shadow-lg shadow-[#dc143c]/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Spodek lišty */}
        <div className="p-4 border-t border-white/[0.05] text-[10px] text-zinc-600 font-mono text-center">
          CONSOLE // ACTIVE
        </div>
      </aside>

      {/* PRAVÁ STRANA (HEADER + OBSAH) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. HORNÍ LIŠTA (HEADER) - Světlá s jemným předělem */}
        <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8 z-10 shadow-sm">
          
          {/* Provizorní vyhledávání */}
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="Hledat v administraci..."
              className="w-full bg-[#f1f1f3] border border-[#e5e7eb] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0f0f10] placeholder-zinc-400 focus:outline-none focus:border-[#dc143c]/50 focus:bg-white transition-all"
            />
          </div>

          {/* Profil s otevíráním odhlášení */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-1.5 hover:bg-[#f1f1f3] rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1c1c1c] text-white flex items-center justify-center font-bold text-xs">
                OK
              </div>
              <span className="text-xs font-semibold text-[#0f0f10] hidden sm:inline">Ondřej Kubrický</span>
              <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isProfileOpen && (
              <>
                {/* Backdrop pro kliknutí mimo */}
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1 z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border-b border-[#e5e7eb]">
                    Správa účtu
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#dc143c] hover:bg-red-50 flex items-center space-x-2 transition-colors font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Odhlásit se</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* 3. HLAVNÍ PLOCHA (OBSAH PODLE SEKCE) */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f7f6f4]">
          <div className="max-w-4xl mx-auto">
            
            {/* Sekce info */}
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-[#0f0f10] capitalize">
                {activeTab === 'dashboard' ? 'Přehled' : menuItems.find(i => i.id === activeTab)?.label}
              </h1>
            </div>

            {/* Čistě bílý Apple-style box pro samotná data */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 min-h-[400px] flex flex-col justify-between shadow-sm relative overflow-hidden">
              
              <div>
                {activeTab === 'dashboard' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Vítej na administraci Tech Gadgets</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-md">Zde brzy uvidíš grafy prodejů, rychlé přehledy a upozornění na nízké zásoby doplňků na skladě.</p>
                  </div>
                )}

                {activeTab === 'reservations' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Přehled objednávek</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-lg">Tady se ti načtou lidé, co odeslali košík. Budeš tu moct jedním kliknutím měnit stavy rezervace:</p>
                    <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-semibold">
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md">Zabalená</span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md">Odeslaná</span>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md">Na cestě</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md">Doručená</span>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Sklad a úprava produktů</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-md">Zobrazení kompletního katalogu (kryty, skla, kabely). Přímo odsud budeš upravovat počet kusů na skladě bez ručního zásahu do databáze.</p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Správa uživatelských recenzí</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-md">Výpis hodnocení, která lidé zanechali u tvých gadgetů. Nevhodné nebo spamové komentáře odsud bude možné smazat.</p>
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Zprávy z formuláře</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-md">Dotazy uživatelů, které přijdou přes kontaktní sekci e-shopu (kompatibilita, dotazy na naskladnění).</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0f0f10]">Globální nastavení</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-md">Nastavení cen dopravy, přepínání Stripe platebního prostředí a úprava kontaktních informací.</p>
                  </div>
                )}
              </div>

              {/* Systémový footer boxu */}
              <div className="mt-6 pt-4 border-t border-[#e5e7eb] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>ACTIVE_ROUTE</span>
                <span className="text-[#dc143c] bg-[#dc143c]/5 px-2 py-0.5 rounded border border-[#dc143c]/10">
                  /admin/{activeTab}
                </span>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}