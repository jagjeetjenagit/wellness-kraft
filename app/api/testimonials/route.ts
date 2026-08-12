import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

// Testimonials for the admin.
//  GET  — list ALL (including hidden), ordered as shown on the site
//  POST — create a new testimonial

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const testimonials = await prisma.testimonial
    .findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
    .catch((e) => {
      console.error("admin testimonials query failed:", e);
      return [];
    });
  return NextResponse.json(testimonials);
}

// Shared field parsing/validation for POST and PUT.
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

export async function POST(req: NextRequest) {
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
    const testimonial = await prisma.testimonial.create({ data });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    console.error("create testimonial failed:", err);
    return NextResponse.json({ error: "Could not save the testimonial." }, { status: 500 });
  }
}
