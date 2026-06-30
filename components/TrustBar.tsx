import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Expedice do 24 hodin",
    desc: "Objednávky přijaté do 14:00 odesíláme ještě tentýž den.",
  },
  {
    icon: RotateCcw,
    title: "30 dní na vrácení",
    desc: "Bez otázek. Zboží vrátíte do 30 dní od doručení.",
  },
  {
    icon: ShieldCheck,
    title: "Záruka 2 roky",
    desc: "Na veškeré zboží poskytujeme zákonnou záruku 24 měsíců.",
  },
  {
    icon: Headphones,
    title: "Podpora 7 dní v týdnu",
    desc: "Chat, e-mail nebo telefon — jsme tu každý den pro vás.",
  },
];

export default function TrustBar() {
  return (
    <section className="py-12">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3">
              {/* Ikona v kroužku */}
              <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center">
                <item.icon size={22} className="text-primary" />
              </div>
              {/* Titul */}
              <p className="text-text-base font-semibold text-sm underline underline-offset-2">{item.title}</p>
              {/* Popis */}
              <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}