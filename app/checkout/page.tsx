"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/components/cart/CartProvider";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const FIELDS = [
  { name: "name", label: "Full name", type: "text", placeholder: "e.g. Anita Desai", required: true, span: 2 },
  { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 98123 45678", required: true, span: 1 },
  { name: "email", label: "Email (for your receipt)", type: "email", placeholder: "you@example.com", required: true, span: 1 },
  { name: "address1", label: "Address line 1", type: "text", placeholder: "House / flat, street", required: true, span: 2 },
  { name: "address2", label: "Address line 2 (optional)", type: "text", placeholder: "Landmark, area", required: false, span: 2 },
  { name: "city", label: "City", type: "text", placeholder: "e.g. Pune", required: true, span: 1 },
  { name: "state", label: "State", type: "text", placeholder: "e.g. Maharashtra", required: true, span: 1 },
  { name: "pincode", label: "PIN code", type: "text", placeholder: "e.g. 411001", required: true, span: 1 },
] as const;

// Autofill hints so mobile browsers can fill the address in one tap.
const AUTOCOMPLETE: Record<string, string> = {
  name: "name",
  phone: "tel",
  email: "email",
  address1: "address-line1",
  address2: "address-line2",
  city: "address-level2",
  state: "address-level1",
  pincode: "postal-code",
};

export default function CheckoutPage() {
  const { items, total, clearCart, ready } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "paying" | "verifying">("idle");
  const [error, setError] = useState("");

  if (!ready) {
    return <div className="container-x py-24 text-center text-sage">Loading…</div>;
  }

  if (items.length === 0 && status !== "verifying") {
    return (
      <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="section-title">Nothing to check out yet</h1>
        <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
      </div>
    );
  }

  const handleChange = (name: string, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("paying");

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not start the payment. Please try again.");
      }

      if (!window.Razorpay) {
        throw new Error(
          "The payment window could not load. Check your internet connection and try again."
        );
      }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Wellness Kraft",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#334720" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            clearCart();
            router.push(`/checkout/success?order=${verifyData.orderId}`);
          } else {
            setStatus("idle");
            setError(
              verifyData.error ||
                "We couldn't verify the payment. If money was deducted it will be auto-refunded by your bank — or contact us."
            );
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });
      rzp.open();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <p className="eyebrow">Checkout</p>
      <h1 className="section-title mt-2">Where should we deliver?</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,360px]">
        <form onSubmit={handlePay} className="card grid gap-4 p-6 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
              <label htmlFor={f.name} className="label">
                {f.label}
              </label>
              <input
                id={f.name}
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                value={form[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="input"
                pattern={f.name === "pincode" ? "[0-9]{6}" : undefined}
                title={f.name === "pincode" ? "6-digit PIN code" : undefined}
                inputMode={f.name === "pincode" ? "numeric" : undefined}
                autoComplete={AUTOCOMPLETE[f.name]}
              />
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-alert/30 bg-alert/10 p-4 text-sm font-semibold text-alert sm:col-span-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status !== "idle"}
            className="btn-primary mt-2 w-full !py-4 !text-base sm:col-span-2"
          >
            {status === "paying"
              ? "Opening secure payment…"
              : status === "verifying"
                ? "Confirming your payment…"
                : `Pay ${formatINR(total)} securely`}
          </button>
          <p className="text-center text-xs text-sage/70 sm:col-span-2">
            Payments are handled by Razorpay. We never see or store your card details.
          </p>
        </form>

        <aside className="card h-fit p-6">
          <h2 className="font-display text-xl font-semibold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-sage">
                  {i.name} <span className="text-sage/70">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-sage/30 pt-4 font-bold">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
