"use client";

import { useState } from "react";

const DAYS = [
  { n: 1, l: "Mon" },
  { n: 2, l: "Tue" },
  { n: 3, l: "Wed" },
  { n: 4, l: "Thu" },
  { n: 5, l: "Fri" },
  { n: 6, l: "Sat" },
  { n: 0, l: "Sun" },
];

const hourLabel = (h: number) => {
  const ampm = h < 12 ? "am" : "pm";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${ampm}`;
};
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 am … 10 pm

// Lets an expert set their own bookable days/hours; feeds the native slot picker.
export default function StudioAvailability({
  initial,
}: {
  initial: { days: number[]; startHour: number; endHour: number; slotMins: number };
}) {
  const [days, setDays] = useState<number[]>(initial.days);
  const [startHour, setStartHour] = useState(initial.startHour);
  const [endHour, setEndHour] = useState(initial.endHour);
  const [slotMins, setSlotMins] = useState(initial.slotMins);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (n: number) => {
    setSaved(false);
    setDays((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    if (endHour <= startHour) {
      setError("End time must be after start time.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/studio/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, startHour, endHour, slotMins }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Could not save.");
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
    setSaving(false);
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">Your availability</h2>
      <p className="mt-1 text-sm text-charcoal/75">
        Customers can only book you within these days and hours (India time).
      </p>

      <p className="label mt-5">Available days</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d.n}
            type="button"
            onClick={() => toggleDay(d.n)}
            className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              days.includes(d.n)
                ? "border-olive bg-olive text-cream"
                : "border-sage/30 bg-white text-sage hover:border-olive"
            }`}
          >
            {d.l}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">From</label>
          <select
            className="input"
            value={startHour}
            onChange={(e) => {
              setStartHour(Number(e.target.value));
              setSaved(false);
            }}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{hourLabel(h)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">To</label>
          <select
            className="input"
            value={endHour}
            onChange={(e) => {
              setEndHour(Number(e.target.value));
              setSaved(false);
            }}
          >
            {HOURS.concat([23]).map((h) => (
              <option key={h} value={h}>{hourLabel(h)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Slot length</label>
          <select
            className="input"
            value={slotMins}
            onChange={(e) => {
              setSlotMins(Number(e.target.value));
              setSaved(false);
            }}
          >
            {[15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-alert">{error}</p>}
      {saved && <p className="mt-3 text-sm font-semibold text-success">Availability saved ✓</p>}
      <button type="button" onClick={save} disabled={saving} className="btn-primary mt-4">
        {saving ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}
