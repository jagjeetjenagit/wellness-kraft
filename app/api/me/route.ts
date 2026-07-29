import { NextRequest, NextResponse } from "next/server";
import { getSafeUser, ensureDbUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/config";

// Save the signed-in customer's phone number to their own account.
// Google sign-in doesn't provide a phone, so we ask for it once at
// booking time and store it here for next time.
export async function PATCH(req: NextRequest) {
  const user = await getSafeUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  if (!phone) {
    return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
  }

  // No database yet: nothing to persist to, but don't treat it as an error —
  // the booking can still proceed with the phone for this session.
  if (!hasDatabase()) return NextResponse.json({ ok: true, phone });

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: true, phone });

  try {
    await ensureDbUser(user);
    await prisma.user.update({ where: { clerkId: user.id }, data: { phone } });
  } catch {
    return NextResponse.json(
      { error: "Couldn't save your phone just now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, phone });
}
