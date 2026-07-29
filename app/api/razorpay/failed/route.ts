import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Marks a payment attempt as FAILED when Razorpay reports the gateway
// payment failed (e.g. card declined). Called from the checkout / booking
// widgets on the "payment.failed" event. Only flips PENDING → FAILED, so a
// verified PAID order can never be downgraded by a stray/late call.
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.razorpay_order_id || "").trim();
  if (!id) return NextResponse.json({ error: "Missing order id." }, { status: 400 });

  // The id could belong to a product Order or a ConsultPayment — try both.
  await prisma.order
    .updateMany({ where: { razorpayOrderId: id, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED" } })
    .catch(() => null);
  await prisma.consultPayment
    .updateMany({ where: { razorpayOrderId: id, status: "PENDING" }, data: { status: "FAILED" } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
