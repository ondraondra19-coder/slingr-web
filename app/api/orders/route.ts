// app/api/orders/route.ts
// Zakládá objednávku PŘÍMO (bez Stripe) — pro platbu na dobírku a bankovním
// převodem. Platba kartou jde přes /api/checkout → Stripe → webhook.
import { NextResponse } from "next/server";
import { getProductsWithPriceOverrides, resolveItemUnitPrice } from "@/lib/priceOverrides";
import { createOrderDirect, type OrderInput, type PaymentMethod } from "@/lib/orders";
import { deductStockForItems } from "@/lib/stock";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, currency, orderData, paymentMethod } = body;

    if (paymentMethod !== "dobirka" && paymentMethod !== "prevod") {
      return NextResponse.json({ error: "Neplatný způsob platby pro tento endpoint." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Košík je prázdný." }, { status: 400 });
    }

    const currencyCode: string = typeof currency === "object" ? currency.code : currency;

    // Katalog s aplikovanými přepisy cen z admina — viz stejná poznámka
    // v /api/checkout/route.ts.
    const effectiveProducts = await getProductsWithPriceOverrides();

    let subtotal = 0;
    const resolvedItems = items.map((i: any) => {
      const realProduct = effectiveProducts.find((p) => p.slug === i.slug);
      const unitPrice = realProduct ? resolveItemUnitPrice(realProduct, i.variants, currencyCode) : 0;
      subtotal += unitPrice * i.quantity;
      return {
        slug: i.slug,
        name: realProduct?.name ?? i.slug,
        quantity: i.quantity,
        unitPrice,
        variants: i.variants,
        stockKey: i.stockKey,
      };
    });

    const shippingPrice: number =
      typeof orderData?.dopravaPrice === "number"
        ? orderData.dopravaPrice
        : orderData?.dopravaPrice?.[currencyCode] ?? 0;

    const dobirkaFees: Record<string, number> = { CZK: 39, EUR: 1.59, USD: 1.79 };
    const dobirkaFee = paymentMethod === "dobirka" ? dobirkaFees[currencyCode] ?? 39 : 0;

    // Sleva se u dobírky/převodu neřeší přes Stripe coupon — jen si ji
    // zaznamenáme pro přehled v adminu (odečet z celkové částky).
    const discountAmountCZK = orderData?.discountAmountCZK ?? 0;
    let discountInCurrency = 0;
    if (discountAmountCZK > 0) {
      const subtotalCZK = items.reduce((sum: number, i: any) => {
        const p = effectiveProducts.find((pr) => pr.slug === i.slug);
        return sum + (p ? resolveItemUnitPrice(p, i.variants, "CZK") : 0) * i.quantity;
      }, 0);
      discountInCurrency =
        currencyCode === "CZK" || subtotalCZK === 0
          ? discountAmountCZK
          : discountAmountCZK * (subtotal / subtotalCZK);
    }

    const orderInput: OrderInput = {
      currency: currencyCode,
      paymentMethod: paymentMethod as PaymentMethod,
      customer: {
        jmeno: orderData?.jmeno ?? "",
        email: orderData?.email ?? "",
        telefon: orderData?.telefon ?? "",
        firma: orderData?.firma ?? undefined,
        ic: orderData?.ic ?? undefined,
        dic: orderData?.dic ?? undefined,
      },
      address: orderData?.adresa ?? { mesto: "", uliceCp: "", psc: "", zeme: "" },
      deliveryAddress: orderData?.jineDorucenoAdresa ? orderData?.dorAdresa ?? null : null,
      poznamka: orderData?.poznamka ?? "",
      shippingName: orderData?.dopravaName ?? "Doprava",
      shippingPrice,
      isDobirka: paymentMethod === "dobirka",
      dobirkaFee,
      discountCode: orderData?.discountCode ?? null,
      discountLabel: orderData?.discountLabel ?? null,
      discountAmountCZK,
      items: resolvedItems,
      subtotal,
      total: subtotal + shippingPrice + dobirkaFee - discountInCurrency,
      zboxId: orderData?.zbox?.id ?? null,
    };

    const order = await createOrderDirect(orderInput);

    // Dobírka/převod nemá platební potvrzení jako karta — sklad si
    // "rezervujeme" hned při vytvoření objednávky, stejně jako by to
    // udělal kamenný obchod při přijetí objednávky k vyřízení.
    await deductStockForItems(order.items);

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err: any) {
    console.error("Chyba při vytváření objednávky (dobírka/převod):", err);
    return NextResponse.json({ error: "Objednávku se nepodařilo uložit." }, { status: 500 });
  }
}