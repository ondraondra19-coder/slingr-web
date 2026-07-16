import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // POZOR: `formats` tu schválně NENÍ — Next tím sám použije WebP.
  //
  // AVIF vypadá lákavě, ale změřeno na tomhle katalogu se proti WebP nevyplatí:
  // na 7 reprezentativních obrázcích ušetřil 157 KB vs 178 KB, tedy 11.7 %.
  // Za těch ~20 KB se platí znatelně dražším dekódováním na CPU, a to na
  // slabém telefonu (Lighthouse emuluje Moto G Power se 4× škrceným CPU)
  // napříč ~16 obrázky homepage. Když byl AVIF zapnutý, medián TBT vyskočil
  // ze 190 ms na 460 ms.
  //
  // Velká úspora u obrázků (492 KiB -> 14 KiB) nepřišla z AVIF, ale z převodu
  // syrových <img> na next/image — ten dává WebP i bez týhle volby.
  // Než AVIF znovu zapneš, změř TBT před a po; samotná velikost souborů
  // o výhodnosti nerozhoduje.

  async headers() {
    return [
      {
        // Základní bezpečnostní hlavičky pro všechny cesty. CSP schválně
        // vynecháno (snadno rozbije Stripe.js / PostHog / inline skripty).
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);