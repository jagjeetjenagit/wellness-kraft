import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getPrisma } from "@/lib/prisma";
import { sendConsultPaidAdminAlert, sendConsultPaymentFailedEmail } from "@/lib/email";

// Step 2 of consultation payment: verify Razorpay's signature
// server-side, then mark the ConsultPayment PAID. The booking widget
// only reveals the calendar after this succeeds. The payment is later
// linked to the actual Booking by the Cal.com webhook (email match).

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Not configured." }, { status: 503 });
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
      const failed = await prisma.consultPayment
        .update({ where: { razorpayOrderId: razorpay_order_id }, data: { status: "FAILED" } })
        .catch(() => null);
      if (failed) {
        sendConsultPaymentFailedEmail({
          customerName: failed.customerName,
          customerEmail: failed.customerEmail,
          expertName: failed.expertName,
          amount: failed.amount,
        }).catch((e) => console.error("consult failed email:", e));
      }
      return NextResponse.json(
        { error: "Payment could not be verified. If money was deducted, it will be refunded automatically." },
        { status: 400 }
      );
    }

    const payment = await prisma.consultPayment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    if (payment.status !== "PAID") {
      await prisma.consultPayment.update({
        where: { id: payment.id },
        data: { status: "PAID", razorpayPaymentId: razorpay_payment_id },
      });
      // Notify admin now; the customer's "pick your slot" prompt is sent
      // by the cron 5 min later, only if they still haven't booked.
      sendConsultPaidAdminAlert({
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        expertName: payment.expertName,
        amount: payment.amount,
      }).catch((e) => console.error("consult paid alert:", e));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("consult-verify failed:", err);
    return NextResponse.json(
      { error: "Could not confirm the payment. Please contact us with your payment reference." },
      { status: 500 }
    );
  }
}
