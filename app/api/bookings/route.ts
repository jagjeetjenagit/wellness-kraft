import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "desc" },
    take: 200,
  });
  return NextResponse.json(bookings);
}
