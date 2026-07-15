import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

const ALLOWED = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

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
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
