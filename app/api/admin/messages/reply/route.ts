// app/api/admin/messages/reply/route.ts
// POST { id, replyText } — pošle zákazníkovi odpověď emailem na zprávu
// z chat widgetu a zprávu zároveň označí jako přečtenou.
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getMessageById, markMessageRead } from "@/lib/messages";
import { sendMessageReplyEmail } from "@/lib/email";

const MAX_REPLY_LENGTH = 2000;

async function requireAccess() {
  const session = await getCurrentSession();
  if (!session) return false;
  return session.isMain || session.permissions.includes("messages");
}

export async function POST(req: Request) {
  const allowed = await requireAccess();
  if (!allowed) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  const replyText = body?.replyText;

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Chybí id zprávy." }, { status: 400 });
  }
  if (typeof replyText !== "string" || !replyText.trim() || replyText.length > MAX_REPLY_LENGTH) {
    return NextResponse.json({ error: "Neplatný text odpovědi." }, { status: 400 });
  }

  try {
    const message = await getMessageById(id);
    if (!message) {
      return NextResponse.json({ error: "Zpráva nenalezena." }, { status: 404 });
    }

    const sent = await sendMessageReplyEmail({
      to: message.email,
      name: message.name,
      originalText: message.text,
      replyText: replyText.trim(),
    });
    if (!sent) {
      return NextResponse.json({ error: "Odeslání e-mailu se nezdařilo." }, { status: 500 });
    }

    await markMessageRead(id, true);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin messages reply POST error:", error);
    return NextResponse.json({ error: "Odeslání se nezdařilo." }, { status: 500 });
  }
}
