import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getPrisma } from "@/lib/prisma";
import { generalConsultFee } from "@/lib/config";

// Step 1 of consultation payment: look up the real fee server-side
// (expert's fee from the database, or the general-consultation fee),
// create a Razorpay order and a PENDING ConsultPayment record.
// The browser never decides the amount.

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Online booking payment isn't fully set up yet (database missing). Owner: see README step 3." },
        { status: 503 }
      );
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Online payment isn't switched on yet. Owner: add Razorpay keys — README step 5." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const c: Record<string, string> = body.customer || {};
    for (const field of ["name", "email", "phone"]) {
      if (!c[field]?.trim()) {
        return NextResponse.json({ error: `Please fill in your ${field}.` }, { status: 400 });
      }
    }

    let fee = generalConsultFee();
    let expertName = "General Consultation";
    let expertId: string | null = null;

    if (body.expertId) {
      const expert = await prisma.expert.findFirst({
        where: { OR: [{ id: String(body.expertId) }, { slug: String(body.expertId) }], active: true },
      });
      if (!expert) {
        return NextResponse.json({ error: "This expert is no longer available." }, { status: 404 });
      }
      fee = expert.fee;
      expertName = expert.name;
      expertId = expert.id;
    }

    if (fee <= 0) {
      return NextResponse.json(
        { error: "This consultation doesn't require online payment." },
        { status: 400 }
      );
    }

    const rzpOrder = await razorpay.orders.create({
      amount: fee * 100, // paise
      currency: "INR",
      notes: { type: "consultation", expert: expertName, customer: c.name },
    });

    await prisma.consultPayment.create({
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: fee,
        expertId,
        expertName,
        customerName: c.name.trim(),
        customerEmail: c.email.trim(),
        customerPhone: c.phone.trim(),
      },
    });

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: fee * 100,
      currency: "INR",
      razorpayOrderId: rzpOrder.id,
    });
  } catch (err) {
    console.error("consult-order failed:", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again in a moment." },
      { status: 500 }
    );
  }
}
