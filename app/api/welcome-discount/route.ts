// app/api/welcome-discount/route.ts
// Veřejný endpoint — uvítací popup se slevou za e-mail
// (components/WelcomeDiscountPopup.tsx).
//
// Dělá tři věci: přidá kontakt do Resend Audience, zajistí existenci kódu
// v Redisu a pošle kód e-mailem.
//
// KÓD SE V ODPOVĚDI NEVRACÍ. Validace umí ověřit jen tvar adresy, ne jestli
// schránka existuje — kdyby kód chodil v odpovědi, dostal by ho i ten, kdo
// zadal `fjwoei@isf.jn`. Doručení do schránky je jediné skutečné ověření,
// takže e-mail je jediná cesta ke kódu (viz lib/welcomeDiscount.ts).
//
// Chyby vrací `code`, ne hotovou větu — stejný důvod jako u /api/newsletter:
// jazyk návštěvníka drží cookie čtená až po hydrataci, takže text skládá až
// klient (messages/*.json → namespace `welcomeDiscount`).
import { NextResponse } from "next/server";
import { subscribeToNewsletter, isValidNewsletterEmail } from "@/lib/newsletter";
import { ensureWelcomeDiscount } from "@/lib/discountsStore";
import { sendWelcomeDiscountEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

export type WelcomeDiscountErrorCode =
  | "invalid_email"
  | "rate_limited"
  | "not_configured"
  | "send_failed"
  | "failed";

function fail(code: WelcomeDiscountErrorCode, error: string, status: number) {
  return NextResponse.json({ code, error }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!isValidNewsletterEmail(email)) {
      return fail("invalid_email", "Zadejte platný e-mail.", 400);
    }

    // Přísnější než u patičkového newsletteru (5/h): tady se za každý průchod
    // ještě odesílá e-mail, takže by ze skriptovaného formuláře šlo dělat
    // rozesílku na cizí adresy.
    const ip = getClientIp(req);
    if (!(await checkRateLimit(`welcome-discount:${ip}`, 3, 3600))) {
      return fail("rate_limited", "Příliš mnoho pokusů. Zkuste to prosím později.", 429);
    }

    const discount = await ensureWelcomeDiscount();

    // POŘADÍ JE ZÁMĚRNÉ: nejdřív odeslat, teprve pak zapsat kontakt.
    // Validace ověří jen tvar adresy, takže `fjwoei@isf.jn` se sem dostane —
    // kdyby se kontakt ukládal první, plnil by se Audience adresami, na které
    // nikdy nic nedorazilo. Úspěšné odeslání je jediný důkaz, že schránka
    // existuje, a zároveň jediná cesta ke kódu; proto se jeho selhání na
    // rozdíl od ostatních send* volání v projektu nesmí spolknout.
    const sent = await sendWelcomeDiscountEmail({
      to: email.trim(),
      code: discount.code,
      percent: discount.value,
    });

    if (!sent) {
      return fail("send_failed", "Slevový kód se nepodařilo odeslat.", 502);
    }

    // Kód už je na cestě, takže tady se chyba jen loguje — zákazníkovi nemá
    // smysl hlásit neúspěch kvůli něčemu, co se ho netýká, a opakované
    // odeslání formuláře by mu poslalo druhý mail.
    const subscribed = await subscribeToNewsletter(email);
    if (!subscribed.ok) {
      console.error(`Kontakt ${email} se nepodařilo uložit do Audience:`, subscribed.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Welcome discount POST error:", err);
    return fail("failed", "Nepodařilo se slevu přidělit.", 500);
  }
}
