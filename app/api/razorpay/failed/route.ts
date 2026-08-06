import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendOrderFailedEmail, sendConsultPaymentFailedEmail } from "@/lib/email";

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
  // Only email when we actually flip a PENDING record to FAILED (never
  // downgrade a PAID one, and never notify twice on repeat calls).
  const order = await prisma.order
    .findUnique({ where: { razorpayOrderId: id } })
    .catch(() => null);
  if (order && order.paymentStatus === "PENDING") {
    await prisma.order
      .update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } })
      .catch(() => null);
    sendOrderFailedEmail({
      orderId: order.id.slice(-8).toUpperCase(),
      customerName: order.shipName,
      customerEmail: order.shipEmail,
      total: order.total,
    }).catch((e) => console.error("order failed email:", e));
  }

  const consult = await prisma.consultPayment
    .findUnique({ where: { razorpayOrderId: id } })
    .catch(() => null);
  if (consult && consult.status === "PENDING") {
    await prisma.consultPayment
      .update({ where: { id: consult.id }, data: { status: "FAILED" } })
      .catch(() => null);
    sendConsultPaymentFailedEmail({
      customerName: consult.customerName,
      customerEmail: consult.customerEmail,
      expertName: consult.expertName,
      amount: consult.amount,
    }).catch((e) => console.error("consult failed email:", e));
  }

  return NextResponse.json({ ok: true });
}
