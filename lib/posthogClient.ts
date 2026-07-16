// lib/posthogClient.ts
// Líný zavaděč posthog-js.
//
// PROČ: posthog-js má ~75 KB gzip. Dřív ho staticky importoval jak
// PostHogProvider (ten je v root layoutu), tak lib/analytics.ts — takže se
// stahoval do bundlu KAŽDÉ stránky, i když návštěvník souhlas s analytickými
// cookies nikdy nedal a knihovna se nikdy neinicializovala. Teď se import()
// spustí až ve chvíli, kdy souhlas existuje.
//
// Modul drží načtenou instanci v `instance`, takže getPostHog() zůstává
// synchronní a trackEvent() se kvůli tomu nemusí měnit na async.

import type posthogJs from "posthog-js";

type PostHog = typeof posthogJs;

let instance: PostHog | null = null;
let pending: Promise<PostHog> | null = null;

/** Vrátí už načtenou instanci, nebo null, pokud se posthog-js ještě nestahoval. */
export function getPostHog(): PostHog | null {
  return instance;
}

/** Stáhne posthog-js (jen jednou — souběžná volání sdílí stejný Promise). */
export function loadPostHog(): Promise<PostHog> {
  if (instance) return Promise.resolve(instance);
  if (!pending) {
    pending = import("posthog-js").then((m) => {
      instance = m.default;
      return instance;
    });
  }
  return pending;
}
