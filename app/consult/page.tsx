import type { Metadata } from "next";
import Link from "next/link";
import BookingWidget from "@/components/BookingWidget";
import { generalConsultFee } from "@/lib/config";
import { getBookingIdentity, hasUnlinkedPaidConsult } from "@/lib/auth";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "General Consultation",
  description:
    "Not sure which expert you need? Book a general consultation — we'll understand your goals and point you in the right direction.",
};

const COVERS = [
  "A conversation about your goals, habits and health history",
  "First-step guidance you can act on immediately",
  "A recommendation on whether a Health or Fitness Consultation suits you best",
  "Honest advice on whether you need products at all",
];

export default async function GeneralConsultPage() {
  const fee = generalConsultFee();
  const identity = await getBookingIdentity();
  const alreadyPaid = identity.signedIn
    ? await hasUnlinkedPaidConsult(identity.email, null)
    : false;
  return (
    <div className="container-x py-12 sm:py-16">
      <Link href="/experts" className="text-sm font-semibold text-olive hover:underline">
        ← All consultations
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[380px,1fr]">
        <div>
          <p className="eyebrow">Start here</p>
          <h1 className="section-title mt-2">General Consultation</h1>
          {fee > 0 && (
            <p className="mt-3 text-lg font-bold text-olive">
              {formatINR(fee)} <span className="text-sm font-normal text-sage">per session</span>
            </p>
          )}
          <p className="mt-4 leading-relaxed text-charcoal/75">
            Not sure whether you need a health or a fitness plan? Start with a general consultation — one conversation to
            understand what&apos;s going on, and where to go next.
          </p>
          <ul className="mt-6 space-y-3">
            {COVERS.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-charcoal/75">
                <span className="mt-0.5 text-success" aria-hidden="true">✓</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <BookingWidget
            expertName="General Consultation"
            fee={fee}
            authEnabled={identity.authEnabled}
            signedIn={identity.signedIn}
            userName={identity.name}
            userEmail={identity.email}
            savedPhone={identity.phone}
            alreadyPaid={alreadyPaid}
          />
        </div>
      </div>
    </div>
  );
}
