import type { Metadata } from "next";
import Link from "next/link";
import { getSafeUser, ensureDbUser, userEmail, userPhone, isAdmin, getExpertForUser } from "@/lib/auth";
import { hasAuth, hasDatabase } from "@/lib/config";
import { getPrisma } from "@/lib/prisma";
import { formatINR, formatDateTime, formatDate } from "@/lib/utils";
import { meetUrlFor } from "@/lib/slots";
import JoinCall from "@/components/JoinCall";
import CartControl from "@/components/CartControl";

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
  if (!hasAuth()) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Dashboard needs login first</h1>
          <p className="mt-3 text-sm text-charcoal/75">
            Set up Google login (README step 2) to enable customer accounts, then
            this page will show each customer their bookings and orders.
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
  const expertRecord = await getExpertForUser();

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

  // Consultations the customer has PAID for but that aren't yet linked to a
  // scheduled Cal.com booking (the Cal webhook links them once the slot is
  // picked). Showing these means a paid consult always appears here, even
  // before/without the calendar webhook firing.
  const paidConsults =
    prisma && email
      ? await prisma.consultPayment
          .findMany({
            where: {
              status: "PAID",
              bookingId: null,
              customerEmail: { equals: email, mode: "insensitive" as const },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
          .catch(() => [])
      : [];

  // Look up each paid consult's calendar link so the customer can pick a slot
  // for what they've already paid for (general consult uses the shared link).
  const expertIds = Array.from(
    new Set(paidConsults.map((c) => c.expertId).filter(Boolean) as string[])
  );
  const consultExperts =
    prisma && expertIds.length
      ? await prisma.expert
          .findMany({ where: { id: { in: expertIds } }, select: { id: true, slug: true } })
          .catch(() => [])
      : [];
  // Where the customer goes to pick a time for an already-paid consult.
  const scheduleHref = (expertId: string | null) =>
    expertId ? `/expert/${consultExperts.find((e) => e.id === expertId)?.slug || ""}` : "/consult";

  // Products recommended by experts in prescriptions → shown as Buy buttons.
  const rxProductIds = Array.from(new Set(bookings.flatMap((b) => b.prescribedProductIds || [])));
  const rxProducts =
    prisma && rxProductIds.length
      ? await prisma.product
          .findMany({
            where: { id: { in: rxProductIds } },
            select: { id: true, name: true, slug: true, price: true, images: true, stock: true },
          })
          .catch(() => [])
      : [];
  const rxMap = new Map(rxProducts.map((p) => [p.id, p]));

  return (
    <div className="container-x py-12 sm:py-16">
      <p className="eyebrow">My account</p>
      <h1 className="section-title mt-2">
        Hello{user.firstName ? `, ${user.firstName}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-charcoal/75">
        {email || phone}{" "}
        {admin && (
          <Link href="/admin" className="ml-2 font-semibold text-olive hover:underline">
            → Open admin area
          </Link>
        )}
        {expertRecord && (
          <Link href="/studio" className="ml-2 font-semibold text-olive hover:underline">
            → Open Expert Studio
          </Link>
        )}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Bookings */}
        <section>
          <h2 className="font-display text-2xl font-semibold">My consultations</h2>
          {bookings.length === 0 && paidConsults.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="text-sm text-charcoal/75">No consultations booked yet.</p>
              <Link href="/experts" className="btn-primary mt-4">Book your first consultation</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {paidConsults.map((c) => (
                <li key={c.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">
                        Consultation{c.expertName ? ` with ${c.expertName}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-charcoal/75">Paid on {formatDate(c.createdAt)}</p>
                      <p className="mt-2 text-xs text-sage/70">
                        You&apos;ve paid — now pick a time that suits you. You&apos;ll get a
                        private video link once you&apos;ve chosen a slot.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="badge bg-sage/15 text-sage">to be scheduled</span>
                      <span className="badge bg-success/10 text-success">Paid {formatINR(c.amount)}</span>
                    </div>
                  </div>
                  <Link href={scheduleHref(c.expertId)} className="btn-primary mt-4 inline-flex">
                    Pick your date &amp; time
                  </Link>
                </li>
              ))}
              {bookings.map((b) => (
                <li key={b.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">{b.title}</p>
                      {b.expertName && (
                        <p className="text-sm text-charcoal/75">with {b.expertName}</p>
                      )}
                      <p className="mt-1 text-sm text-charcoal/75">{formatDateTime(b.startTime)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`badge ${statusColors[b.status] || "bg-soft-cream text-sage"}`}>
                        {b.status.toLowerCase()}
                      </span>
                      {b.amountPaid > 0 && (
                        <span className="badge bg-success/10 text-success">
                          Paid {formatINR(b.amountPaid)}
                        </span>
                      )}
                    </div>
                  </div>
                  {b.status === "CONFIRMED" && (
                    <div className="mt-2">
                      <JoinCall startTime={new Date(b.startTime).toISOString()} meetUrl={meetUrlFor(b.id)} />
                    </div>
                  )}
                  {(b.prescription || b.prescribedProductIds.length > 0) && (
                    <div className="mt-4 rounded-xl border border-sage/30 bg-soft-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-olive">
                        Prescription &amp; advice
                      </p>
                      {b.prescription && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-charcoal/75">
                          {b.prescription}
                        </p>
                      )}
                      {b.prescribedProductIds.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-sage">Recommended products</p>
                          <div className="mt-2 space-y-2">
                            {b.prescribedProductIds.map((pid) => {
                              const p = rxMap.get(pid);
                              if (!p) return null;
                              return (
                                <div
                                  key={pid}
                                  className="flex items-center justify-between gap-3 rounded-lg bg-white p-2.5"
                                >
                                  <Link
                                    href={`/product/${p.slug}`}
                                    className="text-sm font-semibold text-charcoal hover:text-olive"
                                  >
                                    {p.name}{" "}
                                    <span className="font-normal text-sage/80">
                                      · {formatINR(p.price)}
                                    </span>
                                  </Link>
                                  <CartControl
                                    product={{
                                      id: p.id,
                                      slug: p.slug,
                                      name: p.name,
                                      price: p.price,
                                      image: p.images[0] || "",
                                      stock: p.stock,
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
              <p className="text-sm text-charcoal/75">No orders yet.</p>
              <Link href="/shop" className="btn-secondary mt-4">Browse the shop</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => {
                const pay =
                  o.paymentStatus === "PAID"
                    ? { label: "Paid", cls: "bg-success/10 text-success" }
                    : o.paymentStatus === "FAILED"
                      ? { label: "Payment failed", cls: "bg-alert/10 text-alert" }
                      : { label: "Payment pending", cls: "bg-sage/15 text-sage" };
                return (
                  <li key={o.id} className="card p-5">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                        <div>
                          <p className="font-semibold text-charcoal">
                            Order {o.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-charcoal/75">
                            {formatDate(o.createdAt)} · {o.items.length}{" "}
                            {o.items.length === 1 ? "item" : "items"} · {formatINR(o.total)}
                          </p>
                          <p className="mt-2 text-xs font-semibold text-olive">
                            View full summary ▾
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`badge ${pay.cls}`}>{pay.label}</span>
                          {o.paymentStatus === "PAID" && (
                            <span className={`badge ${statusColors[o.fulfillmentStatus] || "bg-soft-cream text-sage"}`}>
                              {o.fulfillmentStatus.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </summary>

                      <div className="mt-4 border-t border-sage/30 pt-4 text-sm">
                        <ul className="space-y-1.5">
                          {o.items.map((i) => (
                            <li key={i.id} className="flex justify-between gap-3 text-charcoal/75">
                              <span>{i.name} × {i.quantity}</span>
                              <span className="font-semibold">{formatINR(i.price * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-between border-t border-sage/20 pt-3 font-bold text-charcoal">
                          <span>Total</span>
                          <span>{formatINR(o.total)}</span>
                        </div>
                        <div className="mt-4 grid gap-3 rounded-xl bg-soft-cream p-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-sage/70">Deliver to</p>
                            <p className="mt-1 leading-relaxed text-charcoal/75">
                              {o.shipName}<br />
                              {o.shipAddress1}
                              {o.shipAddress2 ? `, ${o.shipAddress2}` : ""}<br />
                              {o.shipCity}, {o.shipState} — {o.shipPincode}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-sage/70">Payment</p>
                            <p className="mt-1 leading-relaxed text-charcoal/75">
                              {pay.label}
                              {o.razorpayPaymentId ? <><br />Ref: {o.razorpayPaymentId}</> : null}
                            </p>
                          </div>
                        </div>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
