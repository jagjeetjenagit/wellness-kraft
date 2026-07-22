"use client";

import { Fragment, useEffect, useState } from "react";
import { formatDateTime, formatINR } from "@/lib/utils";

interface AdminBooking {
  id: string;
  title: string;
  expertName: string;
  startTime: string;
  status: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  amountPaid: number;
  prescription: string;
}

const badge: Record<string, string> = {
  CONFIRMED: "bg-soft-cream text-olive",
  CANCELLED: "bg-alert/10 text-alert",
  COMPLETED: "bg-olive text-white",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load bookings.");
        setBookings(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load bookings.");
      }
      setLoading(false);
    })();
  }, []);

  const startEdit = (b: AdminBooking) => {
    setEditing(b.id);
    setText(b.prescription);
  };

  async function savePrescription(id: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescription: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, prescription: text } : b))
      );
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
    setSaving(false);
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Bookings ({bookings.length})</h2>
      <p className="mt-2 max-w-2xl text-sm text-charcoal/75">
        Bookings appear here automatically once the Cal.com webhook is connected
        (README, &ldquo;Cal.com&rdquo; section). After a consultation, use
        &ldquo;Prescription&rdquo; to write the advice/plan — the customer sees it in
        their dashboard. Keep it to guidance and supplement advice only (no
        disease-cure claims).
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sage">
          No bookings recorded yet.
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-sage/30 text-xs uppercase tracking-wider text-sage/70">
              <tr>
                <th className="p-4">When</th>
                <th className="p-4">Consultation</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <Fragment key={b.id}>
                  <tr className="border-b border-sage/30/60 last:border-0">
                    <td className="p-4 font-semibold text-charcoal">{formatDateTime(b.startTime)}</td>
                    <td className="p-4">
                      <p className="text-charcoal">{b.title}</p>
                      {b.expertName && <p className="text-xs text-sage/70">with {b.expertName}</p>}
                    </td>
                    <td className="p-4 text-sage">
                      {b.attendeeName}
                      <br />
                      <span className="text-xs text-sage/70">
                        {b.attendeeEmail || b.attendeePhone}
                      </span>
                    </td>
                    <td className="p-4">
                      {b.amountPaid > 0 ? (
                        <span className="badge bg-success/10 text-success">
                          Paid {formatINR(b.amountPaid)}
                        </span>
                      ) : (
                        <span className="text-xs text-sage/70">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${badge[b.status] || "bg-soft-cream text-sage"}`}>
                        {b.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => (editing === b.id ? setEditing(null) : startEdit(b))}
                        className="font-semibold text-olive hover:underline"
                      >
                        {b.prescription ? "Edit prescription" : "Add prescription"}
                      </button>
                    </td>
                  </tr>
                  {editing === b.id && (
                    <tr className="border-b border-sage/30/60 bg-soft-cream/60">
                      <td colSpan={6} className="p-4">
                        <label className="label">
                          Prescription / advice for {b.attendeeName || "the customer"} (shown in
                          their dashboard)
                        </label>
                        <textarea
                          rows={5}
                          className="input resize-y"
                          placeholder={"e.g.\nDiet: ...\nSupplements: Ashwagandha KSM-66, 1 capsule after dinner\nFollow-up: in 3 weeks"}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                        <div className="mt-3 flex gap-3">
                          <button
                            onClick={() => savePrescription(b.id)}
                            disabled={saving}
                            className="btn-primary"
                          >
                            {saving ? "Saving…" : "Save prescription"}
                          </button>
                          <button onClick={() => setEditing(null)} className="btn-secondary">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
