import type { Metadata } from "next";
import Link from "next/link";
import { getSafeUser, ensureDbUser, userEmail, userPhone, isAdmin } from "@/lib/auth";
import { hasClerk, hasDatabase } from "@/lib/config";
import { getPrisma } from "@/lib/prisma";
import { formatINR, formatDateTime, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Dashboard",
  robots: { index: false },
};

const statusColors: Record<string, string> = {
  PROCESSING: "bg-sage/15 text-sage",
  SHIPPED: "bg-success/10 text-success",
  DELIVERED: "bg-success text-white",
  CANCELLED: "bg-alert/10 text-alert",
  CONFIRMED: "bg-success/10 text-success",
  COMPLETED: "bg-success text-white",
};

export default async function DashboardPage() {
  if (!hasClerk()) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Dashboard needs login first</h1>
          <p className="mt-3 text-sm text-sage">
            Set up Clerk (README step 2) to enable customer accounts, then this
            page will show each customer their bookings and orders.
          </p>
        </div>
      </div>
    );
  }

  const user = await getSafeUser();
  if (!user) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Please sign in</h1>
          <Link href="/sign-in" className="btn-primary mt-6">Sign in</Link>
        </div>
      </div>
    );
  }

  const dbUserId = await ensureDbUser(user);
  const email = userEmail(user);
  const phone = userPhone(user);
  const admin = await isAdmin();

  const prisma = hasDatabase() ? getPrisma() : null;

  const orders = prisma
    ? await prisma.order
        .findMany({
          where: {
            OR: [
              ...(dbUserId ? [{ userId: dbUserId }] : []),
              ...(email ? [{ shipEmail: { equals: email, mode: "insensitive" as const } }] : []),
              ...(phone ? [{ shipPhone: phone }] : []),
            ],
          },
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
        .catch(() => [])
    : [];

  const bookings = prisma
    ? await prisma.booking
        .findMany({
          where: {
            OR: [
              ...(dbUserId ? [{ userId: dbUserId }] : []),
              ...(email ? [{ attendeeEmail: { equals: email, mode: "insensitive" as const } }] : []),
              ...(phone ? [{ attendeePhone: phone }] : []),
            ],
          },
          orderBy: { startTime: "desc" },
          take: 20,
        })
        .catch(() => [])
    : [];

  return (
    <div className="container-x py-12 sm:py-16">
      <p className="eyebrow">My account</p>
      <h1 className="section-title mt-2">
        Hello{user.firstName ? `, ${user.firstName}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-sage">
        {email || phone} {admin && (
          <Link href="/admin" className="ml-2 font-semibold text-olive hover:underline">
            → Open admin area
          </Link>
        )}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Bookings */}
        <section>
          <h2 className="font-display text-2xl font-semibold">My consultations</h2>
          {bookings.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="text-sm text-sage">No consultations booked yet.</p>
              <Link href="/experts" className="btn-primary mt-4">Book your first consultation</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {bookings.map((b) => (
                <li key={b.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">{b.title}</p>
                      {b.expertName && (
                        <p className="text-sm text-sage">with {b.expertName}</p>
                      )}
                      <p className="mt-1 text-sm text-sage">{formatDateTime(b.startTime)}</p>
                    </div>
                    <span className={`badge ${statusColors[b.status] || "bg-soft-cream text-sage"}`}>
                      {b.status.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Orders */}
        <section>
          <h2 className="font-display text-2xl font-semibold">My orders</h2>
          {orders.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="text-sm text-sage">No orders yet.</p>
              <Link href="/shop" className="btn-secondary mt-4">Browse the shop</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">
                        Order {o.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-sage">
                        {formatDate(o.createdAt)} · {o.items.length}{" "}
                        {o.items.length === 1 ? "item" : "items"} · {formatINR(o.total)}
                      </p>
                      <p className="mt-1 text-xs text-sage/70">
                        {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <span className={`badge ${statusColors[o.fulfillmentStatus] || "bg-soft-cream text-sage"}`}>
                      {o.fulfillmentStatus.toLowerCase()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
