"use client";

import { Shield } from "lucide-react";

export default function ResetConsentButton() {
  function handleReset() {
    try { localStorage.removeItem("hackpack-cookie-consent"); } catch {}
    window.location.reload();
  }

  return (
    <button
      onClick={handleReset}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-dark font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all mt-1"
    >
      <Shield size={14} />
      <span>Odvolat souhlas</span>
    </button>
  );
}