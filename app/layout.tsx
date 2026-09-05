import type { Metadata, Viewport } from "next"; // Přidán import Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import ChatWidget from "@/components/ChatWidget";
import CookieBanner from "@/components/CookieBanner";
import WelcomeDiscountPopup from "@/components/WelcomeDiscountPopup";
import PostHogProvider from "@/components/PostHogProvider";
import { LangProvider } from "@/lib/LangContext";
import { SITE_URL } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Základ pro skládání ABSOLUTNÍCH adres v náhledech při sdílení odkazu.
  // Facebook, WhatsApp a spol. si stránku stahují zvenku, takže relativní
  // "/opengraph-image.png" jim nic neřekne — musí dostat plnou adresu
  // i s doménou. Tohle zařídí, že ji Next doplní sám.
  //
  // Bere se z lib/siteUrl.ts, takže po nastavení NEXT_PUBLIC_SITE_URL
  // (ostrá doména) se to přepne samo a sem se sahat nemusí.
  metadataBase: new URL(SITE_URL),
  // `default` je titulek homepage a fallback; `template` se použije všude, kde
  // stránka nastaví vlastní `title` (např. kategorie → "Zbraně | Slingr").
  // Produkty si nastavují `title.absolute`, protože značku už nesou v názvu.
  title: {
    default: "Slingr | praky a výbava na venkovní bitvy",
    template: "%s | Slingr",
  },
  description:
    "Praky, měkká munice, vodní balónky a terče na venkovní bitvy. Rozjeď vodní válku nebo souboj o nejlepší mušku — expedice do 24 hodin.",
};

// OPRAVA: Exportujeme nastavení viewportu, které iPhonu povolí roztáhnout web pod notch/Dynamic Island
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        {/* Černá stavová lišta v iOS. Značku <meta name="viewport"> sem NEPIŠ —
            generuje ji Next z exportu `viewport` výš. Byla tu obojí, takže
            stránka posílala dvě konkurenční definice téhož. */}
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* CurrencyProvider je vně, aby CartProvider mohl reagovat na změnu měny.
            ChatWidget/CookieBanner/WelcomeDiscountPopup musí být UVNITŘ
            LangProvideru — všechny tři překládají přes useT() a mimo provider
            by jim useLang() vracelo výchozí kontext, takže by zůstaly česky
            i po přepnutí jazyka. */}
        <LangProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CurrencyProvider>

          <ChatWidget />
          <CookieBanner />
          <WelcomeDiscountPopup />
        </LangProvider>

        <PostHogProvider />
      </body>
    </html>
  );
}