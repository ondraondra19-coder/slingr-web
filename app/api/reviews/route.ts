// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllReviews, addReview, deleteReview, checkAndSetCooldown, toPublicReview } from "@/lib/reviews";

const MAX_TEXT_LENGTH = 600;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 150;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cookie identifikující konkrétní prohlížeč/zařízení — cooldown se váže na tohle,
// ne na IP adresu, aby lidi na stejné Wi-Fi nesdíleli limit.
const DEVICE_COOKIE_NAME = "review_device_id";
const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 rok

// GET /api/reviews — vrátí všechny recenze (veřejné, jen bezpečná pole)
export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews: reviews.map(toPublicReview) });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [], error: "Nepodařilo se načíst recenze." }, { status: 500 });
  }
}

// DELETE /api/reviews?id=... — smaže recenzi (jen pro admin, budoucí interní stránka)
export async function DELETE(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("❌ CHYBÍ ADMIN_SECRET v env proměnných.");
    return NextResponse.json({ error: "Mazání není nakonfigurováno." }, { status: 500 });
  }

  const providedSecret = req.headers.get("x-admin-secret");
  if (providedSecret !== adminSecret) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Chybí id recenze." }, { status: 400 });
  }

  try {
    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: "Recenze s tímto id nenalezena." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reviews DELETE error:", error);
    return NextResponse.json({ error: "Nepodařilo se smazat recenzi." }, { status: 500 });
  }
}

// POST /api/reviews — vytvoří novou recenzi
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rating, text, email, captchaToken } = body ?? {};

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
    // Email je nepovinný, ale pokud je vyplněný, musí vypadat jako email
    let emailValue: string | undefined;
    if (typeof email === "string" && email.trim()) {
      const trimmed = email.trim();
      if (trimmed.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(trimmed)) {
        return NextResponse.json({ error: "Neplatný email." }, { status: 400 });
      }
      emailValue = trimmed;
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

    // ── Identifikace zařízení (cookie, ne IP) ──────────────────────────────
    const cookieStore = await cookies();
    let deviceId = cookieStore.get(DEVICE_COOKIE_NAME)?.value;
    if (!deviceId) {
      deviceId = crypto.randomUUID();
    }
    cookieStore.set(DEVICE_COOKIE_NAME, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
    });

    // ── Anti-spam: 1 recenze / zařízení / 24h ──────────────────────────────
    const { allowed, ttlSeconds } = await checkAndSetCooldown(deviceId);
    if (!allowed) {
      const hours = Math.floor(ttlSeconds / 3600);
      const minutes = Math.floor((ttlSeconds % 3600) / 60);
      return NextResponse.json(
        { error: `Další recenzi můžete napsat za ${hours}h ${minutes}min.` },
        { status: 429 }
      );
    }

    // ── Metadata pro admin (IP jen jako informace, ne pro cooldown) ────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const country = req.headers.get("x-vercel-ip-country") ?? undefined;
    const region = req.headers.get("x-vercel-ip-country-region") ?? undefined;
    const city = req.headers.get("x-vercel-ip-city") ?? undefined;

    // ── Uložení ─────────────────────────────────────────────────────────────
    const review = await addReview({
      name,
      rating: ratingNum,
      text,
      email: emailValue,
      ip: ip !== "unknown" ? ip : undefined,
      userAgent,
      country,
      region,
      city,
    });
    return NextResponse.json({ review: toPublicReview(review) });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit recenzi." }, { status: 500 });
  }
}