// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { getAllReviews, addReview, checkAndSetCooldown } from "@/lib/reviews";

const MAX_TEXT_LENGTH = 600;
const MAX_NAME_LENGTH = 80;

// GET /api/reviews — vrátí všechny recenze (veřejné, pro všechny návštěvníky)
export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [], error: "Nepodařilo se načíst recenze." }, { status: 500 });
  }
}

// POST /api/reviews — vytvoří novou recenzi
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rating, text, captchaToken } = body ?? {};

    // ── Validace vstupu ────────────────────────────────────────────────────
    if (typeof name !== "string" || !name.trim() || name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "Neplatné jméno." }, { status: 400 });
    }
    if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: "Neplatný text recenze." }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Neplatné hodnocení." }, { status: 400 });
    }
    if (typeof captchaToken !== "string" || !captchaToken) {
      return NextResponse.json({ error: "Chybí ověření captcha." }, { status: 400 });
    }

    // ── Server-side ověření hCaptcha ───────────────────────────────────────
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) {
      console.error("❌ CHYBÍ HCAPTCHA_SECRET v env proměnných.");
      return NextResponse.json({ error: "Captcha nelze ověřit (chybí konfigurace serveru)." }, { status: 500 });
    }

    const verifyRes = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: captchaToken }),
    });
    const verifyJson = await verifyRes.json();
    if (!verifyJson.success) {
      return NextResponse.json({ error: "Ověření captcha se nezdařilo." }, { status: 400 });
    }

    // ── Anti-spam: 1 recenze / IP / 24h ────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, ttlSeconds } = await checkAndSetCooldown(ip);
    if (!allowed) {
      const hours = Math.floor(ttlSeconds / 3600);
      const minutes = Math.floor((ttlSeconds % 3600) / 60);
      return NextResponse.json(
        { error: `Další recenzi můžete napsat za ${hours}h ${minutes}min.` },
        { status: 429 }
      );
    }

    // ── Uložení ─────────────────────────────────────────────────────────────
    const review = await addReview({ name, rating: ratingNum, text });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit recenzi." }, { status: 500 });
  }
}