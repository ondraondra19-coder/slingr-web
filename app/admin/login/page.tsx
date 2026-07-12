"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Přihlášení se nezdařilo.");
      return;
    }

    const from = searchParams.get("from") ?? "/admin";
    router.push(from);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f6f4] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb]"
      >
        {/* Logo ve stejném stylu jako v sidebaru dashboardu */}
        <div className="flex items-baseline font-bold tracking-tight text-lg mb-1 text-[#0f0f10]">
          <span>Hack</span>
          <span className="text-primary">Pack</span>
          <span className="ml-1.5 text-[9px] font-mono font-medium bg-primary/5 text-zinc-500 px-1 py-0.5 rounded uppercase tracking-wider">
            Admin
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-6">Přihlaš se svým jménem a heslem.</p>

        <label htmlFor="username" className="block text-xs font-semibold text-zinc-600 mb-1">
          Uživatelské jméno
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
          autoComplete="username"
          className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 mb-4 text-sm text-[#0f0f10] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />

        <label htmlFor="password" className="block text-xs font-semibold text-zinc-600 mb-1">
          Heslo
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 mb-4 text-sm text-[#0f0f10] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />

        {error && <p className="text-primary text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2 text-sm font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          {loading ? "Přihlašuji…" : "Přihlásit se"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}