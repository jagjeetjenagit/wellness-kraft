import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSafeUser } from "@/lib/auth";
import { generalConsultFee } from "@/lib/config";
import { isValidSlot, meetUrlFor, configFromExpert, DEFAULT_SLOT_CONFIG } from "@/lib/slots";
import { sendBookingEmails } from "@/lib/email";

// Books a consultation slot natively (no external calendar). Validates the
// slot, prevents double-booking, links the paid consultation, and returns a
// private video link. Requires sign-in; requires payment for paid experts.
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Booking isn't set up yet (no database)." }, { status: 503 });
  }

  const user = await getSafeUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Please sign in to book." }, { status: 401 });
  }
  const email = user.email;

  const body = await req.json().catch(() => ({}));
  const expertId: string | null = body?.expertId ? String(body.expertId) : null;
  const start = body?.startTime ? new Date(body.startTime) : null;

  // Resolve fee + expert name + availability from the source of truth.
  let fee = generalConsultFee();
  let expertName = "General Consultation";
  let expertEmail = "";
  let cfg = DEFAULT_SLOT_CONFIG;
  if (expertId) {
    const expert = await prisma.expert.findFirst({ where: { id: expertId, active: true } });
    if (!expert) return NextResponse.json({ error: "This expert is no longer available." }, { status: 404 });
    fee = expert.fee;
    expertName = expert.name;
    expertEmail = expert.email;
    cfg = configFromExpert(expert);
  }

  if (!start || !isValidSlot(start, cfg)) {
    return NextResponse.json({ error: "That time isn't available. Please pick another." }, { status: 400 });
  }

  // Paid experts require a completed, unscheduled payment for this person.
  let payment = null as Awaited<ReturnType<typeof prisma.consultPayment.findFirst>> | null;
  if (fee > 0) {
    payment = await prisma.consultPayment
      .findFirst({
        where: {
          status: "PAID",
          bookingId: null,
          customerEmail: { equals: email, mode: "insensitive" },
          expertId: expertId ?? null,
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => null);
    if (!payment) {
      return NextResponse.json({ error: "Please pay for the consultation first." }, { status: 402 });
    }
  }

  // Slot must still be free.
  const clash = await prisma.booking.findFirst({
    where: { expertId: expertId ?? null, status: "CONFIRMED", startTime: start },
  });
  if (clash) {
    return NextResponse.json(
      { error: "Sorry, that slot was just taken. Please pick another." },
      { status: 409 }
    );
  }

  const dbUser = await prisma.user
    .findUnique({ where: { clerkId: user.id }, select: { id: true, phone: true } })
    .catch(() => null);

  try {
    const booking = await prisma.booking.create({
      data: {
        title: `Consultation — ${expertName}`,
        startTime: start,
        status: "CONFIRMED",
        expertId: expertId ?? null,
        expertName,
        userId: dbUser?.id || null,
        attendeeName: user.name,
        attendeeEmail: email,
        attendeePhone: payment?.customerPhone || dbUser?.phone || "",
        amountPaid: payment?.amount || 0,
        razorpayPaymentId: payment?.razorpayPaymentId || "",
      },
    });

    if (payment) {
      await prisma.consultPayment
        .update({ where: { id: payment.id }, data: { bookingId: booking.id } })
        .catch(() => null);
    }

    // Confirmation emails: customer + admin + the consultant. Never block
    // the booking on an email problem.
    sendBookingEmails({
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      expertName,
      expertEmail,
      title: booking.title,
      startTime: booking.startTime,
      meetUrl: meetUrlFor(booking.id),
      amountPaid: booking.amountPaid,
    }).catch((e) => console.error("booking email failed:", e));

    return NextResponse.json({ ok: true, meetUrl: meetUrlFor(booking.id), startTime: booking.startTime });
  } catch (err) {
    console.error("native booking failed:", err);
    return NextResponse.json({ error: "Could not book that slot. Please try again." }, { status: 500 });
  }
}
