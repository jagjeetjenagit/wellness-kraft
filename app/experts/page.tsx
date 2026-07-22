import type { Metadata } from "next";
import Link from "next/link";
import { getExperts } from "@/lib/data";
import { generalConsultFee } from "@/lib/config";
import { formatINR } from "@/lib/utils";
import ExpertsGrid from "@/components/ExpertsGrid";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find an Expert",
  description:
    "Browse verified health experts — doctors, nutritionists, fitness trainers, Ayurveda physicians, dermatologists and sleep coaches. Book a paid 1-on-1 consultation online.",
};

export default async function ExpertsPage() {
  const experts = await getExperts();

  return (
    <>
      <DemoBanner />
      <div className="container-x py-12 sm:py-16">
        <p className="eyebrow">Our experts</p>
        <h1 className="section-title mt-2">
          Verified professionals, ready when you are
        </h1>
        <p className="mt-3 max-w-2xl text-charcoal/75">
          Every expert on this page has had their credentials checked — doctors,
          nutritionists, fitness trainers and more. Pick a specialty, read
          their story, and book a paid 1-on-1 session directly on their
          calendar.
        </p>

        <div className="card mt-8 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Not sure who to pick?</h2>
            <p className="mt-1 text-sm text-charcoal/75">
              Start with a general consultation — we&apos;ll understand your goals
              and point you to the right expert.
            </p>
          </div>
          <Link href="/consult" className="btn-primary shrink-0">
            General Consultation · {formatINR(generalConsultFee())}
          </Link>
        </div>

        <div className="mt-10">
          <ExpertsGrid experts={experts} />
        </div>
      </div>
    </>
  );
}
