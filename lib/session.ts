// lib/session.ts
// ─────────────────────────────────────────────────────────────────────────────
// Anonymní identita prohlížeče — abychom poznali "tohle je Marek" bez loginu.
// Generuje se jednou, uloží do localStorage, žije dokud uživatel nesmaže data.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = "techgadgets-session-id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // localStorage nedostupný (privátní okno apod.) — fallback na session-only ID
    return "anon-" + Math.random().toString(36).slice(2);
  }
}