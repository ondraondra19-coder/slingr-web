// app/api/messages/route.ts
// Veřejný endpoint — přijímá zprávy z ChatWidgetu na e-shopu.
//
// Chyby vrací `code`, ne hotovou větu — text se skládá až na klientovi podle
// jazyka (messages/*.json → namespace `chat`). Server jazyk návštěvníka nezná,
// drží ho cookie čtená až po hydrataci (viz lib/locale.ts). `error` zůstává
// jako čitelný fallback do logů. U cooldownu jde s kódem i `minutes`, protože
// číslo se doplňuje do věty až v překladu.
import { NextResponse } from "next/server";
import { addMessage, checkAndSetCooldown } from "@/lib/messages";
import { getClientIp } from "@/lib/clientIp";

const MAX_TEXT_LENGTH = 1000;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 150;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type MessagesErrorCode =
  | "invalid_name"
  | "invalid_email"
  | "invalid_text"
  | "cooldown"
  | "failed";

function fail(code: MessagesErrorCode, error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ code, error, ...extra }, { status });
}

// POST /api/messages — odeslání zprávy z chat widgetu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, text } = body ?? {};

    // ── Validace vstupu ────────────────────────────────────────────────────
    if (typeof name !== "string" || !name.trim() || name.trim().length > MAX_NAME_LENGTH) {
      return fail("invalid_name", "Neplatné jméno.", 400);
    }
    if (
      typeof email !== "string" ||
      !email.trim() ||
      email.trim().length > MAX_EMAIL_LENGTH ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return fail("invalid_email", "Neplatný email.", 400);
    }
    if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_LENGTH) {
      return fail("invalid_text", "Zpráva je prázdná nebo příliš dlouhá.", 400);
    }

    // ── Anti-spam: 1 zpráva / IP adresa / 5 minut ──────────────────────────
    const ip = getClientIp(req);
    const { allowed, ttlSeconds } = await checkAndSetCooldown(ip);
    if (!allowed) {
      const minutes = Math.max(1, Math.ceil(ttlSeconds / 60));
      return fail("cooldown", `Další zprávu můžete odeslat za ${minutes} min.`, 429, { minutes });
    }

    await addMessage({ name: name.trim(), email: email.trim(), text: text.trim() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Messages POST error:", error);
    return fail("failed", "Nepodařilo se odeslat zprávu.", 500);
  }
}