// app/api/newsletter/route.ts
// Veřejný endpoint — přihlášení k odběru novinek z formuláře v patičce.
// Kontakt se ukládá do Resend Audience (viz lib/newsletter.ts).
//
// Chyby vrací `code`, ne hotovou větu: text se skládá až na klientovi podle
// zvoleného jazyka (messages/*.json → namespace `newsletter`). Server jazyk
// návštěvníka nezná — drží ho cookie čtená až po hydrataci (viz lib/locale.ts).
// `error` zůstává jako lidsky čitelný fallback do logů a pro případ, že by
// endpoint volal někdo mimo náš formulář.
import { NextResponse } from "next/server";
import { subscribeToNewsletter, isValidNewsletterEmail } from "@/lib/newsletter";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

export type NewsletterErrorCode =
  | "invalid_email"
  | "rate_limited"
  | "not_configured"
  | "failed";

function fail(code: NewsletterErrorCode, error: string, status: number) {
  return NextResponse.json({ code, error }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!isValidNewsletterEmail(email)) {
      return fail("invalid_email", "Zadejte platný e-mail.", 400);
    }

    // Bránit zaplavení Audience skriptem — 5 přihlášení z jedné IP za hodinu
    // stačí i pro celou rodinu na stejné síti.
    const ip = getClientIp(req);
    if (!(await checkRateLimit(`newsletter:${ip}`, 5, 3600))) {
      return fail("rate_limited", "Příliš mnoho pokusů. Zkuste to prosím později.", 429);
    }

    const result = await subscribeToNewsletter(email);
    if (!result.ok) {
      // not_configured = chybí RESEND_AUDIENCE_ID (např. před dokončením
      // nastavení). Ať to při testování poznáme, vracíme čitelnou chybu místo
      // tichého "úspěchu", který by kontakt zahodil.
      if (result.reason === "not_configured") {
        return fail("not_configured", "Přihlášení k odběru zatím není k dispozici.", 503);
      }
      return fail("failed", "Přihlášení se nezdařilo. Zkuste to prosím znovu.", 500);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter POST error:", err);
    return fail("failed", "Přihlášení se nezdařilo.", 500);
  }
}
