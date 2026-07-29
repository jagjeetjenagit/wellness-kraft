import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

function parseImages(input: unknown): string[] | undefined {
  if (input === undefined) return undefined;
  if (Array.isArray(input)) return input.filter(Boolean);
  return String(input || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    const images = parseImages(b.images);
    if (images !== undefined && images.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: b.name?.trim(),
        sku: b.sku?.trim(),
        description: b.description?.trim() ?? undefined,
        price: b.price !== undefined ? Math.round(Number(b.price)) : undefined,
        images,
        stock: b.stock !== undefined ? Math.max(0, Math.round(Number(b.stock))) : undefined,
        category: b.category?.trim(),
        consultRecommended:
          b.consultRecommended !== undefined ? !!b.consultRecommended : undefined,
        featured: b.featured !== undefined ? !!b.featured : undefined,
        active: b.active !== undefined ? !!b.active : undefined,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("update product failed:", err);
    return NextResponse.json({ error: "Could not update the product." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete. Tip: mark the product Inactive to hide it while keeping order history." },
      { status: 500 }
    );
  }
}
