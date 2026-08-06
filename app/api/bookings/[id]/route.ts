import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { sendBookingCancelledEmail, sendPrescriptionReadyEmail } from "@/lib/email";

// Admin: update a booking — attach the prescription/advice text that
// the customer sees in their dashboard, or change the status.
// Compliance note (FSSAI): prescription text must contain guidance and
// supplement advice only — no disease-cure claims.

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    const prev = await prisma.booking.findUnique({ where: { id: params.id } });
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        prescription: b.prescription !== undefined ? String(b.prescription) : undefined,
        status: b.status !== undefined ? String(b.status) : undefined,
      },
    });

    // The consultant's own inbox, if this booking is tied to an expert.
    const expertEmail = booking.expertId
      ? (await prisma.expert
          .findUnique({ where: { id: booking.expertId }, select: { email: true } })
          .catch(() => null))?.email || ""
      : "";

    // Notify on a real transition into CANCELLED (customer + admin + consultant).
    if (booking.status === "CANCELLED" && prev?.status !== "CANCELLED") {
      sendBookingCancelledEmail({
        attendeeName: booking.attendeeName,
        attendeeEmail: booking.attendeeEmail,
        expertName: booking.expertName,
        expertEmail,
        title: booking.title,
        startTime: booking.startTime,
      }).catch((e) => console.error("booking cancel email:", e));
    }

    // Notify the customer when advice/prescription is first added or changed.
    const prescriptionChanged =
      b.prescription !== undefined &&
      String(b.prescription).trim() &&
      String(b.prescription) !== (prev?.prescription || "");
    if (prescriptionChanged) {
      sendPrescriptionReadyEmail({
        attendeeName: booking.attendeeName,
        attendeeEmail: booking.attendeeEmail,
        expertName: booking.expertName,
      }).catch((e) => console.error("prescription email:", e));
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error("update booking failed:", err);
    return NextResponse.json({ error: "Could not update the booking." }, { status: 500 });
  }
}
