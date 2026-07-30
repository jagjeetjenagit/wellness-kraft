"use client";

import { useState } from "react";

// Lets an expert write the prescription & advice AND recommend products for
// one of their bookings, from the Expert Studio. Saved via
// /api/studio/prescription (server checks the booking belongs to them). The
// customer sees the advice plus a "Buy" button per recommended product.
export default function StudioPrescription({
  bookingId,
  initial,
  products,
  initialProductIds,
}: {
  bookingId: string;
  initial: string;
  products: { id: string; name: string }[];
  initialProductIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initial);
  const [selected, setSelected] = useState<string[]>(initialProductIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/studio/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, prescription: text, productIds: selected }),
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

  const hasContent = !!initial || initialProductIds.length > 0;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-semibold text-olive hover:underline"
      >
        {hasContent ? "Edit prescription & advice" : "+ Add prescription & advice"}
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

      {products.length > 0 && (
        <div className="mt-4">
          <p className="label">Recommend products (customer gets a Buy button)</p>
          <div className="mt-1 grid gap-1.5 rounded-xl border border-sage/30 bg-cream p-3 sm:grid-cols-2">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-charcoal/75">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-olive"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      )}

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
