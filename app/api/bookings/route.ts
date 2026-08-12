import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

// Bookings for the admin. Returns both:
//  - bookings: scheduled slots recorded from the Cal.com webhook
//  - paidConsults: consultations the customer has PAID for but that aren't
//    yet linked to a scheduled slot (so a paid consult is visible here even
//    before/without the Cal webhook firing).
export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;

  // Never blank the whole admin view because one query failed (e.g. a
  // schema column not yet pushed to the DB). Each list degrades on its own.
  const [bookings, paidConsults] = await Promise.all([
    prisma.booking
      .findMany({ orderBy: { startTime: "desc" }, take: 200 })
      .catch((e) => {
        console.error("admin bookings query failed:", e);
        return [];
      }),
    prisma.consultPayment
      .findMany({
        where: { status: "PAID", bookingId: null },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .catch((e) => {
        console.error("admin paidConsults query failed:", e);
        return [];
      }),
  ]);

  return NextResponse.json({ bookings, paidConsults });
}
