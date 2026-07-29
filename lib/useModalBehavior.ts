"use client";

// lib/useModalBehavior.ts
// Dvě věci, které musí umět KAŽDÝ překryv (modál, výsuvný panel, filtr na
// mobilu), a doteď je uměl jen SearchOverlay:
//
//  1. ZAMKNOUT ROLOVÁNÍ STRÁNKY POD SEBOU. Bez toho se na mobilu pod otevřeným
//     panelem roluje obsah — člověk chce posunout filtr, a místo toho mu ujede
//     výpis produktů vzadu. Na desktopu navíc zmizí posuvník a stránka poskočí
//     do strany, proto se ta šířka dorovná paddingem.
//  2. ZAVŘÍT NA ESCAPE. Panely se tváří jako `role="dialog" aria-modal="true"`,
//     což čtečkám i klávesnicovým uživatelům slibuje, že Escape funguje.
//
// Vnořené překryvy: zamykání se počítá (`lockCount`), takže když se nad sebou
// otevřou dva panely, zavření toho horního rolování nepustí zpátky.

import { useEffect, type RefObject } from "react";

let lockCount = 0;
let restoreOverflow = "";
let restorePadding = "";

function lockScroll() {
  if (lockCount === 0) {
    const { body } = document;
    restoreOverflow = body.style.overflow;
    restorePadding = body.style.paddingRight;
    // Šířka posuvníku — na mobilu 0 (overlay scrollbary), na desktopu ~15 px.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbar}px`;
    }
    body.style.overflow = "hidden";
  }
  lockCount++;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = restoreOverflow;
    document.body.style.paddingRight = restorePadding;
  }
}

/**
 * Zamkne rolování stránky a naváže Escape, dokud je `open` true.
 *
 * @param open    Je překryv otevřený?
 * @param onClose Zavolá se při stisku Escape. Když se vynechá, Escape se neváže
 *                (pro překryvy, které zavřít nejdou — třeba lišta se souhlasem).
 */
export function useModalBehavior(open: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  useEffect(() => {
    if (!open || !onClose) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose!();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
}

/**
 * Zavře rozbalovací nabídku klikem/ťuknutím mimo ni a na Escape — pro malé
 * dropdowny (řazení, měna), které nezaslouží celý modál.
 *
 * `pointerdown` místo `mousedown`: na dotykovém displeji mousedown chodí až po
 * dokončení ťuknutí, takže nabídka zůstávala otevřená, dokud člověk neťukl
 * podruhé. Hlavička si tohle řeší po svém (utilityRef), tady jde o výpisy.
 */
export function useDismissOnOutside(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, ref, onClose]);
}
