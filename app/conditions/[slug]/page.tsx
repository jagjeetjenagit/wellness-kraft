import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONDITIONS, getCondition } from "@/lib/conditions";

// Compliance note (FSSAI): this page must describe SUPPORT and GUIDANCE
// for the condition — never cures, treatment, or disease-reversal claims.
// Keep all language within FSSAI-permitted supplement wording.

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return CONDITIONS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const condition = getCondition(params.slug);
  if (!condition) return { title: "Condition not found" };
  return {
    title: `${condition.name} — Guidance & Support`,
    description: `Expert-led lifestyle guidance and natural product support for ${condition.name.toLowerCase()}. Book a consultation with a registered Ayurvedic doctor.`,
  };
}

export default function ConditionPage({ params }: Props) {
  const condition = getCondition(params.slug);
  if (!condition) notFound();

  return (
    <div className="container-x py-12 sm:py-16">
      <Link href="/#approach" className="text-sm font-semibold text-olive hover:underline">
        ← All conditions
      </Link>
      <div className="mt-6 max-w-3xl">
        <p className="eyebrow">Conditions we help with</p>
        <h1 className="section-title mt-2">{condition.name}</h1>
        {/* TODO(client): replace this placeholder with condition-specific
            copy — what the consultation covers, typical guidance, and
            lifestyle support offered. Support/guidance language only. */}
        <p className="mt-6 text-lg leading-relaxed text-charcoal/75">
          Our experts guide people through {condition.name.toLowerCase()} with
          personalised lifestyle plans — diet, movement, and natural product
          support built around your daily life. It starts with a real
          conversation about what&apos;s going on with you.
        </p>
        <p className="mt-4 leading-relaxed text-charcoal/75">
          Consultations are led by registered Ayurvedic doctors. Our guidance
          supports your general wellness alongside — never instead of — the
          advice of your treating physician.
        </p>
      </div>

      <div className="mt-12 rounded-3xl bg-soft-cream p-8 text-center sm:p-12">
        <h2 className="font-display text-3xl font-semibold text-olive sm:text-4xl">
          Talk it through with an expert
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-charcoal/75">
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
