import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

// Admin: update a booking — attach the prescription/advice text that
// the customer sees in their dashboard, or change the status.
// Compliance note (FSSAI): prescription text must contain guidance and
// supplement advice only — no disease-cure claims.

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        prescription: b.prescription !== undefined ? String(b.prescription) : undefined,
        status: b.status !== undefined ? String(b.status) : undefined,
      },
    });
    return NextResponse.json(booking);
  } catch (err) {
    console.error("update booking failed:", err);
    return NextResponse.json({ error: "Could not update the booking." }, { status: 500 });
  }
}
