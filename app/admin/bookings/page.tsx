"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface AdminBooking {
  id: string;
  title: string;
  expertName: string;
  startTime: string;
  status: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
}

const badge: Record<string, string> = {
  CONFIRMED: "bg-pine-light text-pine",
  CANCELLED: "bg-clay-light text-clay",
  COMPLETED: "bg-pine text-white",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Bookings ({bookings.length})</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Bookings appear here automatically once the Cal.com webhook is connected
        (README, &ldquo;Cal.com&rdquo; section). You can always see every booking in your
        Cal.com dashboard too.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-clay/30 bg-clay-light p-3 text-sm font-semibold text-clay">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-ink-soft">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">
          No bookings recorded yet.
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-sand text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="p-4">When</th>
                <th className="p-4">Consultation</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-sand/60 last:border-0">
                  <td className="p-4 font-semibold text-ink">{formatDateTime(b.startTime)}</td>
                  <td className="p-4">
                    <p className="text-ink">{b.title}</p>
                    {b.expertName && <p className="text-xs text-ink-faint">with {b.expertName}</p>}
                  </td>
                  <td className="p-4 text-ink-soft">
                    {b.attendeeName}
                    <br />
                    <span className="text-xs text-ink-faint">
                      {b.attendeeEmail || b.attendeePhone}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${badge[b.status] || "bg-cream text-ink-soft"}`}>
                      {b.status.toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
