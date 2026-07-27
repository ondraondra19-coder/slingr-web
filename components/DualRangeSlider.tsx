"use client";

// components/DualRangeSlider.tsx
// Dvouúchytový posuvník rozsahu (cena) — sdílený filtrem kategorie
// (KategorieClient) i stránkou výsledků hledání (/hledani). Popisky chodí
// zvenčí jako props, takže slider sám o překladech nic neví a jde použít i jinde.

import { useRef } from "react";

export default function DualRangeSlider({
  min, max, valueMin, valueMax, onChangeMin, onChangeMax, step = 10,
  labelMin, labelMax,
}: {
  min: number; max: number;
  valueMin: number; valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  step?: number;
  labelMin: string;
  labelMax: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const range = Math.max(max - min, 1);
  const pctMin = ((valueMin - min) / range) * 100;
  const pctMax = ((valueMax - min) / range) * 100;

  // Spodní úchyt zaokrouhlujeme DOLŮ a horní NAHORU (ne na nejbližší) — díky
  // tomu se rozsah vždy „rozšíří" na celé desítky ven a nejlevnější/nejdražší
  // produkt z filtru nevypadne (např. 599 Kč: spodní mez drží na 590, ne 600).
  function valueFromClientX(clientX: number, round: (n: number) => number): number {
    const rect = trackRef.current!.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return round((min + frac * range) / step) * step;
  }

  // Pointer Capture API: jednou zachycený ukazatel posílá move/up eventy přímo
  // tomuto úchytu bez ohledu na to, co je pod kurzorem nebo jak se mezitím
  // překreslí okolí — na rozdíl od dvou překrytých native <input type="range">
  // (viz komentář u .range-slider v globals.css), tady se tah nikdy nepřeruší.
  function startDrag(onChange: (v: number) => void, clamp: (v: number) => number, round: (n: number) => number) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      onChange(clamp(valueFromClientX(e.clientX, round)));
    };
  }

  function handleDrag(onChange: (v: number) => void, clamp: (v: number) => number, round: (n: number) => number) {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      onChange(clamp(valueFromClientX(e.clientX, round)));
    };
  }

  const clampMin = (v: number) => Math.min(v, valueMax - step);
  const clampMax = (v: number) => Math.max(v, valueMin + step);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm font-bold text-text-base">
        <span>{valueMin} Kč</span>
        <span>{valueMax} Kč</span>
      </div>
      <div ref={trackRef} className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        {/* Úchyt: viditelný kroužek zůstává 16px (vnitřní <span>), ale samotný
            div je 32×32 a průhledný — dotykový cíl tak splní 24×24 minimum.
            aria-valuetext říká čtečce "1290 Kč", ne holé číslo. */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={labelMin}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMin}
          aria-valuetext={`${valueMin} Kč`}
          className="absolute top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${pctMin}%` }}
          onPointerDown={startDrag(onChangeMin, clampMin, Math.floor)}
          onPointerMove={handleDrag(onChangeMin, clampMin, Math.floor)}
          onKeyDown={e => {
            if (e.key === "ArrowRight") onChangeMin(clampMin(valueMin + step));
            if (e.key === "ArrowLeft") onChangeMin(Math.max(valueMin - step, min));
          }}
        >
          <span aria-hidden="true" className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow" />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label={labelMax}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={valueMax}
          aria-valuetext={`${valueMax} Kč`}
          className="absolute top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${pctMax}%` }}
          onPointerDown={startDrag(onChangeMax, clampMax, Math.ceil)}
          onPointerMove={handleDrag(onChangeMax, clampMax, Math.ceil)}
          onKeyDown={e => {
            if (e.key === "ArrowLeft") onChangeMax(clampMax(valueMax - step));
            if (e.key === "ArrowRight") onChangeMax(Math.min(valueMax + step, max));
          }}
        >
          <span aria-hidden="true" className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow" />
        </div>
      </div>
    </div>
  );
}
