"use client";

// components/AnalyticsTracker.tsx
// Neviditelná komponenta — pošle beacon na /api/track MAXIMÁLNĚ JEDNOU za
// relaci prohlížeče (hlídáno přes sessionStorage, ne cookie), a JEN pokud
// uživatel odsouhlasil "Analytické cookies". Bez souhlasu se nevytváří
// žádný požadavek. Nesleduje jednotlivá překliknutí mezi stránkami —
// zaznamená se jen vstupní stránka dané návštěvy.
import { useEffect } from "react";
import { CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from "./CookieBanner";

const SESSION_FLAG = "hackpack-analytics-sent";

function sendVisitBeacon() {
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return; // za tuhle relaci už bylo odesláno
  } catch {
    // sessionStorage nedostupný (např. soukromé prohlížení) — zkusíme poslat i tak
  }

  const payload = JSON.stringify({
    path: window.location.pathname,
    referrer: document.referrer,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", { method: "POST", body: payload, keepalive: true });
    }
    sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // Tracking nesmí nikdy ovlivnit chod stránky.
  }
}

export default function AnalyticsTracker() {
  useEffect(() => {
    if (hasAnalyticsConsent()) sendVisitBeacon();

    // Pokud uživatel odsouhlasí cookies přes banner až v průběhu návštěvy,
    // zaznamenáme ji (jednorázově) hned v tu chvíli.
    function onConsentChanged() {
      if (hasAnalyticsConsent()) sendVisitBeacon();
    }
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
  }, []);

  return null;
}