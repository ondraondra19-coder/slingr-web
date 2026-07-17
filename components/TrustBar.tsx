"use client";

import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { useT } from "@/lib/useT";

export default function TrustBar() {
  const t = useT("trustbar");

  // Klíče schválně vypsané, ne skládané přes `t(`${key}Title`)` — takhle je
  // najde scripts/check-messages.mjs a pozná, že se používají.
  const items = [
    { icon: Truck,       title: t("shippingTitle"), desc: t("shippingDesc") },
    { icon: RotateCcw,   title: t("returnsTitle"),  desc: t("returnsDesc")  },
    { icon: ShieldCheck, title: t("warrantyTitle"), desc: t("warrantyDesc") },
    { icon: Headphones,  title: t("supportTitle"),  desc: t("supportDesc")  },
  ];

  return (
    <section className="py-12">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3">
              {/* Ikona v kroužku */}
              <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center">
                <item.icon size={22} className="text-primary-ink" />
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
