// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password;

    if (typeof password !== "string" || !checkPassword(password)) {
      // Drobné zpomalení, aby brute-force pokusy byly méně praktické
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ error: "Nesprávné heslo." }, { status: 401 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    });
    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}