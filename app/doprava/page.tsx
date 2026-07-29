import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DopravaClient from "@/components/DopravaClient";

// Serverová stránka jen kvůli metadata — ta z klientské komponenty exportovat
// nejdou, a titulek stránky je pro vyhledávače podstatný. Obsah je klientský,
// protože texty potřebují jazyk (viz lib/locale.ts).
// Titulek BEZ "| Slingr" — značku doplní `template` z app/layout.tsx, jinak by
// se v záložce prohlížeče objevila dvakrát.
export const metadata = {
  title: "Doprava a platba",
  description: "Ceny dopravy přes Zásilkovnu, způsoby platby a co se děje s objednávkou od potvrzení až po doručení.",
};

export default function DopravaAPlatbaPage() {
  return (
    <>
      <Header />
      <DopravaClient />
      <Footer />
    </>
  );
}
