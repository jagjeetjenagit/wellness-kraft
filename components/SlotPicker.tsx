"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import JoinCall from "@/components/JoinCall";

function fullWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

interface Slot {
  iso: string;
  time: string;
  taken: boolean;
}
interface Group {
  date: string;
  label: string;
  slots: Slot[];
}

// Native date + time-slot picker. Loads availability, lets the customer pick
// a free slot (taken ones greyed out), books it in our DB, and shows the
// private video link — all on-page, no popup or redirect.
export default function SlotPicker({
  expertId = null,
  expertName,
}: {
  expertId?: string | null;
  expertName: string;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ meetUrl: string; startTime: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/consult/slots?expertId=${expertId || ""}`);
      const data = await res.json();
      const g: Group[] = data.groups || [];
      setGroups(g);
      setActive((prev) => (g.some((x) => x.date === prev) ? prev : g[0]?.date || ""));
    } catch {
      setError("Couldn't load available times. Please refresh.");
    }
    setLoading(false);
  }, [expertId]);

  useEffect(() => {
    load();
  }, [load]);

  async function book(iso: string) {
    setBusy(iso);
    setError("");
    try {
      const res = await fetch("/api/consult/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId, expertName, startTime: iso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not book that slot.");
        if (res.status === 409) load(); // slot taken — refresh availability
        setBusy(null);
        return;
      }
      setDone({ meetUrl: data.meetUrl, startTime: data.startTime });
      setTimeout(() => router.refresh(), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(null);
    }
  }

  if (done) {
    return (
      <div className="card p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
          ✓
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold">Your consultation is booked!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal/75">
          Scheduled for
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-olive">
          {fullWhen(done.startTime)}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-charcoal/75">
          You&apos;ll find this under <strong>My consultations</strong>. Your private video link
          becomes active <strong>10 minutes before</strong> your appointment:
        </p>
        <div className="mt-2 flex justify-center">
          <JoinCall startTime={done.startTime} meetUrl={done.meetUrl} />
        </div>
      </div>
    );
  }

  const current = groups.find((g) => g.date === active);

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold">Pick your date &amp; time</h3>
      <p className="mt-1 text-sm text-charcoal/75">
        Choose a slot that suits you. Greyed-out times are already taken.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-sage">Loading available times…</p>
      ) : groups.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal/75">
          No open slots in the next two weeks. Please{" "}
          <a href="/contact" className="font-semibold text-olive underline">contact us</a> to arrange a time.
        </p>
      ) : (
        <>
          {/* Date selector */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {groups.map((g) => {
              const free = g.slots.some((s) => !s.taken);
              return (
                <button
                  key={g.date}
                  type="button"
                  onClick={() => setActive(g.date)}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    active === g.date
                      ? "border-olive bg-olive text-cream"
                      : "border-sage/30 bg-white text-sage hover:border-olive"
                  } ${!free ? "opacity-50" : ""}`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {current?.slots.map((s) => (
              <button
                key={s.iso}
                type="button"
                disabled={s.taken || busy !== null}
                onClick={() => book(s.iso)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  s.taken
                    ? "cursor-not-allowed border-sage/20 bg-soft-cream text-sage/40 line-through"
                    : "border-sage/40 bg-white text-charcoal hover:border-olive hover:bg-soft-cream"
                } ${busy === s.iso ? "opacity-60" : ""}`}
              >
                {busy === s.iso ? "Booking…" : s.time}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
