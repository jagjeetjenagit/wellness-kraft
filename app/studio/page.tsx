import { getExpertForUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { formatDateTime, formatINR } from "@/lib/utils";
import { meetUrlFor, configFromExpert } from "@/lib/slots";
import JoinCall from "@/components/JoinCall";
import StudioPrescription from "@/components/StudioPrescription";
import StudioAvailability from "@/components/StudioAvailability";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const expert = await getExpertForUser();
  if (!expert) return null; // layout shows the gate

  const prisma = getPrisma();
  const bookings = prisma
    ? await prisma.booking
        .findMany({ where: { expertId: expert.id }, orderBy: { startTime: "desc" }, take: 100 })
        .catch(() => [])
    : [];
  const products = prisma
    ? await prisma.product
        .findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } })
        .catch(() => [])
    : [];

  const now = Date.now();
  const upcoming = bookings
    .filter((b) => new Date(b.startTime).getTime() >= now && b.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = bookings.filter(
    (b) => new Date(b.startTime).getTime() < now || b.status === "CANCELLED"
  );

  const card = (b: (typeof bookings)[number], isUpcoming: boolean) => (
    <li key={b.id} className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-charcoal">{formatDateTime(b.startTime)}</p>
          <p className="mt-1 text-sm text-charcoal/75">
            {b.attendeeName || "Customer"}
            {b.attendeeEmail ? ` · ${b.attendeeEmail}` : ""}
            {b.attendeePhone ? ` · ${b.attendeePhone}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`badge ${
              b.status === "CANCELLED" ? "bg-alert/10 text-alert" : "bg-soft-cream text-olive"
            }`}
          >
            {b.status.toLowerCase()}
          </span>
          {b.amountPaid > 0 && (
            <span className="badge bg-success/10 text-success">Paid {formatINR(b.amountPaid)}</span>
          )}
        </div>
      </div>
      {isUpcoming && b.status === "CONFIRMED" && (
        <JoinCall startTime={new Date(b.startTime).toISOString()} meetUrl={meetUrlFor(b.id)} />
      )}
      <StudioPrescription
        bookingId={b.id}
        initial={b.prescription}
        products={products}
        initialProductIds={b.prescribedProductIds}
      />
    </li>
  );

  const cfg = configFromExpert(expert);

  return (
    <div className="space-y-10">
      <StudioAvailability
        initial={{
          days: cfg.days,
          startHour: cfg.startHour,
          endHour: cfg.endHour,
          slotMins: cfg.slotMins,
        }}
      />

      <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-2xl font-semibold">Upcoming consultations</h2>
        {upcoming.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-sm text-charcoal/75">
            No upcoming consultations. New bookings appear here automatically.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">{upcoming.map((b) => card(b, true))}</ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Past consultations</h2>
        {past.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-sm text-charcoal/75">
            No past consultations yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">{past.map((b) => card(b, false))}</ul>
        )}
      </section>
      </div>
    </div>
  );
}
