import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExpert, getExpertProducts } from "@/lib/data";
import { getBookingIdentity, hasUnlinkedPaidConsult } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import Stars from "@/components/Stars";
import { ExpertPhoto } from "@/components/Placeholder";
import BookingWidget from "@/components/BookingWidget";
import ProductCard from "@/components/ProductCard";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const expert = await getExpert(params.id);
  if (!expert) return { title: "Expert not found" };
  return {
    title: `${expert.name} — ${expert.specialty}`,
    description: expert.bio.slice(0, 155),
    openGraph: {
      title: `${expert.name} — ${expert.specialty} | Wellness Kraft`,
      description: expert.bio.slice(0, 155),
    },
  };
}

export default async function ExpertProfilePage({ params }: Props) {
  const expert = await getExpert(params.id);
  if (!expert) notFound();

  const products = await getExpertProducts(expert);
  const identity = await getBookingIdentity();
  const alreadyPaid = identity.signedIn
    ? await hasUnlinkedPaidConsult(identity.email, expert.id)
    : false;

  return (
    <>
      <DemoBanner />
      <div className="container-x py-12 sm:py-16">
        <Link href="/experts" className="text-sm font-semibold text-olive hover:underline">
          ← All experts
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[340px,1fr]">
          {/* Profile column */}
          <div>
            <div className="card overflow-hidden">
              <ExpertPhoto name={expert.name} photo={expert.photo} className="h-72 w-full" />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-olive">
                  {expert.specialty}
                </p>
                <h1 className="mt-1 font-display text-2xl font-semibold text-charcoal">
                  {expert.name}
                </h1>
                <div className="mt-3">
                  <Stars rating={expert.rating} count={expert.reviewCount} />
                </div>
                {expert.fee > 0 && (
                  <p className="mt-3 text-lg font-bold text-olive">
                    {formatINR(expert.fee)}{" "}
                    <span className="text-sm font-normal text-sage">per 1-on-1 session</span>
                  </p>
                )}
                <hr className="my-5 border-sage/30" />
                <p className="text-sm font-bold uppercase tracking-wider text-sage/70">
                  Credentials
                </p>
                <ul className="mt-3 space-y-2">
                  {expert.credentials.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-charcoal/75">
                      <span className="mt-0.5 text-olive" aria-hidden="true">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bio + booking */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">
              About {expert.name.split(" ")[0] === "Dr." ? expert.name : expert.name.split(" ")[0]}
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-charcoal/75">
              {expert.bio}
            </p>

            <div className="mt-10" id="book">
              <p className="eyebrow">Book a consultation</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-charcoal">
                Pick a time that works for you
              </h2>
              <div className="mt-5">
                <BookingWidget
                  calLink={expert.calLink}
                  expertName={expert.name}
                  expertId={expert.id}
                  fee={expert.fee}
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
        </div>

        {/* Recommended products */}
        {products.length > 0 && (
          <section className="mt-16">
            <p className="eyebrow">Recommended by {expert.name}</p>
            <h2 className="section-title mt-2">Products this expert trusts</h2>
            <p className="mt-2 max-w-2xl text-sm text-charcoal/75">
              These are the tested products {expert.name} most often recommends
              in consultations. Where a product is marked
              &ldquo;consult recommended&rdquo;, we suggest speaking to an expert first.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
