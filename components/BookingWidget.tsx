"use client";

import { useState } from "react";
import Cal from "@calcom/embed-react";
import Link from "next/link";
import Script from "next/script";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// Inline Cal.com scheduler with an optional payment step.
//
// Flow when the expert has a fee and Razorpay is configured:
//   1. visitor enters name/email/phone and pays the fee
//   2. calendar unlocks and they pick their slot
//   3. the Cal.com webhook later links the payment to the booking
//      (matched on email), so it shows as "Paid" in dashboards.
//
// Graceful degradation: without Razorpay keys the calendar opens
// directly and the fee is shown as payable at the session; without a
// Cal link a contact fallback is shown.
export default function BookingWidget({
  calLink,
  expertName,
  expertId = null,
  fee = 0,
}: {
  calLink: string;
  expertName: string;
  expertId?: string | null;
  fee?: number;
}) {
  const payEnabled = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && fee > 0;
  const [paid, setPaid] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "paying" | "verifying">("idle");
  const [error, setError] = useState("");

  if (!calLink) {
    return (
      <div className="card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">
          Online booking coming soon for {expertName}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/75">
          This expert&apos;s calendar isn&apos;t connected yet. Send us a message and
          we&apos;ll arrange your consultation personally.
        </p>
        <Link href="/contact" className="btn-primary mt-6">
          Request a booking
        </Link>
      </div>
    );
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("paying");
    try {
      const res = await fetch("/api/razorpay/consult-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId, customer: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the payment. Please try again.");
      if (!window.Razorpay) {
        throw new Error("The payment window could not load. Check your internet connection and try again.");
      }
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Wellness Kraft",
        description: `Consultation — ${expertName}`,
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#334720" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");
          const verifyRes = await fetch("/api/razorpay/consult-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setPaid(true);
          } else {
            setStatus("idle");
            setError(
              verifyData.error ||
                "We couldn't verify the payment. If money was deducted it will be auto-refunded — or contact us."
            );
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      });
      rzp.open();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  // Payment gate before the calendar
  if (payEnabled && !paid) {
    return (
      <div className="card p-6 sm:p-8">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Book with {expertName}</h3>
          <p className="text-lg font-bold text-olive">
            {formatINR(fee)} <span className="text-sm font-normal text-sage">/ session</span>
          </p>
        </div>
        <p className="mt-2 text-sm text-charcoal/75">
          Pay the consultation fee to unlock the calendar and pick a time that
          suits you. Use the same email here and while booking, so your payment
          links to your appointment automatically.
        </p>
        <form onSubmit={handlePay} className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="bw-name" className="label">Full name</label>
            <input
              id="bw-name"
              className="input"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="bw-email" className="label">Email</label>
            <input
              id="bw-email"
              type="email"
              className="input"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="bw-phone" className="label">Phone</label>
            <input
              id="bw-phone"
              type="tel"
              className="input"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          {error && (
            <p className="rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert sm:col-span-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status !== "idle"}
            className="btn-primary sm:col-span-3"
          >
            {status === "paying"
              ? "Opening secure payment…"
              : status === "verifying"
                ? "Confirming your payment…"
                : `Pay ${formatINR(fee)} & choose a time`}
          </button>
          <p className="text-center text-xs text-sage/70 sm:col-span-3">
            Payments are handled by Razorpay. We never see or store your card details.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div>
      {paid && (
        <p className="mb-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">
          ✓ Payment received — now pick a time that works for you.
        </p>
      )}
      {!payEnabled && fee > 0 && (
        <p className="mb-4 rounded-xl border border-sage/30 bg-soft-cream p-3 text-sm font-semibold text-charcoal/75">
          Consultation fee: {formatINR(fee)} — payable at your session.
        </p>
      )}
      <div className="card overflow-hidden p-2 sm:p-4">
        <Cal
          calLink={calLink}
          style={{ width: "100%", height: "100%", minHeight: "620px", overflow: "auto" }}
          config={{ theme: "light", layout: "month_view" }}
        />
      </div>
    </div>
  );
}
