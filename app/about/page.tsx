import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Why Veda Wellness exists: verified experts, honestly-labelled wellness products, and advice you can act on.",
};

const VALUES = [
  {
    title: "Experts first, always",
    text: "Products never replace guidance. Our consultants recommend a product only when it genuinely helps your plan — and they'll tell you when you don't need one.",
  },
  {
    title: "Tested, not just claimed",
    text: "Every batch of our own product range is third-party tested for purity and heavy metals. What's on the label is what's in the bottle.",
  },
  {
    title: "Honest by default",
    text: "Clear pricing, real credentials, no miracle claims. Wellness is gradual work, and we treat you like an adult about it.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">About us</p>
        <h1 className="section-title mt-2">
          Good health advice shouldn&apos;t be this hard to find.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Veda Wellness started with a simple frustration: it&apos;s easier to buy a
          supplement than to find out whether you actually need it. So we built
          both halves of the answer — verified experts you can talk to in
          minutes, and a small range of medically-tested products they trust.
        </p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Every expert on this platform has had their credentials verified.
          Every product in our store is our own, batch-tested, and labelled
          honestly. And the two work together: after a consultation, your
          expert recommends only what fits your plan.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="card p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-pine-mist p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Start with a conversation
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-ink-soft">
          Fifteen minutes with the right expert saves months of guesswork.
        </p>
        <Link href="/experts" className="btn-primary mt-6">
          Book a Consultation
        </Link>
      </div>
    </div>
  );
}
