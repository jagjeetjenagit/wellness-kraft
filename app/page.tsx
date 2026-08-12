import Link from "next/link";
import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import ExpertCard from "@/components/ExpertCard";
import ProductCard from "@/components/ProductCard";
import GraphicBlock from "@/components/GraphicBlock";
import Testimonials from "@/components/Testimonials";
import { CONDITIONS } from "@/lib/conditions";
import { getFeaturedExperts, getFeaturedProducts, getFeaturedTestimonials } from "@/lib/data";

// Always fresh so experts/products added in /admin show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wellness Kraft — Real Experts. Natural Solutions. Lasting Lifestyle Change.",
  description:
    "We help you fix the root cause of your fitness, nutrition, and lifestyle problems — through expert consultation, natural and harmless products, and guidance that actually sticks.",
};

// TODO(client): replace with the real "people guided" number before launch.
const PLACEHOLDER_COUNT = "[X]";

const PILLARS = [
  {
    title: "Expert Consultation",
    text: "Talk to qualified Ayurvedic doctors who look at your whole lifestyle, not just your symptoms.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Natural & Harmless Products",
    text: "Every product we recommend is natural, tested, and free from harmful shortcuts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 21C7 17 4.5 13 6 8c4 .5 7 2 8.5 5M12 21c1-5 4-9 8-11-1 6-3.5 9.5-8 11Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Guidance That Sticks",
    text: "Diet charts, workout plans, and supplement schedules built around your real life, not a generic template.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const STEPS = [
  {
    n: "1",
    title: "Consult",
    text: "Book a session with an expert who understands your situation.",
  },
  {
    n: "2",
    title: "Get Your Plan",
    text: "Receive a diet chart, workout schedule, and supplement plan tailored to you.",
  },
  {
    n: "3",
    title: "Stay Supported",
    text: "Follow up, track progress, and adjust as you go — we don't disappear after one session.",
  },
];

const TRUST = [
  "Consultations led by registered Ayurvedic doctors",
  "FSSAI-compliant, natural product sourcing",
  `${PLACEHOLDER_COUNT}+ people guided through lasting lifestyle change`,
];

export default async function HomePage() {
  const [experts, products, testimonials] = await Promise.all([
    getFeaturedExperts(3),
    getFeaturedProducts(4),
    getFeaturedTestimonials(6),
  ]);

  return (
    <>
      <DemoBanner />

      {/* HERO */}
      <section className="texture-dots relative overflow-hidden border-b border-sage/30">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-soft-cream blur-3xl"
          aria-hidden="true"
        />
        <div className="container-x relative py-14 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="eyebrow animate-rise-1">Consultations · Natural Products · Lifestyle Plans</p>
              {/* Wordmark-style wide tracking lives in the uppercase eyebrow;
                  the serif headline itself stays tight for readability */}
              <h1 className="mt-4 animate-rise-2 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-olive sm:text-6xl">
                Real experts. Natural solutions. Lasting lifestyle change.
              </h1>
              <p className="mt-6 animate-rise-3 text-lg leading-relaxed text-charcoal/75">
                We help you fix the root cause of your fitness, nutrition, and
                lifestyle problems — through expert consultation, natural and
                harmless products, and guidance that actually sticks.
              </p>
              <div className="mt-9 flex animate-rise-4 flex-col gap-3 sm:flex-row">
                <Link href="/experts" className="btn-primary !px-8 !py-4 !text-base">
                  Book a Consultation
                </Link>
                <Link href="#approach" className="btn-secondary !px-8 !py-4 !text-base">
                  Explore Our Approach
                </Link>
                <Link href="/shop" className="btn-secondary !px-8 !py-4 !text-base">
                  Shop Natural Products
                </Link>
              </div>
            </div>
            <GraphicBlock
              src="/graphics/hero.jpg"
              alt="Calm, natural wellness — Ayurvedic consultation and products"
              label="Hero image"
              className="animate-rise-3 aspect-[4/3] lg:aspect-[4/5]"
            />
          </div>
        </div>
      </section>

      {/* WHY WE'RE DIFFERENT */}
      <section id="approach" className="bg-soft-cream">
        <div className="container-x py-12 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="eyebrow">Why we&apos;re different</p>
              <h2 className="section-title mt-2">Guidance first. Products second.</h2>
              <p className="mt-4 leading-relaxed text-charcoal/75">
                Most wellness brands sell you a bottle and hope for the best. We
                start with a real conversation — understanding your body, your
                habits, and what&apos;s actually causing the problem. Every
                recommendation, every product, every plan comes after that
                understanding, not instead of it.
              </p>
            </div>
            <GraphicBlock
              src="/graphics/approach.jpg"
              alt="An expert listening and guiding during a wellness consultation"
              label="Approach image"
              className="aspect-[4/3]"
            />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft-cream text-olive" aria-hidden="true">
                  {p.icon}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-charcoal">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONDITIONS WE HELP WITH
          Compliance note: condition pages must describe SUPPORT and GUIDANCE
          for these conditions — never cures or treatment claims. Keep all
          language within FSSAI-permitted supplement wording. */}
      <section className="container-x py-12 sm:py-20">
        <p className="eyebrow">Conditions we help with</p>
        <h2 className="section-title mt-2 max-w-3xl">
          Whatever&apos;s holding you back, we&apos;ve likely helped someone through it.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONDITIONS.map((c) => (
            <Link
              key={c.slug}
              href={`/conditions/${c.slug}`}
              className="card group flex items-center justify-between gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="font-semibold text-charcoal group-hover:text-olive">{c.name}</span>
              <span className="text-olive" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-soft-cream">
        <div className="container-x py-12 sm:py-20">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2">Your path to lasting change</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-display text-6xl font-semibold text-olive/20">{s.n}</span>
                <h3 className="mt-2 font-display text-xl font-semibold text-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{s.text}</p>
              </div>
            ))}
          </div>
          <Link href="/experts" className="btn-primary mt-10">
            Book a Consultation
          </Link>
        </div>
      </section>

      {/* MEET OUR EXPERTS */}
      {experts.length > 0 && (
        <section className="container-x py-12 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Meet our experts</p>
              <h2 className="section-title mt-2">Qualified people, real guidance</h2>
            </div>
            <Link href="/experts" className="btn-secondary">See all experts</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {products.length > 0 && (
        <section className="bg-soft-cream">
          <div className="container-x py-12 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Natural products</p>
                <h2 className="section-title mt-2">Tested, natural, expert-picked</h2>
              </div>
              <Link href="/shop" className="btn-secondary">Shop all products</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="container-x py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t} className="card flex items-center gap-3 p-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft-cream text-success" aria-hidden="true">✓</span>
              <p className="text-sm font-semibold text-charcoal">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — real stories managed from /admin/testimonials.
          Until the client adds any, we show the "coming soon" state. */}
      {testimonials.length > 0 ? (
        <Testimonials items={testimonials} />
      ) : (
        <section className="bg-soft-cream">
          <div className="container-x py-12 sm:py-20">
            <p className="eyebrow">Testimonials</p>
            <h2 className="section-title mt-2">Real stories, coming soon</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="card p-6" aria-hidden="true">
                  <div className="h-4 w-10 rounded bg-sage/20" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-sage/20" />
                    <div className="h-3 w-11/12 rounded bg-sage/20" />
                    <div className="h-3 w-4/5 rounded bg-sage/20" />
                  </div>
                  <div className="mt-6 h-3 w-1/2 rounded bg-sage/30" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIFESTYLE BAND — full-width brand visual */}
      <section className="container-x py-4 sm:py-8">
        <GraphicBlock
          src="/graphics/lifestyle-band.jpg"
          alt="Natural ingredients and everyday wellness moments"
          label="Wide lifestyle banner"
          className="aspect-[16/9] sm:aspect-[21/9]"
        />
      </section>

      {/* CLOSING CTA */}
      <section className="container-x py-12 sm:py-16">
        <div className="overflow-hidden rounded-3xl bg-olive px-5 py-10 text-center text-cream sm:px-12 sm:py-14">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Your lifestyle change starts with one conversation.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/75">
            No pressure, no gimmicks — just real guidance from people who
            understand what you&apos;re going through.
          </p>
          <Link
            href="/experts"
            className="btn mt-8 bg-cream text-olive hover:-translate-y-0.5 hover:shadow-lift"
          >
            Book Your Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
