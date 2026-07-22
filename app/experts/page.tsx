import type { Metadata } from "next";
import { getExperts } from "@/lib/data";
import ExpertsGrid from "@/components/ExpertsGrid";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find an Expert",
  description:
    "Browse verified health experts — nutritionists, Ayurveda physicians, dermatologists, yoga therapists and sleep coaches. Book a 1-on-1 consultation online.",
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
        <p className="mt-3 max-w-2xl text-sage">
          Every expert on this page has had their credentials checked. Pick a
          specialty, read their story, and book a time directly on their
          calendar.
        </p>
        <div className="mt-10">
          <ExpertsGrid experts={experts} />
        </div>
      </div>
    </>
  );
}
