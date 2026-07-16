import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // AVIF/WebP místo původních PNG/JPEG. Next zkouší formáty v tomto pořadí
    // a podle Accept hlavičky prohlížeče vybere první podporovaný; staré
    // prohlížeče dostanou originál, takže je to bezpečné.
    formats: ["image/avif", "image/webp"],
  },

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