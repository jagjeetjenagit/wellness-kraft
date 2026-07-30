import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const prisma = getPrisma();

  let stats = {
    paidOrders: 0,
    revenue: 0,
    processing: 0,
    products: 0,
    lowStock: 0,
    experts: 0,
    upcomingBookings: 0,
  };

  if (prisma) {
    try {
      const [paidAgg, processing, products, lowStock, experts, upcomingBookings] =
        await Promise.all([
          prisma.order.aggregate({
            where: { paymentStatus: "PAID" },
            _count: true,
            _sum: { total: true },
          }),
          prisma.order.count({
            where: { paymentStatus: "PAID", fulfillmentStatus: "PROCESSING" },
          }),
          prisma.product.count({ where: { active: true } }),
          prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
          prisma.expert.count({ where: { active: true } }),
          prisma.booking.count({
            where: { status: "CONFIRMED", startTime: { gte: new Date() } },
          }),
        ]);
      stats = {
        paidOrders: paidAgg._count,
        revenue: paidAgg._sum.total || 0,
        processing,
        products,
        lowStock,
        experts,
        upcomingBookings,
      };
    } catch {
      // stats stay at zero if the database is unreachable
    }
  }

  const cards = [
    { label: "Total revenue (paid)", value: formatINR(stats.revenue), href: "/admin/orders" },
    { label: "Paid orders", value: String(stats.paidOrders), href: "/admin/orders" },
    { label: "Orders to ship", value: String(stats.processing), href: "/admin/orders", highlight: stats.processing > 0 },
    { label: "Active products", value: String(stats.products), href: "/admin/products" },
    { label: "Low stock (≤5)", value: String(stats.lowStock), href: "/admin/products", warn: stats.lowStock > 0 },
    { label: "Active experts", value: String(stats.experts), href: "/admin/experts" },
    { label: "Upcoming bookings", value: String(stats.upcomingBookings), href: "/admin/bookings" },
  ];

  return (
    <div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift ${
              c.warn ? "border-alert/50" : c.highlight ? "border-olive/50" : ""
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-sage/70">{c.label}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${c.warn ? "text-alert" : "text-charcoal"}`}>
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-display text-xl font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products" className="btn-primary">Add a product</Link>
          <Link href="/admin/experts" className="btn-secondary">Add an expert</Link>
          <Link href="/admin/orders" className="btn-secondary">Ship pending orders</Link>
        </div>
      </div>
    </div>
  );
}
