import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { sendOrderStatusEmail } from "@/lib/email";

const ALLOWED = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const NOTIFY = ["SHIPPED", "DELIVERED", "CANCELLED"] as const;

// Admin: update an order's fulfillment status (mark shipped, etc.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    if (!ALLOWED.includes(b.fulfillmentStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { fulfillmentStatus: b.fulfillmentStatus },
    });
    // Tell the customer when the order ships, is delivered, or is cancelled.
    if ((NOTIFY as readonly string[]).includes(b.fulfillmentStatus)) {
      sendOrderStatusEmail({
        orderId: order.id.slice(-8).toUpperCase(),
        customerName: order.shipName,
        customerEmail: order.shipEmail,
        status: b.fulfillmentStatus as (typeof NOTIFY)[number],
        address: `${order.shipAddress1}${order.shipAddress2 ? ", " + order.shipAddress2 : ""}, ${order.shipCity}, ${order.shipState} — ${order.shipPincode}`,
      }).catch((e) => console.error("order status email:", e));
    }
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
