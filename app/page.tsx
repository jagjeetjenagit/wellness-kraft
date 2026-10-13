import Link from "next/link";
import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import ExpertCard from "@/components/ExpertCard";
import ProductCard from "@/components/ProductCard";
import GraphicBlock from "@/components/GraphicBlock";
import Testimonials from "@/components/Testimonials";
import { ProductImage } from "@/components/Placeholder";
import { CONDITIONS } from "@/lib/conditions";
import {
  getFeaturedExperts,
  getFeaturedProducts,
  getFeaturedTestimonials,
  getProducts,
} from "@/lib/data";
import { formatINR } from "@/lib/utils";

// Always fresh so products added in /admin show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wellness Kraft — Natural Wellness Products, Delivered",
  description:
    "Shop natural, tested wellness products — supplements, protein and everyday health essentials — delivered across India. Expert-picked, free from harmful shortcuts.",
};

// Why shop with us — the product promise.
const PROMISES = [
  {
    title: "100% Natural",
    text: "Clean, natural ingredients — no harmful shortcuts or hidden nasties.",
    icon: "M12 21C7 17 4.5 13 6 8c4 .5 7 2 8.5 5M12 21c1-5 4-9 8-11-1 6-3.5 9.5-8 11Z",
  },
  {
    title: "Tested & FSSAI-compliant",
    text: "Every batch is tested, and sourcing follows FSSAI rules.",
    icon: "M9 12l2 2 4-4M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z",
  },
  {
    title: "Expert-picked",
    text: "Chosen by health and fitness experts — not by what's trending.",
    icon: "M12 3l2.5 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.5-.8L12 3Z",
  },
  {
    title: "Secure checkout",
    text: "Pay safely with UPI, cards or netbanking via Razorpay.",
    icon: "M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3",
  },
];

export default async function HomePage() {
  const [featured, allProducts, consultations, testimonials] = await Promise.all([
    getFeaturedProducts(8),
    getProducts(),
    getFeaturedExperts(2),
    getFeaturedTestimonials(6),
  ]);

  // Hero showcases real products; falls back to the hero photo if none
  // have images yet.
  const heroProducts = featured.filter((p) => p.images[0]).slice(0, 3);
  const categories = Array.from(new Set(allProducts.map((p) => p.category))).filter(Boolean);
  const startingPrice = allProducts.length
    ? Math.min(...allProducts.map((p) => p.price))
    : 0;

  return (
    <>
      <DemoBanner />

      {/* HERO — shop first */}
      <section className="texture-dots relative overflow-hidden border-b border-sage/30">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-soft-cream blur-3xl"
          aria-hidden="true"
        />
        <div className="container-x relative py-12 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <p className="eyebrow animate-rise-1">Natural wellness store</p>
              <h1 className="mt-4 animate-rise-2 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-olive sm:text-6xl">
                Natural products for everyday wellness.
              </h1>
              <p className="mt-6 animate-rise-3 text-lg leading-relaxed text-charcoal/75">
                Supplements, protein and health essentials made from clean,
                natural ingredients — tested, expert-picked and delivered to
                your door.
              </p>
              <div className="mt-9 flex animate-rise-4 flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="btn-primary !px-8 !py-4 !text-base">
                  Shop All Products
                </Link>
                <Link href="#bestsellers" className="btn-secondary !px-8 !py-4 !text-base">
                  See Bestsellers
                </Link>
              </div>
              {startingPrice > 0 && (
                <p className="mt-5 text-sm text-sage">
                  Products from <strong className="text-charcoal">{formatINR(startingPrice)}</strong> ·
                  Secure checkout
                </p>
              )}
            </div>

            {heroProducts.length > 0 ? (
              <div className="animate-rise-3 grid grid-cols-2 gap-4">
                {heroProducts.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className={`card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift ${
                      i === 0 ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""
                    }`}
                  >
                    <ProductImage
                      name={p.name}
                      image={p.images[0]}
                      className={`w-full ${i === 0 ? "aspect-square sm:h-full" : "aspect-square"}`}
                    />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-sm font-semibold text-charcoal group-hover:text-olive">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-olive">{formatINR(p.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <GraphicBlock
                src="/graphics/hero.jpg"
                alt="Natural wellness products"
                label="Hero image"
                className="animate-rise-3 aspect-[4/3] lg:aspect-[4/5]"
              />
            )}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      {categories.length > 1 && (
        <section className="container-x pt-10 sm:pt-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wider text-sage/70">Shop by category</span>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/shop?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-sage/30 bg-white px-4 py-2 text-sm font-semibold text-sage transition-colors hover:border-olive hover:text-olive"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BESTSELLERS */}
      {featured.length > 0 && (
        <section id="bestsellers" className="container-x scroll-mt-20 py-10 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Bestsellers</p>
              <h2 className="section-title mt-2">Tested, natural, expert-picked</h2>
            </div>
            <Link href="/shop" className="btn-secondary">Shop all products</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* WHY SHOP WITH US */}
      <section className="bg-soft-cream">
        <div className="container-x py-12 sm:py-16">
          <p className="eyebrow">Why Wellness Kraft</p>
          <h2 className="section-title mt-2">Products you can trust</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((p) => (
              <div key={p.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft-cream text-olive" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <path d={p.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CONCERN
          Compliance note: condition pages describe SUPPORT and GUIDANCE —
          never cures or treatment claims (FSSAI supplement wording). */}
      <section className="container-x py-12 sm:py-16">
        <p className="eyebrow">Shop by concern</p>
        <h2 className="section-title mt-2 max-w-3xl">Find what supports your goal</h2>
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

      {/* TESTIMONIALS — only when the client has added real ones */}
      {testimonials.length > 0 && <Testimonials items={testimonials} />}

      {/* CONSULTATIONS — secondary: help choosing the right products */}
      {consultations.length > 0 && (
        <section className="bg-soft-cream">
          <div className="container-x py-12 sm:py-16">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr,1.4fr]">
              <div>
                <p className="eyebrow">Need help choosing?</p>
                <h2 className="section-title mt-2">Talk to us 1-on-1</h2>
                <p className="mt-4 leading-relaxed text-charcoal/75">
                  Not sure which product is right for you? Book a quick health
                  or fitness consultation and get a plan — and product advice —
                  built around your goals.
                </p>
                <Link href="/experts" className="btn-secondary mt-6">
                  View consultations
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {consultations.map((e) => (
                  <ExpertCard key={e.id} expert={e} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LIFESTYLE BAND — full-width brand visual */}
      <section className="container-x py-6 sm:py-10">
        <GraphicBlock
          src="/graphics/lifestyle-band.jpg"
          alt="Natural ingredients and everyday wellness moments"
          label="Wide lifestyle banner"
          className="aspect-[16/9] sm:aspect-[21/9]"
        />
      </section>

      {/* CLOSING CTA */}
      <section className="container-x pb-12 sm:pb-16">
        <div className="overflow-hidden rounded-3xl bg-olive px-5 py-10 text-center text-cream sm:px-12 sm:py-14">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Start your wellness routine today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/75">
            Natural, tested products — delivered to your door.
          </p>
          <Link
            href="/shop"
            className="btn mt-8 bg-cream text-olive hover:-translate-y-0.5 hover:shadow-lift"
          >
            Shop All Products
          </Link>
        </div>
      </section>
    </>
  );
}
