import Link from "next/link";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const prisma = getPrisma();
  const order =
    prisma && searchParams.order
      ? await prisma.order
          .findUnique({
            where: { id: searchParams.order },
            include: { items: true },
          })
          .catch(() => null)
      : null;

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pine-light text-3xl" aria-hidden="true">
        🎉
      </span>
      <p className="eyebrow mt-6">Payment received</p>
      <h1 className="section-title mt-3">Your order is confirmed!</h1>
      <p className="mt-4 max-w-md text-ink-soft">
        {order
          ? `Order ${order.id.slice(-8).toUpperCase()} — ${formatINR(order.total)} paid. `
          : ""}
        A confirmation email is on its way. We&apos;ll pack your order and ship it
        within 1–2 working days.
      </p>

      {order && (
        <div className="card mt-8 w-full max-w-md p-6 text-left">
          <h2 className="font-display text-lg font-semibold">What you ordered</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span className="text-ink-soft">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-semibold">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-sand pt-3 text-sm text-ink-soft">
            Delivering to: {order.shipAddress1}, {order.shipCity} — {order.shipPincode}
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="btn-primary">View my orders</Link>
        <Link href="/shop" className="btn-secondary">Continue shopping</Link>
      </div>
    </div>
  );
}
