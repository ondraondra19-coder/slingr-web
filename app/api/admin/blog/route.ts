// app/api/admin/blog/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAllPosts, savePost, slugify, type BlogPost } from "@/lib/blog";

async function checkAccess() {
  const session = await getCurrentSession();
  if (!session) return { ok: false as const, status: 401, error: "Neautorizováno." };
  // Interně stále permission "settings" (aby se nerozbily existující účty),
  // v UI se ale teď jmenuje "Magazín".
  if (!session.isMain && !session.permissions.includes("settings")) {
    return { ok: false as const, status: 403, error: "Nemáte oprávnění k této akci." };
  }
  return { ok: true as const };
}

export async function GET() {
  const access = await checkAccess();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Admin blog GET error:", error);
    return NextResponse.json({ error: "Nepodařilo se načíst články." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const access = await checkAccess();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  try {
    const body = await req.json();
    const title: string = (body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Chybí název článku." }, { status: 400 });

    const slug: string = body.slug?.trim() ? slugify(body.slug) : slugify(title);
    if (!slug) return NextResponse.json({ error: "Nepodařilo se vytvořit slug z názvu." }, { status: 400 });

    const existing = await getAllPosts();
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "Článek s tímto slugem už existuje." }, { status: 409 });
    }

    const post: Omit<BlogPost, "createdAt"> = {
      slug,
      title,
      excerpt: (body.excerpt ?? "").trim(),
      content: body.content ?? "",
      date: (body.date ?? "").trim(),
      tag: (body.tag ?? "").trim(),
      img: (body.img ?? "").trim(),
    };

    const saved = await savePost(post);
    return NextResponse.json({ post: saved });
  } catch (error) {
    console.error("Admin blog POST error:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit článek." }, { status: 500 });
  }
}