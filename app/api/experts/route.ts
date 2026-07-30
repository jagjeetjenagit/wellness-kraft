import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

// Admin: list ALL experts (including inactive) and create new ones.

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const experts = await prisma.expert.findMany({
    orderBy: { createdAt: "desc" },
    include: { products: { select: { id: true } } },
  });
  return NextResponse.json(experts);
}

export async function POST(req: NextRequest) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    if (!b.name?.trim() || !b.specialty?.trim()) {
      return NextResponse.json({ error: "Name and specialty are required." }, { status: 400 });
    }
    if (!b.photo?.trim()) {
      return NextResponse.json({ error: "A photo is required for every expert." }, { status: 400 });
    }
    const expert = await prisma.expert.create({
      data: {
        name: b.name.trim(),
        slug: b.slug?.trim() || slugify(b.name) + "-" + Date.now().toString(36).slice(-4),
        specialty: b.specialty.trim(),
        photo: b.photo.trim(),
        bio: b.bio?.trim() || "",
        credentials: Array.isArray(b.credentials)
          ? b.credentials
          : String(b.credentials || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        rating: Number(b.rating) || 5,
        reviewCount: Number(b.reviewCount) || 0,
        fee: Math.max(0, Math.round(Number(b.fee) || 0)),
        calLink: b.calLink?.trim() || "",
        email: b.email?.trim() || "",
        featured: !!b.featured,
        active: b.active !== false,
        products: Array.isArray(b.productIds)
          ? { connect: b.productIds.map((id: string) => ({ id })) }
          : undefined,
      },
    });
    return NextResponse.json(expert, { status: 201 });
  } catch (err) {
    console.error("create expert failed:", err);
    return NextResponse.json({ error: "Could not save the expert. Please try again." }, { status: 500 });
  }
}
