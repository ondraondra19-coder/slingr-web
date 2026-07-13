// lib/adminAuth.ts
// Ochrana admin sekce — podepsané session cookie odvozené z ADMIN_SECRET.
// Token/session (createSessionToken/verifySessionToken) používá Web Crypto API
// (ne node:crypto), takže funguje jak v Node.js API routes, tak v middleware
// běžícím v Edge runtime. checkPassword běží jen v Node route (/api/admin/login),
// proto smí použít node:crypto (timingSafeEqual).
// Token nese identitu přihlášeného účtu (hlavní účet, nebo id dílčího účtu z lib/accounts.ts).
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
// Nenese žádné oprávnění sama o sobě (autorizace je pořád jen COOKIE_NAME,
// httpOnly a podepsaná) — je to jen čitelný "hint" pro klientský JS
// (PostHogProvider), aby vlastní procházení webu admina nepočítal do statistik.
const HINT_COOKIE_NAME = "admin_hint";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // session platná 12 hodin

// Hlavní účet je pevně zadrátovaný — nemá záznam v Redisu, jen tady.
export const MAIN_ACCOUNT_ID = "main";
export const MAIN_ACCOUNT_NAME = "Ondřej Kubrický";

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("❌ Chybí ADMIN_SECRET v env proměnných.");
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey(
    "raw",
    enc,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(Math.floor(hex.length / 2)));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Vytvoří podepsaný token ve tvaru "expires.accountId.signature"
export async function createSessionToken(accountId: string): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${expires}.${accountId}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufToHex(sig)}`;
}

export type SessionToken = { accountId: string };

// Ověří podpis i expiraci tokenu z cookie a vrátí, jaký účet je přihlášený
export async function verifySessionToken(token: string | undefined | null): Promise<SessionToken | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expiresStr, accountId, signatureHex] = parts;
  if (!expiresStr || !accountId || !signatureHex) return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  const payload = `${expiresStr}.${accountId}`;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuf(signatureHex),
      new TextEncoder().encode(payload)
    );
    return valid ? { accountId } : null;
  } catch {
    return null;
  }
}

// Porovná zadané heslo s ADMIN_SECRET (heslo hlavního účtu) v konstantním čase.
// timingSafeEqual vyhodí výjimku při rozdílné délce bufferů — rozdílná délka
// stejně znamená neshodu, takže ji odchytíme dřív.
export function checkPassword(password: string): boolean {
  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(getSecret(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_HINT_COOKIE_NAME = HINT_COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;