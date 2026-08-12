import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const orders = await prisma.order
    .findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    .catch((e) => {
      console.error("admin orders query failed:", e);
      return [];
    });
  return NextResponse.json(orders);
}
