"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminExpert {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  bio: string;
  credentials: string[];
  rating: number;
  reviewCount: number;
  calLink: string;
  featured: boolean;
  active: boolean;
  products: { id: string }[];
}

interface ProductOption {
  id: string;
  name: string;
}

const EMPTY = {
  name: "",
  specialty: "",
  photo: "",
  bio: "",
  credentials: "",
  rating: "5",
  reviewCount: "0",
  calLink: "",
  featured: false,
  active: true,
};

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>(EMPTY);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [expertsRes, productsRes] = await Promise.all([
        fetch("/api/experts"),
        fetch("/api/products"),
      ]);
      const expertsData = await expertsRes.json();
      if (!expertsRes.ok) throw new Error(expertsData.error || "Could not load experts.");
      setExperts(expertsData);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProductOptions(productsData.map((p: ProductOption) => ({ id: p.id, name: p.name })));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load experts.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm(EMPTY);
    setSelectedProducts([]);
    setEditing("new");
  };

  const startEdit = (ex: AdminExpert) => {
    setForm({
      name: ex.name,
      specialty: ex.specialty,
      photo: ex.photo,
      bio: ex.bio,
      credentials: ex.credentials.join(", "),
      rating: String(ex.rating),
      reviewCount: String(ex.reviewCount),
      calLink: ex.calLink,
      featured: ex.featured,
      active: ex.active,
    });
    setSelectedProducts(ex.products.map((p) => p.id));
    setEditing(ex.id);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing === "new" ? "/api/experts" : `/api/experts/${editing}`,
        {
          method: editing === "new" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, productIds: selectedProducts }),
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
    if (!confirm(`Delete ${name} permanently? (You can also mark them Inactive.)`)) return;
    const res = await fetch(`/api/experts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not delete.");
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-semibold">Experts ({experts.length})</h2>
        <button onClick={startNew} className="btn-primary">+ Add expert</button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {editing && (
        <form onSubmit={save} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <h3 className="font-display text-xl font-semibold sm:col-span-2">
            {editing === "new" ? "New expert" : "Edit expert"}
          </h3>
          <div>
            <label className="label">Full name (with Dr. if applicable)</label>
            <input required className="input" value={String(form.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Specialty</label>
            <input required className="input" placeholder="e.g. Clinical Nutritionist" value={String(form.specialty)} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Photo link (optional — a nice placeholder shows if empty)</label>
            <input className="input" placeholder="https://example.com/photo.jpg" value={String(form.photo)} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">
              Cal.com link — the part after cal.com/ (e.g. priya-sharma/consultation)
            </label>
            <input className="input" placeholder="username/event-name" value={String(form.calLink)} onChange={(e) => setForm({ ...form, calLink: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bio (their story, approach, who they help)</label>
            <textarea rows={4} className="input resize-y" value={String(form.bio)} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Credentials — separated by commas</label>
            <input className="input" placeholder="MBBS, MD (Dermatology), 10+ years in practice" value={String(form.credentials)} onChange={(e) => setForm({ ...form, credentials: e.target.value })} />
          </div>
          <div>
            <label className="label">Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" className="input" value={String(form.rating)} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>
          <div>
            <label className="label">Number of reviews</label>
            <input type="number" min="0" className="input" value={String(form.reviewCount)} onChange={(e) => setForm({ ...form, reviewCount: e.target.value })} />
          </div>

          {productOptions.length > 0 && (
            <div className="sm:col-span-2">
              <label className="label">Products this expert recommends (shown on their profile)</label>
              <div className="grid gap-2 rounded-xl border border-sage/30 bg-cream p-4 sm:grid-cols-2">
                {productOptions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-charcoal/75">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-olive"
                      checked={selectedProducts.includes(p.id)}
                      onChange={(e) =>
                        setSelectedProducts((prev) =>
                          e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                        )
                      }
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            {(
              [
                ["featured", "Show on the home page"],
                ["active", "Visible on the site"],
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
              {saving ? "Saving…" : "Save expert"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading experts…</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-sage/30 text-xs uppercase tracking-wider text-sage/70">
              <tr>
                <th className="p-4">Expert</th>
                <th className="p-4">Booking link</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {experts.map((ex) => (
                <tr key={ex.id} className="border-b border-sage/30/60 last:border-0">
                  <td className="p-4">
                    <p className="font-semibold text-charcoal">{ex.name}</p>
                    <p className="text-xs text-sage/70">{ex.specialty}</p>
                  </td>
                  <td className="p-4">
                    {ex.calLink ? (
                      <span className="badge bg-soft-cream text-olive">cal.com/{ex.calLink}</span>
                    ) : (
                      <span className="badge bg-alert/10 text-alert">Not connected</span>
                    )}
                  </td>
                  <td className="p-4 text-sage">
                    ★ {ex.rating.toFixed(1)} ({ex.reviewCount})
                  </td>
                  <td className="p-4">
                    {ex.active ? (
                      <span className="badge bg-soft-cream text-olive">Live</span>
                    ) : (
                      <span className="badge bg-soft-cream text-sage/70">Hidden</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(ex)} className="font-semibold text-olive hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(ex.id, ex.name)} className="ml-4 font-semibold text-alert hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {experts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sage">
                    No experts yet — click &ldquo;+ Add expert&rdquo; to create the first profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
