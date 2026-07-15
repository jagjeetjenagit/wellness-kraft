import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions about consultations, orders or products? Send us a message — we usually reply within one working day.",
};

export default function ContactPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr,1.2fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="section-title mt-2">We&apos;re happy to help</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Questions about a consultation, an order, or which expert is right
            for you? Send us a message and a real person will reply — usually
            within one working day.
          </p>

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="font-bold uppercase tracking-wider text-ink-faint">Consultations</dt>
              <dd className="mt-1 text-ink-soft">
                Fastest way:{" "}
                <Link href="/experts" className="font-semibold text-pine hover:underline">
                  book directly on an expert&apos;s calendar
                </Link>
                . Need to reschedule? Use the link in your confirmation email.
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-ink-faint">Orders</dt>
              <dd className="mt-1 text-ink-soft">
                Track any order from{" "}
                <Link href="/dashboard" className="font-semibold text-pine hover:underline">
                  your dashboard
                </Link>
                . For delivery issues, message us with your order number.
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-ink-faint">Hours</dt>
              <dd className="mt-1 text-ink-soft">Monday–Saturday, 10:00–18:00 IST</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
