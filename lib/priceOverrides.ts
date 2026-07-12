// lib/priceOverrides.ts
// Ceny produktů jsou původně natvrdo v lib/products.ts (statický katalog).
// Tohle je vrstva PŘEPISŮ nad ním — admin uloží novou cenu do Redisu, a ta
// se při čtení "podsune" místo té z katalogu. Katalog samotný (lib/products.ts)
// se nemění, takže default hodnoty zůstávají zachované jako záloha.
//
// Klíč v Redis hashi:
//   - "slug"            → přepis základní ceny produktu (product.price)
//   - "slug::modelId"    → přepis ceny konkrétního modelu (u produktů s
//                          variantami typu "models", např. pouzdro na tužku
//                          s modely usbc/pro — každý má svou vlastní cenu)
import { getRedis } from "./redis";
import { products as catalogProducts, type Product, type PriceValue } from "./products";

const HASH_KEY = "products:price_overrides";

function overrideKey(slug: string, modelId?: string): string {
  return modelId ? `${slug}::${modelId}` : slug;
}

export async function getPriceOverrides(): Promise<Record<string, PriceValue>> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string | PriceValue>>(HASH_KEY);
  if (!raw) return {};
  const result: Record<string, PriceValue> = {};
  for (const [key, value] of Object.entries(raw)) {
    result[key] = typeof value === "string" ? (JSON.parse(value) as PriceValue) : value;
  }
  return result;
}

export async function setPriceOverridesBulk(
  entries: { slug: string; modelId?: string; price: PriceValue }[],
): Promise<void> {
  if (entries.length === 0) return;
  const redis = getRedis();
  const fields: Record<string, string> = {};
  for (const { slug, modelId, price } of entries) {
    fields[overrideKey(slug, modelId)] = JSON.stringify(price);
  }
  await redis.hset(HASH_KEY, fields);
}

// Vrátí kopii katalogu s aplikovanými přepisy cen — používají to stránky,
// které zákazníkovi ZOBRAZUJÍ ceny (detail produktu, kategorie, homepage).
export async function getProductsWithPriceOverrides(): Promise<Product[]> {
  const overrides = await getPriceOverrides();
  if (Object.keys(overrides).length === 0) return catalogProducts;

  return catalogProducts.map((product) => {
    const productOverride = overrides[overrideKey(product.slug)];
    const next: Product = productOverride ? { ...product, price: productOverride } : { ...product };

    if (product.models && product.models.length > 0) {
      next.models = product.models.map((model) => {
        const modelOverride = overrides[overrideKey(product.slug, model.id)];
        return modelOverride ? { ...model, price: modelOverride } : model;
      });
    }

    return next;
  });
}

// Cena JEDNOHO produktu/modelu — používají to /api/checkout a /api/orders,
// aby částka, která se skutečně strhne, VŽDY odpovídala aktuální ceně
// (nezávisle na tom, kdy naposledy proběhl deploy).
export async function getEffectivePrice(slug: string, modelId?: string): Promise<PriceValue | null> {
  const overrides = await getPriceOverrides();
  const override = overrides[overrideKey(slug, modelId)];
  if (override) return override;

  const product = catalogProducts.find((p) => p.slug === slug);
  if (!product) return null;

  if (modelId && product.models) {
    const model = product.models.find((m) => m.id === modelId);
    return model?.price ?? product.price;
  }
  return product.price;
}

function getUnitAmountFor(price: PriceValue, code: string): number {
  if (typeof price === "number") return price;
  return (price as Record<string, number>)[code] ?? price.CZK ?? 0;
}

// Dopočítá skutečnou jednotkovou cenu položky košíku — VČETNĚ modelu (u
// produktů s variantami typu "models", každý model může mít jinou cenu) a
// VČETNĚ příplatku za namíchané barvy u vrstvených produktů (tělo ≠ hlavička).
// `product` už musí mít aplikované price overrides (viz getProductsWithPriceOverrides).
// Tohle je to samé, co počítá ProduktClient.tsx na klientovi — ale běží to
// znovu na serveru, aby nešlo cenu ovlivnit úpravou požadavku v prohlížeči.
export function resolveItemUnitPrice(
  product: Product,
  variants: Record<string, string> | undefined,
  currencyCode: string,
): number {
  if (product.models && product.models.length > 0 && variants?.Model) {
    const model = product.models.find((m) => m.label === variants.Model);
    if (model) {
      let amount = getUnitAmountFor(model.price, currencyCode);
      const bodyColor = variants["Tělo"];
      const capColor = variants["Hlavička"];
      if (model.layered && bodyColor && capColor && bodyColor !== capColor && model.comboExtra) {
        amount += getUnitAmountFor(model.comboExtra, currencyCode);
      }
      return amount;
    }
  }
  return getUnitAmountFor(product.price, currencyCode);
}