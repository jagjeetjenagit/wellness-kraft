import type { Testimonial } from "@prisma/client";

function Stars({ n }: { n: number }) {
  return (
    <p className="text-olive" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-sage/30">{"★".repeat(5 - n)}</span>
    </p>
  );
}

// Home-page testimonials. Renders written quotes and portrait (9:16) video
// stories in one grid. Uses native <video controls>, so no client JS needed.
export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="bg-soft-cream">
      <div className="container-x py-12 sm:py-20">
        <p className="eyebrow">Testimonials</p>
        <h2 className="section-title mt-2">Real people, real change</h2>

        <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="card overflow-hidden p-0">
              {t.videoUrl ? (
                <div className="relative bg-charcoal/5">
                  <video
                    src={t.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    poster={t.photo || undefined}
                    className="aspect-[9/16] w-full object-cover"
                  />
                </div>
              ) : null}

              <figcaption className="p-6">
                <Stars n={t.rating} />
                {t.quote && (
                  <blockquote className="mt-3 text-sm leading-relaxed text-charcoal/80">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                )}
                <div className="mt-4 flex items-center gap-3">
                  {t.photo && !t.videoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-10 w-10 rounded-full border border-sage/30 object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                    {t.location && <p className="text-xs text-sage/70">{t.location}</p>}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
