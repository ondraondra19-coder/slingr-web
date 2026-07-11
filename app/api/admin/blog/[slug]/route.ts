// app/api/admin/blog/[slug]/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getPostBySlug, savePost, deletePost, type BlogPost } from "@/lib/blog";

async function checkAccess() {
  const session = await getCurrentSession();
  if (!session) return { ok: false as const, status: 401, error: "Neautorizováno." };
  if (!session.isMain && !session.permissions.includes("settings")) {
    return { ok: false as const, status: 403, error: "Nemáte oprávnění k této akci." };
  }
  return { ok: true as const };
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const access = await checkAccess();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { slug } = await params;
  const existing = await getPostBySlug(slug);
  if (!existing) return NextResponse.json({ error: "Článek nenalezen." }, { status: 404 });

  try {
    const body = await req.json();
    const title: string = (body.title ?? existing.title).trim();
    if (!title) return NextResponse.json({ error: "Chybí název článku." }, { status: 400 });

    const post: Omit<BlogPost, "createdAt"> = {
      slug, // slug se po založení neměnní (jinak by se rozbily staré odkazy)
      title,
      excerpt: (body.excerpt ?? existing.excerpt).trim(),
      content: body.content ?? existing.content,
      date: (body.date ?? existing.date).trim(),
      tag: (body.tag ?? existing.tag).trim(),
      img: (body.img ?? existing.img).trim(),
    };

    // Datum se mohlo změnit — přepočítáme i createdAt, ať řazení sedí.
    const saved = await savePost(post);
    return NextResponse.json({ post: saved });
  } catch (error) {
    console.error("Admin blog PUT error:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit změny." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const access = await checkAccess();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const { slug } = await params;
  try {
    await deletePost(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin blog DELETE error:", error);
    return NextResponse.json({ error: "Nepodařilo se smazat článek." }, { status: 500 });
  }
}