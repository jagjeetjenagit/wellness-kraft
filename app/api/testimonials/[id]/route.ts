import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

// Update or delete a single testimonial.

function clean(b: Record<string, unknown>) {
  const rating = Math.round(Number(b.rating));
  return {
    name: String(b.name ?? "").trim(),
    location: String(b.location ?? "").trim(),
    quote: String(b.quote ?? "").trim(),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 5,
    photo: String(b.photo ?? "").trim(),
    videoUrl: String(b.videoUrl ?? "").trim(),
    featured: b.featured !== undefined ? !!b.featured : true,
    active: b.active !== undefined ? !!b.active : true,
    sortOrder: Number.isFinite(Number(b.sortOrder)) ? Math.round(Number(b.sortOrder)) : 0,
  };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const data = clean(await req.json());
    if (!data.name) {
      return NextResponse.json({ error: "A name is required." }, { status: 400 });
    }
    if (!data.quote && !data.videoUrl) {
      return NextResponse.json(
        { error: "Add a written quote or a video (or both)." },
        { status: 400 }
      );
    }
    const testimonial = await prisma.testimonial.update({ where: { id: params.id }, data });
    return NextResponse.json(testimonial);
  } catch (err) {
    console.error("update testimonial failed:", err);
    return NextResponse.json({ error: "Could not update the testimonial." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    await prisma.testimonial.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete. Tip: untick “Show on home page” to hide it instead." },
      { status: 500 }
    );
  }
}
