// lib/qrPlatba.ts
// Česká "QR Platba" — standard České bankovní asociace (spec: qr-platba.cz),
// SPD (Short Payment Descriptor) formát, který umí naskenovat prakticky
// každá česká bankovní aplikace a rovnou předvyplní účet/částku/VS.

export type QrPlatbaInput = {
  iban: string;
  amount: number;
  currency: string;
  variableSymbol?: string;
  message?: string;
};

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(COMBINING_MARKS, "");
}

// MSG podle spec doporučeně bez diakritiky — ne všechny bankovní aplikace
// UTF-8 v tomhle poli spolehlivě zobrazí.
export function buildSpdString({ iban, amount, currency, variableSymbol, message }: QrPlatbaInput): string {
  const parts = [
    "SPD*1.0",
    `ACC:${iban.replace(/\s+/g, "").toUpperCase()}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency.toUpperCase()}`,
  ];
  if (variableSymbol) parts.push(`X-VS:${variableSymbol.replace(/\D/g, "")}`);
  if (message) parts.push(`MSG:${stripDiacritics(message).slice(0, 60)}`);
  return parts.join("*");
}

// Odvodí variabilní symbol ze skutečného ID objednávky (ne z náhodného
// zobrazovacího čísla) — používá to děkovná stránka i potvrzovací e-mail,
// aby si šla platba vždy spárovat s pravou objednávkou podle VS.
export function orderIdToVariableSymbol(orderId: string): string {
  const digits = orderId.replace(/\D/g, "").slice(-8).padStart(8, "0");
  return digits || "0";
}
