import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { products } from '@/lib/products';

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key || key.trim() === "") {
    console.error("CHYBA: STRIPE_SECRET_KEY chybí!");
    return NextResponse.json({ error: "Platby nejsou nakonfigurovány." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { items, currency, orderData } = body;
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const stripe = new Stripe(key);

    const currencyCode: string = typeof currency === 'object' ? currency.code : currency;

    // ── Helper: cena produktu v dané měně ────────────────────────────────────
    function getUnitAmount(price: number | Record<string, number>, code: string): number {
      if (typeof price === 'number') return price;
      // Zkusíme požadovanou měnu, fallback na CZK
      return price[code] ?? price['CZK'] ?? 0;
    }

    // ── 1. Produkty ──────────────────────────────────────────────────────────
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((cartItem: any) => {
      const realProduct = products.find(p => p.slug === cartItem.slug);
      if (!realProduct) throw new Error(`Produkt ${cartItem.slug} nenalezen.`);

      const unitAmount = getUnitAmount(realProduct.price as any, currencyCode);
      if (!unitAmount || unitAmount <= 0) {
        throw new Error(`Neplatná cena pro produkt ${cartItem.slug} v měně ${currencyCode}`);
      }

      const variantLabel = cartItem.variants
        ? ` (${Object.values(cartItem.variants).join(' | ')})`
        : '';

      const imageUrl = cartItem.img?.startsWith('http')
        ? cartItem.img
        : `${origin}${cartItem.img}`;

      return {
        price_data: {
          currency: currencyCode.toLowerCase(),
          product_data: {
            name: `${realProduct.name}${variantLabel}`,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(unitAmount * 100),
        },
        quantity: cartItem.quantity,
      };
    });

    // ── 2. Doprava ───────────────────────────────────────────────────────────
    if (orderData?.dopravaPrice) {
      const shippingPrice = typeof orderData.dopravaPrice === 'number'
        ? orderData.dopravaPrice
        : (orderData.dopravaPrice as any)?.[currencyCode] || 0;

      if (shippingPrice > 0) {
        line_items.push({
          price_data: {
            currency: currencyCode.toLowerCase(),
            product_data: { name: `Doprava: ${orderData.dopravaName}` },
            unit_amount: Math.round(shippingPrice * 100),
          },
          quantity: 1,
        });
      }
    }

    // ── 3. Dobírka ───────────────────────────────────────────────────────────
    if (orderData?.isDobirka) {
      const dobirkaFees: Record<string, number> = { CZK: 39, EUR: 1.59, USD: 1.79 };
      const fee = dobirkaFees[currencyCode] ?? 39;
      line_items.push({
        price_data: {
          currency: currencyCode.toLowerCase(),
          product_data: { name: 'Příplatek za dobírku' },
          unit_amount: Math.round(fee * 100),
        },
        quantity: 1,
      });
    }

    // ── 4. Sleva — Stripe coupon ─────────────────────────────────────────────
    // Vytvoříme jednorázový coupon přímo v Stripe a použijeme ho na session.
    // Stripe coupons podporují jak procenta tak pevnou částku.
    let stripeCouponId: string | undefined;

    if (orderData?.discountAmountCZK && orderData.discountAmountCZK > 0) {
      // Přepočítáme slevu z CZK do aktuální měny poměrem košíku
      const subtotalCZK: number = items.reduce((sum: number, cartItem: any) => {
        const realProduct = products.find(p => p.slug === cartItem.slug);
        if (!realProduct) return sum;
        const priceCZK = getUnitAmount(realProduct.price as any, 'CZK');
        return sum + priceCZK * cartItem.quantity;
      }, 0);

      const subtotalInCurrency: number = items.reduce((sum: number, cartItem: any) => {
        const realProduct = products.find(p => p.slug === cartItem.slug);
        if (!realProduct) return sum;
        const price = getUnitAmount(realProduct.price as any, currencyCode);
        return sum + price * cartItem.quantity;
      }, 0);

      let discountInCurrency: number;
      if (currencyCode === 'CZK' || subtotalCZK === 0) {
        discountInCurrency = orderData.discountAmountCZK;
      } else {
        const ratio = subtotalInCurrency / subtotalCZK;
        discountInCurrency = orderData.discountAmountCZK * ratio;
      }

      const discountCents = Math.round(discountInCurrency * 100);

      if (discountCents > 0) {
        // Vytvoříme jednorázový coupon (amount_off = pevná sleva v centech)
        const coupon = await stripe.coupons.create({
          amount_off: discountCents,
          currency: currencyCode.toLowerCase(),
          name: orderData.discountCode
            ? `${orderData.discountCode} – ${orderData.discountLabel ?? 'Sleva'}`
            : 'Slevový kód',
          max_redemptions: 1, // jednorázový
        });
        stripeCouponId = coupon.id;
      }
    }

    // ── 5. Checkout Session ──────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items,
      mode: 'payment',
      // Přiložíme coupon pokud existuje
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      success_url: `${origin}/objednavka/uspech?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/kosik`,
      metadata: {
        order_items: JSON.stringify(items.map((i: any) => ({ slug: i.slug, qty: i.quantity }))),
        discount_code: orderData?.discountCode ?? '',
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('STRIPE ERROR:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}