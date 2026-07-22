import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedExperts, getFeaturedProducts } from "@/lib/data";
import ExpertCard from "@/components/ExpertCard";
import ProductCard from "@/components/ProductCard";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wellness Kraft — Book Verified Health Experts & Shop Tested Wellness Products",
  description:
    "1-on-1 consultations with verified nutritionists, Ayurveda physicians, dermatologists and more. Shop medically-tested wellness products with secure checkout.",
};

const TRUST = [
  { title: "Verified credentials", text: "Every expert's qualifications are checked before they appear here." },
  { title: "Batch-tested products", text: "Our own wellness range, tested for purity and labelled honestly." },
  { title: "Secure payments", text: "Cards, UPI and netbanking via Razorpay. We never store card details." },
];

const STEPS = [
  { n: "1", title: "Choose your expert", text: "Browse specialists by field, credentials and reviews — nutrition, Ayurveda, skin, sleep and more." },
  { n: "2", title: "Book a time that suits you", text: "Pick a slot right on their profile. You'll get an instant confirmation and calendar invite." },
  { n: "3", title: "Get a plan — and what you need", text: "Leave with clear guidance, plus tested products your expert genuinely recommends." },
];

export default async function HomePage() {
  const [experts, products] = await Promise.all([
    getFeaturedExperts(3),
    getFeaturedProducts(4),
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
        <div className="container-x relative py-14 sm:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow animate-rise-1">Consultations · Wellness Store</p>
            <h1 className="mt-4 animate-rise-2 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-charcoal sm:text-6xl">
              Feel better, with an expert{" "}
              <em className="text-olive">actually in your corner.</em>
            </h1>
            <p className="mt-6 max-w-xl animate-rise-3 text-lg leading-relaxed text-sage">
              Book 1-on-1 consultations with verified health professionals, and
              shop our own medically-tested wellness products — recommended only
              when you truly need them.
            </p>
            <div className="mt-9 flex animate-rise-4 flex-col gap-3 sm:flex-row">
              <Link href="/experts" className="btn-primary !px-8 !py-4 !text-base">
                Book a Consultation
              </Link>
              <Link href="/shop" className="btn-secondary !px-8 !py-4 !text-base">
                Shop Wellness Products
              </Link>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title} className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-charcoal">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-soft-cream text-olive" aria-hidden="true">✓</span>
                  {t.title}
                </p>
                <p className="mt-1.5 text-sm text-sage">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EXPERTS */}
      <section className="container-x py-12 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Meet the experts</p>
            <h2 className="section-title mt-2">Guidance you can trust</h2>
          </div>
          <Link href="/experts" className="btn-ghost">
            View all experts →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-soft-cream">
        <div className="container-x py-12 sm:py-20">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2">Three simple steps</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-display text-6xl font-semibold text-olive/20">{s.n}</span>
                <h3 className="mt-2 font-display text-xl font-semibold text-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sage">{s.text}</p>
              </div>
            ))}
          </div>
          <Link href="/experts" className="btn-primary mt-10">
            Find your expert
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-x py-12 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From our store</p>
            <h2 className="section-title mt-2">Tested. Labelled honestly.</h2>
          </div>
          <Link href="/shop" className="btn-ghost">
            Browse the shop →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="container-x pb-4">
        <div className="overflow-hidden rounded-3xl bg-olive px-5 py-10 text-center text-white sm:px-12 sm:py-14">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Book a consultation — your expert will tell you honestly what you
            need, and just as importantly, what you don&apos;t.
          </p>
          <Link
            href="/experts"
            className="btn mt-8 bg-white text-olive hover:-translate-y-0.5 hover:shadow-lift"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
