import Link from "next/link";
import type { ExpertT } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import Stars from "./Stars";
import { ExpertPhoto } from "./Placeholder";

export default function ExpertCard({ expert }: { expert: ExpertT }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/expert/${expert.slug}`} className="flex flex-1 flex-col">
        <ExpertPhoto
          name={expert.name}
          photo={expert.photo}
          className="aspect-square w-full"
        />
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-olive">
            {expert.specialty}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-charcoal group-hover:text-olive">
            {expert.name}
          </h3>
          <div className="mt-2">
            <Stars rating={expert.rating} count={expert.reviewCount} />
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-charcoal/75">{expert.bio}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            {expert.fee > 0 ? (
              <p className="font-bold text-charcoal">
                {formatINR(expert.fee)}{" "}
                <span className="text-xs font-normal text-sage">/ session</span>
              </p>
            ) : (
              <span />
            )}
          </div>
          <span className="btn-primary mt-3 w-full">Book a Consultation</span>
        </div>
      </Link>
    </article>
  );
}
