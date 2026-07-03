// app/api/stock/route.ts
// Read-only endpoint — vrací aktuální sklad ze Sheets pro daný produkt.
// Žádný Redis, žádné rezervace.
import { NextResponse } from "next/server";
import { getProductStock } from "@/lib/stock";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const stockData = await getProductStock(slug);
    return NextResponse.json({ stockData });
  } catch (error) {
    console.error("Stock fetch error:", error);
    return NextResponse.json({ stockData: {} });
  }
}