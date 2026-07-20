// lib/emailValidation.ts
// Jediné místo, kde se rozhoduje, jestli je e-mailová adresa přijatelná.
//
// Dřív žil stejný volný regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` třikrát zvlášť
// (lib/newsletter.ts, FooterNewsletter.tsx, WelcomeDiscountPopup.tsx) a byl
// příliš benevolentní: `[^\s@]` je "cokoliv kromě mezery a zavináče", takže
// prošly i adresy jako `fdsv@Đsdf.cz`. U uvítací slevy to vadí dvakrát —
// návštěvník dostane kód rovnou v popupu, ale e-mail s ním nemá kam dojít.
//
// Bez závislostí (žádný Resend, žádný React), aby šel importovat ze serveru
// i z klienta a validace na obou stranách byla zaručeně stejná.

const MAX_EMAIL_LENGTH = 150;

// Doména musí být ASCII: písmena, číslice a pomlčky v labelech oddělených
// tečkou, na konci TLD z aspoň dvou písmen. Diakritika ani jiné ne-ASCII znaky
// sem nepatří — mezinárodní domény se posílají v punycode (xn--…), což tenhle
// vzor propustí. Lokální část záměrně taky ASCII: znaky, které v praxi
// používají poštovní servery, a nic navíc.
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) return false;
  // Dvě tečky za sebou ani tečka na kraji lokální části nejsou platné a
  // regexem výše by prošly.
  const [local] = trimmed.split("@");
  if (local.startsWith(".") || local.endsWith(".") || trimmed.includes("..")) return false;
  return EMAIL_REGEX.test(trimmed);
}
