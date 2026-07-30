"use client";

import { useState } from "react";

// Lets an expert write / edit the prescription & advice for one of their
// bookings, straight from the Expert Studio. Saved via /api/studio/prescription
// (server verifies the booking belongs to the signed-in expert). The customer
// sees it in their dashboard consultation history.
export default function StudioPrescription({
  bookingId,
  initial,
}: {
  bookingId: string;
  initial: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/studio/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, prescription: text }),
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-semibold text-olive hover:underline"
      >
        {initial ? "Edit prescription & advice" : "+ Add prescription & advice"}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-sage/30 bg-soft-cream p-4">
      <label className="label">Prescription &amp; advice (shown to the customer)</label>
      <textarea
        rows={6}
        className="input resize-y"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        placeholder={"Summary: ...\nDiet: ...\nSupplements: ...\nFollow-up: in 3 weeks"}
      />
      <p className="mt-1 text-xs text-sage/70">
        Keep to guidance and supplement advice only — no disease-cure claims.
      </p>
      {error && <p className="mt-2 text-sm font-semibold text-alert">{error}</p>}
      {saved && <p className="mt-2 text-sm font-semibold text-success">Saved ✓</p>}
      <div className="mt-3 flex gap-3">
        <button type="button" onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
}
