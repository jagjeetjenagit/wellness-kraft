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
  PROCESSING: "bg-gold/15 text-gold",
  SHIPPED: "bg-pine-light text-pine",
  DELIVERED: "bg-pine text-white",
  CANCELLED: "bg-clay-light text-clay",
  CONFIRMED: "bg-pine-light text-pine",
  COMPLETED: "bg-pine text-white",
};

export default async function DashboardPage() {
  if (!hasClerk()) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Dashboard needs login first</h1>
          <p className="mt-3 text-sm text-ink-soft">
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
      <p className="mt-2 text-sm text-ink-soft">
        {email || phone} {admin && (
          <Link href="/admin" className="ml-2 font-semibold text-pine hover:underline">
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
              <p className="text-sm text-ink-soft">No consultations booked yet.</p>
              <Link href="/experts" className="btn-primary mt-4">Book your first consultation</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {bookings.map((b) => (
                <li key={b.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{b.title}</p>
                      {b.expertName && (
                        <p className="text-sm text-ink-soft">with {b.expertName}</p>
                      )}
                      <p className="mt-1 text-sm text-ink-soft">{formatDateTime(b.startTime)}</p>
                    </div>
                    <span className={`badge ${statusColors[b.status] || "bg-cream text-ink-soft"}`}>
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
              <p className="text-sm text-ink-soft">No orders yet.</p>
              <Link href="/shop" className="btn-secondary mt-4">Browse the shop</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        Order {o.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {formatDate(o.createdAt)} · {o.items.length}{" "}
                        {o.items.length === 1 ? "item" : "items"} · {formatINR(o.total)}
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <span className={`badge ${statusColors[o.fulfillmentStatus] || "bg-cream text-ink-soft"}`}>
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
