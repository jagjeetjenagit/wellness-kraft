import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    const expert = await prisma.expert.update({
      where: { id: params.id },
      data: {
        name: b.name?.trim(),
        specialty: b.specialty?.trim(),
        photo: b.photo?.trim() ?? undefined,
        bio: b.bio?.trim() ?? undefined,
        credentials: Array.isArray(b.credentials)
          ? b.credentials
          : b.credentials !== undefined
            ? String(b.credentials).split(",").map((s: string) => s.trim()).filter(Boolean)
            : undefined,
        rating: b.rating !== undefined ? Number(b.rating) : undefined,
        reviewCount: b.reviewCount !== undefined ? Number(b.reviewCount) : undefined,
        fee: b.fee !== undefined ? Math.max(0, Math.round(Number(b.fee) || 0)) : undefined,
        calLink: b.calLink?.trim() ?? undefined,
        featured: b.featured !== undefined ? !!b.featured : undefined,
        active: b.active !== undefined ? !!b.active : undefined,
        products: Array.isArray(b.productIds)
          ? { set: b.productIds.map((id: string) => ({ id })) }
          : undefined,
      },
    });
    return NextResponse.json(expert);
  } catch (err) {
    console.error("update expert failed:", err);
    return NextResponse.json({ error: "Could not update the expert." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    await prisma.expert.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete. Tip: you can also mark the expert Inactive instead." },
      { status: 500 }
    );
  }
}
