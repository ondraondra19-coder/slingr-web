// Ruční opravy překladů — přepíší Google Translate
// Klíč: původní český text, hodnota: správný překlad pro daný jazyk

export const manualTranslations: Record<string, Record<string, string>> = {
  sk: {
    "Košík":   "Košík",    // GT přeloží jako "Basket", chceme "Košík"
    "iPad Pro 12.9\"": "iPad Pro 12.9\"",  // GT přeloží "Pro" jako "pre"
    "Apple Pencil Pro": "Apple Pencil Pro",
    "AirPods Pro 2": "AirPods Pro 2",
    "AirPods Pro 3": "AirPods Pro 3",
  },
  en: {
    "Basket":   "Cart",     // GT přeloží jako "Basket"
    "iPad Pro 12.9\"": "iPad Pro 12.9\"",
    "Apple Pencil Pro": "Apple Pencil Pro",
    "AirPods Pro 2": "AirPods Pro 2",
    "AirPods Pro 3": "AirPods Pro 3",
  },
};