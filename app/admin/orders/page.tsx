"use client";

import { useEffect, useState, useCallback } from "react";
import { formatINR, formatDateTime } from "@/lib/utils";

interface AdminOrder {
  id: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  razorpayPaymentId: string | null;
  shipName: string;
  shipPhone: string;
  shipEmail: string;
  shipAddress1: string;
  shipAddress2: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number }[];
}

const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const payBadge: Record<string, string> = {
  PAID: "bg-success/10 text-success",
  PENDING: "bg-sage/15 text-sage",
  FAILED: "bg-alert/10 text-alert",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load orders.");
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, fulfillmentStatus: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not update the order.");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillmentStatus } : o)));
  }

  const filtered =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.fulfillmentStatus === filter && o.paymentStatus === "PAID");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold">Orders ({orders.length})</h2>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors sm:py-1.5 ${
                filter === s
                  ? "border-olive bg-olive text-white"
                  : "border-sage/30 bg-white text-sage hover:border-olive hover:text-olive"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sage">
          {orders.length === 0
            ? "No orders yet. Once customers pay, orders appear here automatically."
            : "No orders with this status."}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-charcoal">
                    {o.shipName}
                    <span className="ml-2 text-xs font-normal text-sage/70">
                      #{o.id.slice(-8).toUpperCase()} · {formatDateTime(o.createdAt)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-sage">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${payBadge[o.paymentStatus] || "bg-soft-cream text-sage"}`}>
                    {o.paymentStatus.toLowerCase()}
                  </span>
                  <span className="font-bold">{formatINR(o.total)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sage/30 pt-4">
                <div className="flex items-center gap-2">
                  <label htmlFor={`status-${o.id}`} className="text-xs font-bold uppercase tracking-wider text-sage/70">
                    Delivery status
                  </label>
                  <select
                    id={`status-${o.id}`}
                    value={o.fulfillmentStatus}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={o.paymentStatus !== "PAID"}
                    className="input !w-auto !py-1.5 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  className="-m-2 p-2 text-sm font-semibold text-olive hover:underline sm:m-0 sm:p-0"
                >
                  {expanded === o.id ? "Hide details" : "Delivery address & details"}
                </button>
              </div>

              {expanded === o.id && (
                <div className="mt-4 grid gap-4 rounded-xl bg-cream p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-sage/70">Ship to</p>
                    <p className="mt-1 text-sage">
                      {o.shipName}
                      <br />
                      {o.shipAddress1}
                      {o.shipAddress2 && <><br />{o.shipAddress2}</>}
                      <br />
                      {o.shipCity}, {o.shipState} — {o.shipPincode}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wider text-sage/70">Contact & payment</p>
                    <p className="mt-1 text-sage">
                      {o.shipPhone}
                      <br />
                      {o.shipEmail}
                      <br />
                      {o.razorpayPaymentId ? `Razorpay: ${o.razorpayPaymentId}` : "Payment not completed"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
