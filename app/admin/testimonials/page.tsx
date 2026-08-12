"use client";

import { useCallback, useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  photo: string;
  videoUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

const EMPTY: Omit<Testimonial, "id"> = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  photo: "",
  videoUrl: "",
  featured: true,
  active: true,
  sortOrder: 0,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load testimonials.");
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load testimonials.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const startEdit = (t: Testimonial) => {
    const { id: _id, ...rest } = t;
    void _id;
    setForm(rest);
    setEditing(t.id);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please add the customer's name.");
      return;
    }
    if (!form.quote.trim() && !form.videoUrl.trim()) {
      setError("Add a written quote or a video (or both).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing === "new" ? "/api/testimonials" : `/api/testimonials/${editing}`,
        {
          method: editing === "new" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
    setSaving(false);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the testimonial from "${name}" permanently?`)) return;
    const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not delete.");
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Testimonials ({items.length})</h2>
        <button onClick={startNew} className="btn-primary">+ Add testimonial</button>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-charcoal/75">
        Real customer stories shown on the home page. Add a written quote, a portrait
        (9:16) video, or both. Keep language to lifestyle/wellness experiences — no
        disease-cure claims.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {editing && (
        <form onSubmit={save} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <h3 className="font-display text-lg font-semibold sm:col-span-2">
            {editing === "new" ? "New testimonial" : "Edit testimonial"}
          </h3>

          <div>
            <label className="label">Customer name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Location / goal (optional)</label>
            <input
              className="input"
              placeholder="e.g. Pune · Weight management"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Quote / story</label>
            <textarea
              rows={4}
              className="input resize-y"
              placeholder="What did they experience? (Leave blank if it's a video-only testimonial.)"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Rating</label>
            <select
              className="input"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Order (lower shows first)</label>
            <input
              type="number"
              className="input"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">Photo (optional — also used as the video cover)</label>
            <ImageUploader
              value={form.photo ? [form.photo] : []}
              onChange={(urls) => setForm({ ...form, photo: urls[0] || "" })}
              folder="testimonials"
              max={1}
              outSize={400}
            />
          </div>
          <div>
            <label className="label">Video (optional, 9:16)</label>
            <VideoUploader
              value={form.videoUrl}
              onChange={(url) => setForm({ ...form, videoUrl: url })}
            />
          </div>

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            {(
              [
                ["featured", "Show on the home page"],
                ["active", "Visible (untick to hide without deleting)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-semibold text-sage">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="h-4 w-4 accent-olive"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save testimonial"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading testimonials…</p>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sage">
          No testimonials yet — click &ldquo;+ Add testimonial&rdquo; to add your first story.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="card flex flex-col p-4">
              <div className="flex items-start gap-3">
                {t.videoUrl ? (
                  <video
                    src={t.videoUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-20 w-[45px] shrink-0 rounded-lg border border-sage/30 object-cover"
                  />
                ) : t.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-12 w-12 shrink-0 rounded-full border border-sage/30 object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal">{t.name}</p>
                  {t.location && <p className="text-xs text-sage/70">{t.location}</p>}
                  <p className="text-xs text-olive">{"★".repeat(t.rating)}</p>
                </div>
              </div>
              {t.quote && (
                <p className="mt-3 line-clamp-3 text-sm text-charcoal/75">{t.quote}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.videoUrl && <span className="badge bg-soft-cream text-olive">Video</span>}
                {t.featured ? (
                  <span className="badge bg-soft-cream text-olive">On home page</span>
                ) : (
                  <span className="badge bg-soft-cream text-sage/70">Not featured</span>
                )}
                {!t.active && <span className="badge bg-soft-cream text-sage/70">Hidden</span>}
              </div>
              <div className="mt-4 flex gap-4 border-t border-sage/20 pt-3 text-sm">
                <button onClick={() => startEdit(t)} className="font-semibold text-olive hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => remove(t.id, t.name)}
                  className="font-semibold text-alert hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
