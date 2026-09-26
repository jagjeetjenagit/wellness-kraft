import type { Metadata } from "next";
import { getExperts } from "@/lib/data";
import ExpertCard from "@/components/ExpertCard";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultations",
  description:
    "Book a 1-on-1 Health Consultation or Fitness Consultation online — a personalised diet, workout and lifestyle plan built around your life.",
};

export default async function ExpertsPage() {
  const experts = await getExperts();

  return (
    <>
      <DemoBanner />
      <div className="container-x py-12 sm:py-16">
        <p className="eyebrow">Consultations</p>
        <h1 className="section-title mt-2">
          Health or fitness — pick your consultation
        </h1>
        <p className="mt-3 max-w-2xl text-charcoal/75">
          Choose a Health Consultation or a Fitness Consultation, pick a time
          that suits you, and get a personalised plan you can start the same
          day.
        </p>

        {experts.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {experts.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        ) : (
          <div className="card mt-10 p-12 text-center text-sage">
            Consultations will be available to book shortly.
          </div>
        )}
      </div>
    </>
  );
}
