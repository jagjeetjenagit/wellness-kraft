import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Wellness Kraft is built around expert consultation first — real Ayurvedic doctors, natural and harmless products, and practical guidance built around your life.",
};

const PRINCIPLES = [
  {
    title: "Expertise over guesswork",
    text: "Every recommendation comes from a qualified professional.",
  },
  {
    title: "Natural over harsh",
    text: "We only recommend products that are safe, natural, and honestly labelled.",
  },
  {
    title: "Guidance over gimmicks",
    text: "Real plans, real follow-up, real change.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">About us</p>
        <h1 className="section-title mt-2">
          We believe wellness should be guided, not guessed.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-sage">
          Muscle Vigor and Wellness Kraft exist because too many people are
          left to figure out their fitness, nutrition, and lifestyle problems
          on their own — piecing together advice from the internet, trying
          products with no real understanding of what their body actually
          needs.
        </p>
        <p className="mt-4 leading-relaxed text-sage">
          We do it differently. Our model is built around{" "}
          <strong className="text-charcoal">expert consultation first</strong> —
          real Ayurvedic doctors who take the time to understand what&apos;s
          actually going on with you, not just what symptom you&apos;re trying
          to fix. From there, we support you with natural, harmless products
          and practical guidance — diet charts, workout schedules, and
          supplement plans — built around your life, not a one-size-fits-all
          template.
        </p>
        <p className="mt-4 leading-relaxed text-sage">
          We&apos;re not here to sell you a bottle and move on. We&apos;re here
          to help you change something that lasts.
        </p>
      </div>

      {/* WHAT WE STAND FOR */}
      <div className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-olive sm:text-3xl">
          What We Stand For
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="card p-6">
              <h3 className="font-display text-xl font-semibold text-charcoal">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sage">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OUR TEAM
          TODO(client): add doctor bios, qualifications, and photos here
          once finalised. */}
      <div className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-olive sm:text-3xl">
          Our Team
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-sage/40 bg-soft-cream p-8 text-center">
          <p className="text-sage">
            Doctor bios, qualifications, and photos are on their way.
          </p>
        </div>
      </div>

      <div className="mt-14 rounded-3xl bg-soft-cream p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-semibold text-olive sm:text-3xl">
          Start with a conversation
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sage">
          One conversation is enough to understand what your plan should look
          like.
        </p>
        <Link href="/experts" className="btn-primary mt-6">
          Book a Consultation
        </Link>
      </div>
    </div>
  );
}
