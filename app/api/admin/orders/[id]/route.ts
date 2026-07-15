// app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getOrder, updateOrderStatus, updatePaymentStatus, type OrderStatus, type PaymentStatus } from "@/lib/orders";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

const VALID_STATUSES: OrderStatus[] = ["nova", "zabalena", "odeslana", "na_ceste", "dorucena"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["zaplaceno", "ceka_na_platbu", "zaplatit_pri_prevzeti"];

// PATCH /api/admin/orders/:id  { status?: OrderStatus, paymentStatus?: PaymentStatus }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }
  if (!session.isMain && !session.permissions.includes("reservations")) {
    return NextResponse.json({ error: "Nemáte oprávnění k této akci." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Neplatný stav objednávky." }, { status: 400 });
      }

      // Zjistíme předchozí stav PŘED přepisem — e-mail o odeslání/doručení
      // chceme poslat jen při skutečném přechodu do stavu, ne při každém uložení.
      const previous = await getOrder(id);

      const updated = await updateOrderStatus(id, body.status);
      if (!updated) return NextResponse.json({ error: "Objednávka nenalezena." }, { status: 404 });

      if (previous && previous.status !== updated.status) {
        if (updated.status === "odeslana") await sendOrderShippedEmail(updated);
        if (updated.status === "dorucena") await sendOrderDeliveredEmail(updated);
      }

      return NextResponse.json({ order: updated });
    }

    if (body.paymentStatus) {
      if (!VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
        return NextResponse.json({ error: "Neplatný stav platby." }, { status: 400 });
      }
      const updated = await updatePaymentStatus(id, body.paymentStatus);
      if (!updated) return NextResponse.json({ error: "Objednávka nenalezena." }, { status: 404 });
      return NextResponse.json({ order: updated });
    }

    return NextResponse.json({ error: "Nic k aktualizaci." }, { status: 400 });
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit změnu." }, { status: 500 });
  }
}