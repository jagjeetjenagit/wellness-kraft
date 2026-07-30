import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getExpertForUser } from "@/lib/auth";

// An expert saves the prescription/advice (and optionally recommended
// products) for one of THEIR OWN bookings. The expert is resolved from the
// signed-in Google email, and the booking is checked to belong to them.
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "No database connected." }, { status: 503 });

  const expert = await getExpertForUser();
  if (!expert) return NextResponse.json({ error: "For experts only." }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const bookingId = String(b?.bookingId || "");
  if (!bookingId) return NextResponse.json({ error: "Missing booking." }, { status: 400 });

  const booking = await prisma.booking
    .findFirst({ where: { id: bookingId, expertId: expert.id } })
    .catch(() => null);
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        prescription: String(b?.prescription || ""),
        ...(Array.isArray(b?.productIds)
          ? { prescribedProductIds: b.productIds.map((x: unknown) => String(x)) }
          : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
