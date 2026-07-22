"use client";

import { useEffect, useState, useCallback } from "react";
import { formatINR } from "@/lib/utils";

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  images: string[];
  consultRecommended: boolean;
  featured: boolean;
  active: boolean;
}

const EMPTY = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  category: "",
  description: "",
  images: "",
  consultRecommended: false,
  featured: false,
  active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load products.");
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
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

  const startEdit = (p: AdminProduct) => {
    setForm({
      name: p.name,
      sku: p.sku,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      description: p.description,
      images: p.images.join("\n"),
      consultRecommended: p.consultRecommended,
      featured: p.featured,
      active: p.active,
    });
    setEditing(p.id);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing === "new" ? "/api/products" : `/api/products/${editing}`,
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
    if (!confirm(`Delete "${name}" permanently? (You can also just mark it Inactive.)`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not delete.");
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-semibold">Products ({products.length})</h2>
        <button onClick={startNew} className="btn-primary">+ Add product</button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {editing && (
        <form onSubmit={save} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <h3 className="font-display text-xl font-semibold sm:col-span-2">
            {editing === "new" ? "New product" : "Edit product"}
          </h3>
          <div className="sm:col-span-2">
            <label className="label">Product name</label>
            <input required className="input" value={String(form.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Price (₹, whole number)</label>
            <input required type="number" min="1" className="input" value={String(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Stock (units available)</label>
            <input required type="number" min="0" className="input" value={String(form.stock)} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" placeholder="e.g. Supplements" value={String(form.category)} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="label">SKU (your product code — leave blank to auto-generate)</label>
            <input className="input" value={String(form.sku)} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea rows={4} className="input resize-y" value={String(form.description)} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image links — one per line (first one is the main photo)</label>
            <textarea
              rows={3}
              className="input resize-y"
              placeholder={"https://example.com/photo-front.jpg\nhttps://example.com/photo-back.jpg"}
              value={String(form.images)}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
            <p className="mt-1 text-xs text-sage/70">
              Tip: upload photos free at postimages.org, then paste the &ldquo;Direct link&rdquo; here.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            {(
              [
                ["consultRecommended", "Recommend a consultation with this product"],
                ["featured", "Show on the home page"],
                ["active", "Visible in the shop"],
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
              {saving ? "Saving…" : "Save product"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading products…</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sage/30 text-xs uppercase tracking-wider text-sage/70">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-sage/30/60 last:border-0">
                  <td className="p-4">
                    <p className="font-semibold text-charcoal">{p.name}</p>
                    <p className="text-xs text-sage/70">SKU {p.sku}</p>
                  </td>
                  <td className="p-4 font-semibold">{formatINR(p.price)}</td>
                  <td className="p-4">
                    {p.stock <= 0 ? (
                      <span className="badge bg-alert text-white">Out of stock</span>
                    ) : p.stock <= 5 ? (
                      <span className="badge bg-alert/10 text-alert">Low: {p.stock} left</span>
                    ) : (
                      <span className="badge bg-soft-cream text-olive">{p.stock} in stock</span>
                    )}
                  </td>
                  <td className="p-4 text-sage">{p.category}</td>
                  <td className="p-4">
                    {p.active ? (
                      <span className="badge bg-soft-cream text-olive">Live</span>
                    ) : (
                      <span className="badge bg-soft-cream text-sage/70">Hidden</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(p)} className="font-semibold text-olive hover:underline">
                      Edit
                    </button>
                    <button onClick={() => remove(p.id, p.name)} className="ml-4 font-semibold text-alert hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sage">
                    No products yet — click &ldquo;+ Add product&rdquo; to create your first one.
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
