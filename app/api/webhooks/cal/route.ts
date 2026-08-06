import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getPrisma } from "@/lib/prisma";
import { sendBookingEmails } from "@/lib/email";

// Cal.com calls this URL whenever a booking is made or cancelled,
// so booking history appears in the site's dashboard and admin area.
// Setup (optional but recommended) is in the README "Cal.com" section.

function verifyCalSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  // No secret configured -> accept (feature works out of the box;
  // add a secret for extra security when you're ready).
  if (!secret) return true;
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cal-signature-256");
    if (!verifyCalSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ ok: true, note: "No database yet" });

    const event = JSON.parse(rawBody);
    const type: string = event.triggerEvent || "";
    const p = event.payload || {};
    const attendee = (p.attendees && p.attendees[0]) || {};
    const uid: string = p.uid || p.bookingId?.toString() || "";
    if (!uid) return NextResponse.json({ ok: true, note: "No booking uid" });

    if (type === "BOOKING_CANCELLED") {
      await prisma.booking
        .update({ where: { calUid: uid }, data: { status: "CANCELLED" } })
        .catch(() => null);
      return NextResponse.json({ ok: true });
    }

    if (type === "BOOKING_CREATED" || type === "BOOKING_RESCHEDULED") {
      const organizerEmail: string = p.organizer?.email || "";
      const organizerName: string = p.organizer?.name || "";

      // Try to match the expert by name (organizer of the Cal event)
      const expert = organizerName
        ? await prisma.expert
            .findFirst({ where: { name: { contains: organizerName, mode: "insensitive" } } })
            .catch(() => null)
        : null;

      // Link to a site account if the attendee email matches one
      const user = attendee.email
        ? await prisma.user
            .findFirst({ where: { email: { equals: attendee.email, mode: "insensitive" } } })
            .catch(() => null)
        : null;

      const booking = await prisma.booking.upsert({
        where: { calUid: uid },
        update: {
          startTime: new Date(p.startTime),
          endTime: p.endTime ? new Date(p.endTime) : null,
          status: "CONFIRMED",
        },
        create: {
          calUid: uid,
          title: p.title || p.eventTitle || "Consultation",
          startTime: new Date(p.startTime),
          endTime: p.endTime ? new Date(p.endTime) : null,
          status: "CONFIRMED",
          expertId: expert?.id || null,
          expertName: expert?.name || organizerName || organizerEmail,
          userId: user?.id || null,
          attendeeName: attendee.name || "",
          attendeeEmail: attendee.email || "",
          attendeePhone: attendee.phoneNumber || "",
        },
      });

      // Link the online consultation payment (made before slot selection)
      // to this booking, matched on the attendee's email within 48 hours.
      if (booking.amountPaid === 0 && attendee.email) {
        const payment = await prisma.consultPayment
          .findFirst({
            where: {
              status: "PAID",
              bookingId: null,
              customerEmail: { equals: attendee.email, mode: "insensitive" },
              createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
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
            .catch((e) => console.error("payment link failed:", e));
        }
      }

      if (type === "BOOKING_CREATED") {
        sendBookingEmails({
          attendeeName: attendee.name || "",
          attendeeEmail: attendee.email || "",
          expertName: expert?.name || organizerName,
          expertEmail: expert?.email || "",
          title: p.title || "Consultation",
          startTime: p.startTime,
        }).catch((e) => console.error("booking email failed:", e));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("cal webhook failed:", err);
    // Always answer 200-ish so Cal doesn't retry forever on odd payloads
    return NextResponse.json({ ok: false });
  }
}
