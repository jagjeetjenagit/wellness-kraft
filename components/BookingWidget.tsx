"use client";

import { useState, useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";
import Link from "next/link";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (resp: { error?: { description?: string } }) => void) => void;
    };
  }
}

// Inline Cal.com scheduler with an optional payment step.
//
// Booking requires the visitor to be signed in (when login is configured).
// Once signed in we already have their name + email from Google, so we
// never re-ask those. Google can't give us a phone number, so we collect
// it once at the first booking and save it to their account for next time.
//
// Graceful degradation: if login isn't configured at all, the old
// name/email/phone form is used so the site still works. Without Razorpay
// the calendar opens directly; without a Cal link a contact fallback shows.
export default function BookingWidget({
  calLink,
  expertName,
  expertId = null,
  fee = 0,
  authEnabled = false,
  signedIn = false,
  userName = "",
  userEmail = "",
  savedPhone = "",
  alreadyPaid = false,
}: {
  calLink: string;
  expertName: string;
  expertId?: string | null;
  fee?: number;
  authEnabled?: boolean;
  signedIn?: boolean;
  userName?: string;
  userEmail?: string;
  savedPhone?: string;
  alreadyPaid?: boolean;
}) {
  const payEnabled = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && fee > 0;
  const [paid, setPaid] = useState(false);
  const [status, setStatus] = useState<"idle" | "paying" | "verifying">("idle");
  const [error, setError] = useState("");

  // Legacy path only (login not configured): full name/email/phone form.
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // Signed-in path: name/email come from Google; phone is collected once.
  const [phone, setPhone] = useState(savedPhone);
  const [editingPhone, setEditingPhone] = useState(!savedPhone);
  const [ready, setReady] = useState(!!savedPhone); // free consults: show calendar?

  const firstName = userName.split(" ")[0] || "there";

  // Keep the latest booking context available to the Cal event callback,
  // which we subscribe to only once.
  const ctx = useRef({ userName, userEmail, phone, expertId, expertName });
  ctx.current = { userName, userEmail, phone, expertId, expertName };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi();
        if (cancelled) return;
        cal("ui", { theme: "light", styles: { branding: { brandColor: "#334720" } } });
        // Fires when the customer finishes booking a slot in the popup — we
        // record it in our own DB right away (no Cal webhook required).
        cal("on", {
          action: "bookingSuccessful",
          callback: (e: { detail?: { data?: Record<string, unknown> } }) => {
            const data = (e?.detail?.data ?? {}) as Record<string, unknown>;
            const bk = ((data.booking as Record<string, unknown>) ?? data) as Record<string, unknown>;
            const startTime = (bk.startTime ?? data.date ?? data.startTime ?? null) as string | null;
            const uid = (bk.uid ?? data.uid ?? "") as string;
            const c = ctx.current;
            fetch("/api/consult/booked", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid,
                startTime,
                title: (bk.title as string) || `Consultation — ${c.expertName}`,
                name: c.userName,
                email: c.userEmail,
                phone: c.phone,
                expertId: c.expertId,
                expertName: c.expertName,
              }),
            }).catch(() => {});
          },
        });
      } catch {
        // Embed API not ready — the Cal webhook (if set up) still records bookings.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // ---- Sign-in required before booking ----
  if (authEnabled && !signedIn) {
    return (
      <div className="card p-6 text-center sm:p-8">
        <h3 className="font-display text-xl font-semibold">
          Sign in to book with {expertName}
        </h3>
        {fee > 0 && (
          <p className="mt-2 text-lg font-bold text-olive">
            {formatINR(fee)} <span className="text-sm font-normal text-sage">/ session</span>
          </p>
        )}
        <p className="mx-auto mt-3 max-w-sm text-sm text-charcoal/75">
          Booking and payment are linked to your account, so your consultations,
          updates and prescriptions all live in one place.
        </p>
        <button
          type="button"
          onClick={() =>
            signIn("google", {
              callbackUrl:
                typeof window !== "undefined" ? window.location.href : "/dashboard",
            })
          }
          className="mx-auto mt-6 flex w-full max-w-xs items-center justify-center gap-3 rounded-xl border border-sage/40 bg-white px-5 py-3.5 text-sm font-semibold text-charcoal shadow-sm transition-colors hover:bg-soft-cream"
        >
          <GoogleIcon />
          Sign in with Google to continue
        </button>
      </div>
    );
  }

  async function savePhone(p: string) {
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });
    } catch {
      // Non-fatal: booking can still proceed with the phone for this session.
    }
  }

  async function handlePay(customer: { name: string; email: string; phone: string }) {
    setError("");
    setStatus("paying");
    try {
      const res = await fetch("/api/razorpay/consult-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId, customer }),
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
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
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
      rzp.on("payment.failed", (resp) => {
        setStatus("idle");
        fetch("/api/razorpay/failed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_order_id: data.razorpayOrderId }),
        }).catch(() => {});
        setError(
          resp?.error?.description ||
            "Payment failed. No money was deducted. Please try another payment method."
        );
      });
      rzp.open();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  // ---- Paid consultation: pay before the calendar unlocks ----
  // Skip payment entirely if they've already paid for this expert.
  if (payEnabled && !paid && !alreadyPaid) {
    // Streamlined flow for signed-in customers (no name/email re-entry).
    if (authEnabled && signedIn) {
      const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const p = phone.trim();
        if (!p) {
          setError("Please add a phone number so we can send booking updates.");
          return;
        }
        if (editingPhone) {
          await savePhone(p);
          setEditingPhone(false);
        }
        await handlePay({ name: userName, email: userEmail, phone: p });
      };
      return (
        <div className="card p-6 sm:p-8">
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-semibold">Book with {expertName}</h3>
            <p className="text-lg font-bold text-olive">
              {formatINR(fee)} <span className="text-sm font-normal text-sage">/ session</span>
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-sage/30 bg-soft-cream p-4 text-sm">
            <p className="font-semibold text-charcoal">Booking as {userName}</p>
            <p className="text-charcoal/70">{userEmail}</p>
          </div>

          <form onSubmit={onSubmit} className="mt-4 grid gap-4">
            {editingPhone ? (
              <div>
                <label htmlFor="bw-phone" className="label">
                  Phone number{" "}
                  <span className="font-normal text-sage/80">(for booking updates)</span>
                </label>
                <input
                  id="bw-phone"
                  type="tel"
                  className="input"
                  required
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-charcoal/75">
                <span className="font-semibold text-charcoal">Phone:</span> {phone}
                <button
                  type="button"
                  onClick={() => setEditingPhone(true)}
                  className="font-semibold text-olive hover:underline"
                >
                  Edit
                </button>
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={status !== "idle"} className="btn-primary">
              {status === "paying"
                ? "Opening secure payment…"
                : status === "verifying"
                  ? "Confirming your payment…"
                  : `Pay ${formatINR(fee)} & choose a time`}
            </button>
            <p className="text-center text-xs text-sage/70">
              Payments are handled by Razorpay. We never see or store your card details.
            </p>
          </form>
        </div>
      );
    }

    // Legacy flow (login not configured): full form so the site still works.
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePay(form);
          }}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
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
          <button type="submit" disabled={status !== "idle"} className="btn-primary sm:col-span-3">
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

  // ---- Free consultation, signed in, no phone yet: ask once, then calendar ----
  if (authEnabled && signedIn && !payEnabled && !ready) {
    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const p = phone.trim();
      if (!p) {
        setError("Please add a phone number so we can send booking updates.");
        return;
      }
      await savePhone(p);
      setReady(true);
    };
    return (
      <div className="card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold">Almost there, {firstName} 👋</h3>
        <p className="mt-2 text-sm text-charcoal/75">
          We&apos;ll book your consultation as <strong>{userName}</strong> ({userEmail}).
          Just add a phone number so we can send you booking updates.
        </p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-4">
          <div>
            <label htmlFor="bw-phone-free" className="label">Phone number</label>
            <input
              id="bw-phone-free"
              type="tel"
              className="input"
              required
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary">Continue to calendar</button>
        </form>
      </div>
    );
  }

  // ---- Calendar ----
  return (
    <div>
      {(paid || alreadyPaid) && (
        <p className="mb-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">
          ✓ Payment received — now pick a time that works for you.
        </p>
      )}
      {!payEnabled && fee > 0 && (
        <p className="mb-4 rounded-xl border border-sage/30 bg-soft-cream p-3 text-sm font-semibold text-charcoal/75">
          Consultation fee: {formatINR(fee)} — payable at your session.
        </p>
      )}
      {/* Popup calendar: opens in a clean overlay (no page scrolling), greys
          out unavailable slots, and attaches a private Google Meet link when
          the expert's Cal event location is set to Google Meet. */}
      <div className="card p-6 text-center sm:p-8">
        <h3 className="font-display text-xl font-semibold">Pick your date &amp; time</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal/75">
          Choose a slot that suits you — unavailable times are greyed out. You&apos;ll get a
          confirmation with a private Google Meet link by email.
        </p>
        <button
          type="button"
          data-cal-link={calLink}
          data-cal-config={JSON.stringify({
            layout: "month_view",
            theme: "light",
            ...(signedIn ? { name: userName, email: userEmail } : {}),
          })}
          className="btn-primary mt-5"
        >
          Choose date &amp; time
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84c.86-2.6 3.29-4.51 6.15-4.51Z" />
    </svg>
  );
}
