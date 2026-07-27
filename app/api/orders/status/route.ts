// app/api/orders/status/route.ts
// Veřejný endpoint pro stavovou stránku /objednavky — zákazník dohledá stav
// své objednávky podle ČÍSLA OBJEDNÁVKY (variabilní symbol z potvrzení) a
// E-MAILU. E-mail je druhý faktor: samotný VS je jen 8 číslic a dal by se
// uhodnout, takže bez shody e-mailu objednávku nevydáme.
//
// Bezpečnost:
//  - Odpověď obsahuje jen NUTNÝ výřez dat (stav, položky, částka, doprava,
//    tracking) — žádnou plnou adresu ani telefon.
//  - Špatné číslo i špatný e-mail vrací shodně `not_found`, ať přes stránku
//    nejde zjišťovat, která čísla objednávek existují.
//  - Rate limit brání dávkovému zkoušení kombinací.
//
// Chyby vrací `code` (ne hotovou větu) — text skládá klient podle jazyka,
// stejný vzor jako /api/claims.
import { NextResponse } from "next/server";
import { getOrderForStatus } from "@/lib/orders";
import { isValidEmail } from "@/lib/emailValidation";
import { orderIdToVariableSymbol } from "@/lib/qrPlatba";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

const MAX_ORDER_LENGTH = 40;
const MAX_EMAIL_LENGTH = 150;

export type OrderStatusErrorCode =
  | "invalid_order"
  | "invalid_order_format"
  | "invalid_email"
  | "not_found"
  | "cooldown"
  | "failed";

function fail(code: OrderStatusErrorCode, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ code, ...extra }, { status });
}

// Číslo objednávky = variabilní symbol z potvrzení → jen číslice (4–12).
function isValidOrderFormat(value: string): boolean {
  return /^\d{4,12}$/.test(value.replace(/\s+/g, ""));
}

// Zásilkovna/Packeta má veřejné sledování zásilky podle čísla — poskládáme
// odkaz, jen když zásilka reálně existuje a je od Zásilkovny.
function trackingUrl(trackingNumber: string): string {
  return `https://tracking.packeta.com/cs/?id=${encodeURIComponent(trackingNumber)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { cisloObjednavky, email } = body ?? {};

    if (typeof cisloObjednavky !== "string" || cisloObjednavky.trim().length === 0 || cisloObjednavky.length > MAX_ORDER_LENGTH) {
      return fail("invalid_order", 400);
    }
    if (!isValidOrderFormat(cisloObjednavky)) {
      return fail("invalid_order_format", 400);
    }
    if (typeof email !== "string" || email.trim().length === 0 || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email.trim())) {
      return fail("invalid_email", 400);
    }

    // Rate limit — víc pokusů povolíme (zákazník se může splést), ale ne dávku.
    // V dev prostředí přeskočíme, ať jde stránka opakovaně testovat.
    if (process.env.NODE_ENV === "production") {
      const ip = getClientIp(req);
      if (!(await checkRateLimit(`order-status:${ip}`, 10, 600))) {
        return fail("cooldown", 429);
      }
    }

    const order = await getOrderForStatus(cisloObjednavky, email);
    if (!order) {
      // Nerozlišujeme "neexistuje" od "špatný e-mail" — viz hlavička souboru.
      return fail("not_found", 404);
    }

    const hasShipment = Boolean(order.shipment?.trackingNumber);

    // Bezpečný výřez — bez adresy a telefonu.
    return NextResponse.json({
      ok: true,
      order: {
        number: orderIdToVariableSymbol(order.id),
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        currency: order.currency,
        total: order.total,
        shippingName: order.shippingName,
        items: order.items.map((it) => ({ name: it.name, quantity: it.quantity })),
        tracking: hasShipment
          ? {
              number: order.shipment!.trackingNumber,
              url: order.shipment!.provider === "zasilkovna" ? trackingUrl(order.shipment!.trackingNumber) : null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Order status POST error:", err);
    return fail("failed", 500);
  }
}
