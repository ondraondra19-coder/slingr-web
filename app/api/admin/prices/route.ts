// app/api/admin/prices/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { setPriceOverridesBulk } from "@/lib/priceOverrides";
import type { PriceValue } from "@/lib/products";

type PriceEntry = { slug: string; modelId?: string; price: PriceValue };

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }
  if (!session.isMain && !session.permissions.includes("products")) {
    return NextResponse.json({ error: "Nemáte oprávnění k této akci." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const entries: PriceEntry[] = body.entries;
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Chybí data k uložení." }, { status: 400 });
    }

    for (const entry of entries) {
      if (!entry.slug || typeof entry.price !== "object" && typeof entry.price !== "number") {
        return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
      }
      if (typeof entry.price === "object" && (!entry.price.CZK || entry.price.CZK <= 0)) {
        return NextResponse.json({ error: "Cena v CZK musí být kladné číslo." }, { status: 400 });
      }
    }

    await setPriceOverridesBulk(entries);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin prices POST error:", error);
    return NextResponse.json({ error: "Uložení se nezdařilo." }, { status: 500 });
  }
}