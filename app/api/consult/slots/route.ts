import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { generateSlotStarts, buildSlotGroups } from "@/lib/slots";

export const dynamic = "force-dynamic";

// Available time slots for an expert (or the general consult when no
// expertId). Slots already booked are flagged `taken` so the UI greys them.
export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ groups: [] });

  const expertId = req.nextUrl.searchParams.get("expertId") || null;

  const booked = await prisma.booking
    .findMany({
      where: { expertId: expertId ?? null, status: "CONFIRMED", startTime: { gte: new Date() } },
      select: { startTime: true },
    })
    .catch(() => [] as { startTime: Date }[]);

  const bookedMs = new Set(booked.map((b) => b.startTime.getTime()));
  const groups = buildSlotGroups(generateSlotStarts(), bookedMs);
  return NextResponse.json({ groups });
}
