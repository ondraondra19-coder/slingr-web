// app/api/stock-availability/route.ts
import { NextResponse } from "next/server";
import { getProductStock } from "@/lib/stock";
import {
  reserveStock,
  releaseStock,
  getReservedQuantity,
  getMyReservation,
} from "@/lib/reservations";

// ── GET ────────────────────────────────────────────────────────────────────
// Vrátí dostupnost pro danou variantu:
// available = sklad − rezervace OSTATNÍCH (moje vlastní se neodečítá)
// myReservation = kolik já sám mám zarezervováno
//
// Query: ?slug=...&variant=...&sessionId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const variant = searchParams.get("variant") ?? "-|-";
  const sessionId = searchParams.get("sessionId") ?? "";

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const stockData = await getProductStock(slug);
    const rawStock = stockData[variant] ?? 0;

    const reservedByOthers = await getReservedQuantity(slug, variant, sessionId);
    const myReservation = sessionId ? await getMyReservation(slug, variant, sessionId) : 0;

    // Kolik si JEŠTĚ může zákazník přidat nad rámec toho co už má
    const available = Math.max(0, rawStock - reservedByOthers);

    return NextResponse.json({
      rawStock,
      reservedByOthers,
      myReservation,
      available,
    });
  } catch (error) {
    console.error("Stock availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────
// Vytvoří/aktualizuje nebo zruší rezervaci.
// quantity = celkové množství které zákazník chce mít (ne delta/přírůstek)
// quantity = 0 znamená "zruš rezervaci"
//
// Logika:
// maxAllowed = rawStock - reservedByOthers  (co smí mít zákazník celkem)
// clampedQuantity = min(quantity, maxAllowed)
//
// Tím pádem zákazník 1 který má 2 kusy a chce přidat 2 další (quantity=4)
// dostane clampedQuantity=4 pokud sklad=4 a ostatní nemají nic.
// Zákazník 2 pak dostane max 0 pokud zákazník 1 má všechny 4.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, variant, sessionId, quantity } = body as {
      slug: string;
      variant: string;
      sessionId: string;
      quantity: number;
    };

    if (!slug || !sessionId) {
      return NextResponse.json({ error: "Missing slug or sessionId" }, { status: 400 });
    }

    const variantKey = variant ?? "-|-";

    // quantity = 0 → uvolni rezervaci
    if (!quantity || quantity <= 0) {
      await releaseStock(slug, variantKey, sessionId);
      return NextResponse.json({ ok: true, released: true });
    }

    const stockData = await getProductStock(slug);
    const rawStock = stockData[variantKey] ?? 0;

    // Rezervace ostatních (moje vlastní se NEpočítá — chceme vědět kolik zbývá pro mě)
    const reservedByOthers = await getReservedQuantity(slug, variantKey, sessionId);

    // Maximální počet kusů který smím mít JÁ celkem
    const maxAllowed = Math.max(0, rawStock - reservedByOthers);

    // Ořežeme na max
    const clampedQuantity = Math.min(quantity, maxAllowed);

    if (clampedQuantity <= 0) {
      return NextResponse.json({
        ok: false,
        reason: "out_of_stock",
        available: 0,
      }, { status: 409 });
    }

    // Zapíšeme rezervaci — přepíše předchozí hodnotu pro tohoto zákazníka
    await reserveStock(slug, variantKey, sessionId, clampedQuantity);

    return NextResponse.json({
      ok: true,
      reservedQuantity: clampedQuantity,
      wasClamped: clampedQuantity < quantity,
    });
  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json({ error: "Failed to reserve stock" }, { status: 500 });
  }
}