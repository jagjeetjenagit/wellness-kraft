import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { meetUrlFor } from "@/lib/slots";
import { sendPickSlotNudge, sendReminderEmails } from "@/lib/email";

// Scheduled worker — hit this every few minutes (Vercel Cron or an external
// pinger). It sends the time-based emails that can't fire inline:
//   • "pick your slot"  → 5 min after a paid consult still has no booking
//   • 30-min reminder   → no link
//   • 10-min reminder   → releases the video join link (customer + consultant)
// Every send is guarded by a per-record flag so a reminder is never repeated,
// which also makes the schedule safe to run at any cadence.

export const dynamic = "force-dynamic";

// Accept the secret via `Authorization: Bearer <CRON_SECRET>` (Vercel Cron)
// or `?secret=<CRON_SECRET>` (simple external pingers). If no secret is set
// in the environment, the endpoint is open (fine for local/dev).
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization") || "";
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: true, note: "No database" });

  const now = new Date();
  const in10 = new Date(now.getTime() + 10 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);
  const paidBefore = new Date(now.getTime() - 5 * 60 * 1000);

  const result = { pickSlot: 0, remind30: 0, remind10: 0 };

  // 1) Pick-your-slot nudge — paid, still unbooked, 5+ min old, not nudged.
  const unbooked = await prisma.consultPayment
    .findMany({
      where: { status: "PAID", bookingId: null, slotNudgeSent: false, createdAt: { lte: paidBefore } },
      take: 100,
    })
    .catch(() => []);
  for (const p of unbooked) {
    await sendPickSlotNudge({
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      expertName: p.expertName,
      amount: p.amount,
    }).catch((e) => console.error("pick-slot nudge:", e));
    await prisma.consultPayment.update({ where: { id: p.id }, data: { slotNudgeSent: true } }).catch(() => null);
    result.pickSlot++;
  }

  // 2) 30-min reminder — starts in 10–30 min, no link, not yet sent.
  const soon30 = await prisma.booking
    .findMany({
      where: {
        status: "CONFIRMED",
        remind30Sent: false,
        startTime: { gt: in10, lte: in30 },
      },
      include: { expert: { select: { email: true } } },
      take: 100,
    })
    .catch(() => []);
  for (const b of soon30) {
    await sendReminderEmails({
      attendeeName: b.attendeeName,
      attendeeEmail: b.attendeeEmail,
      expertName: b.expertName,
      expertEmail: b.expert?.email || "",
      startTime: b.startTime,
      meetUrl: meetUrlFor(b.id),
      stage: 30,
    }).catch((e) => console.error("30-min reminder:", e));
    await prisma.booking.update({ where: { id: b.id }, data: { remind30Sent: true } }).catch(() => null);
    result.remind30++;
  }

  // 3) 10-min reminder — starts within 10 min (and not past), releases link.
  const soon10 = await prisma.booking
    .findMany({
      where: {
        status: "CONFIRMED",
        remind10Sent: false,
        startTime: { gt: now, lte: in10 },
      },
      include: { expert: { select: { email: true } } },
      take: 100,
    })
    .catch(() => []);
  for (const b of soon10) {
    await sendReminderEmails({
      attendeeName: b.attendeeName,
      attendeeEmail: b.attendeeEmail,
      expertName: b.expertName,
      expertEmail: b.expert?.email || "",
      startTime: b.startTime,
      meetUrl: meetUrlFor(b.id),
      stage: 10,
    }).catch((e) => console.error("10-min reminder:", e));
    // Mark both flags — a booking made <30 min out skips the 30-min stage.
    await prisma.booking
      .update({ where: { id: b.id }, data: { remind10Sent: true, remind30Sent: true } })
      .catch(() => null);
    result.remind10++;
  }

  return NextResponse.json({ ok: true, ...result, at: now.toISOString() });
}
