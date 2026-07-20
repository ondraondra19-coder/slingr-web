// lib/newsletter.ts
// Přihlášení k newsletteru = přidání kontaktu do Resend Audience. Samotný sběr
// kontaktů funguje i PŘED ověřením domény (rozesílání kampaní přes Broadcasts
// už ne) — takže seznam odběratelů můžeme začít budovat hned.
//
// Odhlašování neřešíme tady: Resend do každého Broadcastu vloží unsubscribe
// odkaz/hlavičky a odhlášené kontakty z rozesílky sám vynechá.
import { Resend } from "resend";
import { isValidEmail } from "./emailValidation";

// Přidávání kontaktů (contacts API) vyžaduje klíč s "Full access" — odesílací
// (sending-only) klíč Resend odmítne s 401 "restricted_api_key". Proto tu
// máme VLASTNÍHO klienta, oddělený od transakčních e-mailů: kontakty jedou
// přes RESEND_CONTACTS_API_KEY (full access), zatímco RESEND_API_KEY může
// zůstat sending-only pro transakční poštu (princip nejmenších oprávnění —
// transakční cesta běží při každé objednávce). Když RESEND_CONTACTS_API_KEY
// není nastavené, spadneme na RESEND_API_KEY (ten pak ale musí být full access).
let contactsClient: Resend | null = null;

// Exportováno i pro lib/campaigns.ts (Broadcasts API vyžaduje stejný
// full-access klíč jako přidávání kontaktů).
export function getContactsClient(): Resend | null {
  const key = process.env.RESEND_CONTACTS_API_KEY ?? process.env.RESEND_API_KEY;
  if (!key) {
    console.error("❌ Chybí RESEND_CONTACTS_API_KEY i RESEND_API_KEY — kontakt se neuloží.");
    return null;
  }
  if (!contactsClient) contactsClient = new Resend(key);
  return contactsClient;
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not_configured" | "error" };

// Zůstává jako jméno používané API routami; pravidla žijí v lib/emailValidation.ts,
// aby klient i server posuzovaly adresu úplně stejně.
export const isValidNewsletterEmail = isValidEmail;

export async function subscribeToNewsletter(rawEmail: string): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidNewsletterEmail(email)) return { ok: false, reason: "invalid" };

  const resend = getContactsClient();
  if (!resend) return { ok: false, reason: "not_configured" };

  // RESEND_AUDIENCE_ID je VOLITELNÉ:
  //  - novější Resend účty mají jedinou výchozí Audience bez zobrazeného ID —
  //    kontakt se přidá přes POST /contacts (bez audienceId) rovnou do ní,
  //  - starší účty s více Audiences potřebují konkrétní ID (POST
  //    /audiences/{id}/contacts). Pokud je proměnná vyplněná, použije se ono.
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  try {
    const { error } = audienceId
      ? await resend.contacts.create({ audienceId, email, unsubscribed: false })
      : await resend.contacts.create({ email, unsubscribed: false });

    // Už existující kontakt Resend hlásí jako chybu — pro nás to není chyba,
    // uživatel prostě "je přihlášený". Navenek to nerozlišujeme: neprozrazovat,
    // jestli e-mail v seznamu už je (ochrana soukromí, žádné enumerování).
    if (error && !/already|exist/i.test(error.message ?? "")) {
      console.error("Resend contacts.create selhalo:", error);
      return { ok: false, reason: "error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Přihlášení k newsletteru selhalo:", err);
    return { ok: false, reason: "error" };
  }
}
