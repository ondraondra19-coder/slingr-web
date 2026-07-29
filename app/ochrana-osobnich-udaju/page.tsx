import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyPage from "@/components/legal/PrivacyPage";

// Serverová stránka jen kvůli metadata — ta z klientské komponenty exportovat
// nejdou. Text je klientský, protože se vybírá podle jazyka (viz lib/locale.ts).
// Bez „| Slingr" — značku doplní `template` z app/layout.tsx.
export const metadata = {
  title: "Ochrana osobních údajů",
};

export default function OchranaOsobnichUdajuPage() {
  return (
    <>
      <Header />
      <PrivacyPage />
      <Footer />
    </>
  );
}
