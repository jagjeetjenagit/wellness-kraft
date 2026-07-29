import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

function parseImages(input: unknown): string[] {
  if (Array.isArray(input)) return input.filter(Boolean);
  return String(input || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    if (!b.name?.trim() || b.price === undefined || b.price === "") {
      return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
    }
    const price = Math.round(Number(b.price));
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number (in rupees)." }, { status: 400 });
    }
    const images = parseImages(b.images);
    if (images.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: b.name.trim(),
        slug: b.slug?.trim() || slugify(b.name) + "-" + Date.now().toString(36).slice(-4),
        sku: b.sku?.trim() || "SKU-" + Date.now().toString(36).toUpperCase(),
        description: b.description?.trim() || "",
        price,
        images,
        stock: Math.max(0, Math.round(Number(b.stock)) || 0),
        category: b.category?.trim() || "General",
        consultRecommended: !!b.consultRecommended,
        featured: !!b.featured,
        active: b.active !== false,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("create product failed:", err);
    return NextResponse.json(
      { error: "Could not save the product. Check that the SKU isn't already used." },
      { status: 500 }
    );
  }
}
