import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Records a consultation booking the moment the customer picks a slot in the
// Cal.com popup (the browser sends it here). This removes the dependency on
// the Cal webhook, so bookings show up in the dashboard/admin immediately.
// Safe to run alongside the webhook: both upsert on calUid, so no duplicates.
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: false }, { status: 503 });

  const b = await req.json().catch(() => ({}));
  const uid = String(b?.uid || "").trim();
  const email = String(b?.email || "").trim();
  const name = String(b?.name || "").trim();
  const phone = String(b?.phone || "").trim();
  const expertId = b?.expertId ? String(b.expertId) : null;
  const expertName = String(b?.expertName || "Consultation").trim();
  const title = String(b?.title || "Consultation").trim();

  const start = b?.startTime ? new Date(b.startTime) : null;
  if (!start || isNaN(start.getTime())) {
    return NextResponse.json({ ok: false, error: "No valid start time." }, { status: 400 });
  }

  // Link to a site account if the email matches one.
  const user = email
    ? await prisma.user
        .findFirst({ where: { email: { equals: email, mode: "insensitive" } } })
        .catch(() => null)
    : null;

  try {
    const booking = uid
      ? await prisma.booking.upsert({
          where: { calUid: uid },
          update: { startTime: start, status: "CONFIRMED" },
          create: {
            calUid: uid,
            title,
            startTime: start,
            status: "CONFIRMED",
            expertId,
            expertName,
            userId: user?.id || null,
            attendeeName: name,
            attendeeEmail: email,
            attendeePhone: phone,
          },
        })
      : await prisma.booking.create({
          data: {
            title,
            startTime: start,
            status: "CONFIRMED",
            expertId,
            expertName,
            userId: user?.id || null,
            attendeeName: name,
            attendeeEmail: email,
            attendeePhone: phone,
          },
        });

    // Link the most recent unlinked paid consultation for this email.
    if (email && booking.amountPaid === 0) {
      const payment = await prisma.consultPayment
        .findFirst({
          where: {
            status: "PAID",
            bookingId: null,
            customerEmail: { equals: email, mode: "insensitive" },
          },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => null);
      if (payment) {
        await prisma
          .$transaction([
            prisma.booking.update({
              where: { id: booking.id },
              data: { amountPaid: payment.amount, razorpayPaymentId: payment.razorpayPaymentId },
            }),
            prisma.consultPayment.update({
              where: { id: payment.id },
              data: { bookingId: booking.id },
            }),
          ])
          .catch(() => null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("record booking failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
