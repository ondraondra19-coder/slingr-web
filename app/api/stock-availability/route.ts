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
// Vrátí skutečně dostupné množství pro danou variantu produktu:
// sklad − rezervace ostatních uživatelů (moje vlastní rezervace se NEODEČÍTÁ,
// protože ta je už "moje" — viz getReservedQuantity(..., excludeSessionId)).
//
// Query: ?slug=pouzdro-apple-pencil&variant=black|pro&sessionId=abc-123
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

    const available = Math.max(0, rawStock - reservedByOthers);

    return NextResponse.json({
      rawStock,
      reservedByOthers,
      myReservation,
      available, // kolik si JEŠTĚ může kdokoliv přidat (včetně mě, nad rámec toho co už mám)
    });
  } catch (error) {
    console.error("Stock availability error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────
// Vytvoří/aktualizuje nebo zruší rezervaci.
// Body: { slug, variant, sessionId, quantity }
// quantity = 0 znamená "zruš rezervaci" (odebráno z košíku)
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

    if (!quantity || quantity <= 0) {
      await releaseStock(slug, variantKey, sessionId);
      return NextResponse.json({ ok: true, released: true });
    }

    // Ověříme proti aktuálnímu skladu, ať si nikdo nerezervuje víc než reálně existuje
    const stockData = await getProductStock(slug);
    const rawStock = stockData[variantKey] ?? 0;
    const reservedByOthers = await getReservedQuantity(slug, variantKey, sessionId);
    const maxAllowed = Math.max(0, rawStock - reservedByOthers);

    const clampedQuantity = Math.min(quantity, maxAllowed);

    if (clampedQuantity <= 0) {
      return NextResponse.json({ ok: false, reason: "out_of_stock", available: 0 }, { status: 409 });
    }

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