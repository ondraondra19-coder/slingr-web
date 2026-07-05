// lib/adminAuth.ts
// Ochrana admin sekce — jednoduché podepsané session cookie odvozené z ADMIN_SECRET.
// Používá Web Crypto API (ne node:crypto), takže funguje jak v Node.js API routes,
// tak v middleware, který běží v Edge runtime.

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // session platná 12 hodin

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

// Vytvoří podepsaný token ve tvaru "expires.signature"
export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = String(expires);
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufToHex(sig)}`;
}

// Ověří podpis i expiraci tokenu z cookie
export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  try {
    const key = await getKey();
    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuf(signatureHex),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

// Porovná zadané heslo s ADMIN_SECRET (dostatečné pro jednoho admina)
export function checkPassword(password: string): boolean {
  return password === getSecret();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;