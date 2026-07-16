"use client";

// components/PostHogProvider.tsx
// Nahrazuje starý AnalyticsTracker. PostHog se vůbec nenačte/nezapne,
// dokud uživatel neodsouhlasí "Analytické cookies" — žádný request na
// PostHog se dřív neposílá. Po odvolání souhlasu (CONSENT_CHANGED_EVENT)
// se sledování okamžitě vypne a lokální identita se smaže.
//
// Přihlášený admin se NIKDY netrackuje (i kdyby cookies odsouhlasil) —
// při přihlášení se vedle httpOnly session cookie nastaví i čitelný
// "admin_hint" cookie (viz lib/adminAuth.ts), podle kterého se tu
// sledování rovnou vypne.
//
// posthog-js se sem NEimportuje staticky — je to ~75 KB, které by se stahovaly
// do bundlu každé stránky i bez souhlasu. Stáhne se dynamicky (loadPostHog)
// teprve ve chvíli, kdy souhlas skutečně padne.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPostHogLoaded } from "@/lib/analytics";
import { getPostHog, loadPostHog } from "@/lib/posthogClient";
import { CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const ADMIN_HINT_COOKIE = "admin_hint"; // musí odpovídat ADMIN_HINT_COOKIE_NAME v lib/adminAuth.ts

function isAdminSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${ADMIN_HINT_COOKIE}=`));
}

// Na /admin* se netrackuje nikdy, ani před přihlášením (admin_hint cookie
// existuje až PO přihlášení) — je to interní nástroj, ne návštěvnická stránka.
function isAdminRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin");
}

function capturePageview() {
  getPostHog()?.capture("$pageview", { $current_url: window.location.href });
}

// Teprve tady se posthog-js stáhne ze sítě — dřív než sem se běh dostane jen
// tehdy, když je souhlas udělený a nejde o admina.
async function startPostHog() {
  if (!POSTHOG_KEY || !POSTHOG_HOST || isPostHogLoaded() || isAdminSession() || isAdminRoute()) return;
  const posthog = await loadPostHog();
  // Mezi await a init mohl uživatel souhlas stihnout odvolat (nebo se odnavigovat
  // do adminu) — druhá kontrola brání tomu, aby se PostHog zapnul až po odvolání.
  if (!hasAnalyticsConsent() || isAdminSession() || isAdminRoute()) return;
  if (isPostHogLoaded()) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // posíláme ručně kvůli App Router client-side navigaci
    autocapture: true,
  });
  capturePageview(); // jinak by se stránka, na které padne souhlas, nikdy nezapočítala
}

// PostHog si identifikátor ukládá do cookie ph_<klíč>_posthog a pod stejným
// klíčem do localStorage. Když souhlas padne ve chvíli, kdy PostHog na téhle
// stránce ještě není načtený (typicky odvolání a následný reload), není koho
// požádat o úklid — posbíráme to proto sami. Bez tohohle by po odvolání
// souhlasu zůstal identifikátor v prohlížeči ležet dál.
//
// POZOR: maže se jen prefix "ph_" (identita), NIKDY "__ph_opt_in_out_*" —
// tahle cookie samotné odvolání vynucuje. Kdyby se smazala, PostHog by
// zapomněl, že je odhlášený, a odvolání by se tím zrušilo.
function clearPostHogStorage() {
  if (typeof document === "undefined") return;

  for (const entry of document.cookie.split("; ")) {
    const name = entry.split("=")[0];
    if (!name.startsWith("ph_")) continue;
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = expired;
    document.cookie = `${expired} domain=${location.hostname};`;
    document.cookie = `${expired} domain=.${location.hostname};`;
  }

  try {
    // Object.keys vrací kopii, takže mazání během procházení je bezpečné.
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("ph_")) localStorage.removeItem(key);
    }
  } catch {}
}

function stopPostHog() {
  // Když se posthog-js nikdy nestáhl, není co odhlašovat — jen uklidíme
  // případné pozůstatky z dřívější návštěvy (viz clearPostHogStorage).
  if (isPostHogLoaded()) {
    const posthog = getPostHog()!;
    posthog.opt_out_capturing();
    posthog.reset(true); // true = zahodit i device_id, nejen distinct_id
  }
  clearPostHogStorage();
}

function syncTrackingState() {
  if (isAdminSession() || isAdminRoute() || !hasAnalyticsConsent()) {
    stopPostHog();
    return;
  }
  if (isPostHogLoaded()) {
    getPostHog()!.opt_in_capturing();
    capturePageview();
  } else {
    // Bez await: listener CONSENT_CHANGED_EVENT musí zůstat synchronní.
    // Chyba stahování nesmí shodit stránku — analytika prostě nenaběhne.
    void startPostHog().catch(() => {});
  }
}

export default function PostHogProvider() {
  const pathname = usePathname();
  // Zabrání duplicitnímu $pageview: mount efekt už jednou odešle pageview,
  // pokud souhlas existuje už při načtení stránky (viz startPostHog výše).
  const skipNextPathnameCapture = useRef(true);

  useEffect(() => {
    syncTrackingState();

    window.addEventListener(CONSENT_CHANGED_EVENT, syncTrackingState);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, syncTrackingState);
  }, []);

  useEffect(() => {
    if (skipNextPathnameCapture.current) {
      skipNextPathnameCapture.current = false;
      return;
    }
    // Řeší i případ přihlášení do adminu (přesměrování na /admin je změna
    // pathname) — okamžitě se tím vypne případné už běžící sledování.
    if (isAdminSession() || isAdminRoute()) {
      stopPostHog();
      return;
    }
    if (!isPostHogLoaded() || !hasAnalyticsConsent()) return;
    capturePageview();
  }, [pathname]);

  return null;
}
