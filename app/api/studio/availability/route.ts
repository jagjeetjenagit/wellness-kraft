import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getExpertForUser } from "@/lib/auth";

// An expert sets their own bookable days/hours. Used by the native slot engine.
export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "No database connected." }, { status: 503 });

  const expert = await getExpertForUser();
  if (!expert) return NextResponse.json({ error: "For experts only." }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const days = Array.isArray(b?.days)
    ? Array.from(new Set(b.days.map((x: unknown) => Number(x)).filter((n: number) => n >= 0 && n <= 6)))
        .sort((x, y) => (x as number) - (y as number))
    : [];
  if (!days.length) {
    return NextResponse.json({ error: "Pick at least one available day." }, { status: 400 });
  }

  let startHour = Math.max(0, Math.min(23, Math.round(Number(b?.startHour))));
  let endHour = Math.max(1, Math.min(24, Math.round(Number(b?.endHour))));
  if (!Number.isFinite(startHour)) startHour = 10;
  if (!Number.isFinite(endHour) || endHour <= startHour) endHour = startHour + 1;
  const slotMins = [15, 30, 45, 60].includes(Number(b?.slotMins)) ? Number(b.slotMins) : 30;

  try {
    await prisma.expert.update({
      where: { id: expert.id },
      data: { availDays: (days as number[]).join(","), startHour, endHour, slotMins },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
