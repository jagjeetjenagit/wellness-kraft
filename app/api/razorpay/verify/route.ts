import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getPrisma } from "@/lib/prisma";
import { sendOrderEmails, sendOrderFailedEmail } from "@/lib/email";

// Step 2 of payment: Razorpay sends back a signature after the
// customer pays. We verify it server-side with the secret key.
// Only then: mark the order PAID, reduce stock, send emails.

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Store not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const valid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    if (!valid) {
      const failed = await prisma.order
        .update({
          where: { razorpayOrderId: razorpay_order_id },
          data: { paymentStatus: "FAILED" },
        })
        .catch(() => null);
      if (failed) {
        sendOrderFailedEmail({
          orderId: failed.id.slice(-8).toUpperCase(),
          customerName: failed.shipName,
          customerEmail: failed.shipEmail,
          total: failed.total,
        }).catch((e) => console.error("order failed email:", e));
      }
      return NextResponse.json(
        { error: "Payment could not be verified. If money was deducted, it will be refunded automatically." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Already verified before (e.g. double click) — just confirm.
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Mark paid + reduce stock atomically
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", razorpayPaymentId: razorpay_payment_id },
      }),
      ...order.items
        .filter((i) => i.productId)
        .map((i) =>
          prisma.product.update({
            where: { id: i.productId! },
            data: { stock: { decrement: i.quantity } },
          })
        ),
    ]);

    // Confirmation emails (never block the customer on email issues)
    sendOrderEmails({
      orderId: order.id.slice(-8).toUpperCase(),
      customerName: order.shipName,
      customerEmail: order.shipEmail,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: order.total,
      address: `${order.shipAddress1}${order.shipAddress2 ? ", " + order.shipAddress2 : ""}, ${order.shipCity}, ${order.shipState} — ${order.shipPincode}`,
    }).catch((e) => console.error("order email failed:", e));

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("verify failed:", err);
    return NextResponse.json(
      { error: "Could not confirm the payment. Please contact us with your payment reference." },
      { status: 500 }
    );
  }
}
