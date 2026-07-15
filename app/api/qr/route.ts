// app/api/qr/route.ts
// Vrací PNG s QR platbou (SPD formát) — používá ho potvrzovací e-mail
// (lib/email.ts), protože e-mailoví klienti jako Gmail base64 data: URI
// obrázky vkládané přímo do HTML blokují, takže musí jít o hostovanou URL.
// IBAN se BERE VŽDY ze serverové env proměnné, nikdy z parametru requestu —
// veřejný endpoint bez auth, kdyby šel iban zadat v query, dal by se takhle
// rozeslat QR kód, co vypadá jako od nás, ale platí na cizí účet.
import QRCode from "qrcode";
import { buildSpdString } from "@/lib/qrPlatba";

export async function GET(req: Request) {
  const iban = process.env.NEXT_PUBLIC_BANK_ACCOUNT_IBAN;
  if (!iban) {
    return new Response("QR platba není nastavena.", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const amount = parseFloat(searchParams.get("amount") ?? "");
  const currency = searchParams.get("currency") ?? "CZK";
  const vs = searchParams.get("vs") ?? undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return new Response("Neplatná částka.", { status: 400 });
  }

  const spd = buildSpdString({ iban, amount, currency, variableSymbol: vs, message: "Dekujeme za objednavku" });
  const png = await QRCode.toBuffer(spd, { width: 240, margin: 1 });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Stejná objednávka (amount+vs) vždy vygeneruje stejný QR kód, klidně
      // ať si to e-mailoví klienti/CDN cachují natvrdo.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
