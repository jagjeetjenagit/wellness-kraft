"use client";

import { useEffect, useState } from "react";

interface Form {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
}

const EMPTY: Form = { metaTitle: "", metaDescription: "", keywords: "", ogImage: "" };

export default function AdminSeoPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [defaults, setDefaults] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load SEO settings.");
        setForm({
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          keywords: data.keywords || "",
          ogImage: data.ogImage || "",
        });
        setDefaults({
          metaTitle: data.defaults?.metaTitle || "",
          metaDescription: data.defaults?.metaDescription || "",
          keywords: data.defaults?.keywords || "",
          ogImage: data.defaults?.ogImage || "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load SEO settings.");
      }
      setLoading(false);
    })();
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
    setSaving(false);
  }

  const keywordCount = form.keywords.split(",").map((k) => k.trim()).filter(Boolean).length;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-semibold">SEO &amp; metadata</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
        These control how the site appears in Google and when shared on WhatsApp,
        Facebook or LinkedIn. They&apos;re not visible on the page itself — they live in
        the page&apos;s hidden <code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">&lt;head&gt;</code>.
        Leave a field blank to use the built-in default shown below it.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sage">Loading settings…</p>
      ) : (
        <div className="card mt-6 space-y-6 p-6">
          <div>
            <label className="label">Site title (search result &amp; browser tab)</label>
            <input
              className="input"
              value={form.metaTitle}
              onChange={set("metaTitle")}
              maxLength={200}
              placeholder={defaults.metaTitle}
            />
            <p className="mt-1 text-xs text-sage/70">
              Aim for 50–60 characters. Individual pages (a product, an expert) keep
              their own title — this is the default for everything else.
            </p>
          </div>

          <div>
            <label className="label">Meta description (search result snippet)</label>
            <textarea
              className="input resize-y"
              rows={3}
              value={form.metaDescription}
              onChange={set("metaDescription")}
              maxLength={400}
              placeholder={defaults.metaDescription}
            />
            <p className="mt-1 text-xs text-sage/70">
              Aim for 150–160 characters. {form.metaDescription.length} used.
            </p>
          </div>

          <div>
            <label className="label">Keywords</label>
            <textarea
              className="input resize-y"
              rows={3}
              value={form.keywords}
              onChange={set("keywords")}
              maxLength={600}
              placeholder="ayurvedic consultation, natural wellness products, nutrition expert, weight loss guidance"
            />
            <p className="mt-1 text-xs text-sage/70">
              Separate with commas. {keywordCount} keyword{keywordCount === 1 ? "" : "s"}.
              (Note: Google largely ignores the keywords tag, but it&apos;s still used by
              some search engines and it does no harm.)
            </p>
          </div>

          <div>
            <label className="label">Social share image URL</label>
            <input
              className="input"
              value={form.ogImage}
              onChange={set("ogImage")}
              placeholder="https://…/share-image.jpg"
            />
            <p className="mt-1 text-xs text-sage/70">
              Shown when the site is shared on WhatsApp/Facebook/LinkedIn. Use a
              1200×630px image. Leave blank for none.
            </p>
            {form.ogImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={form.ogImage}
                alt="Social share preview"
                className="mt-3 max-h-40 rounded-xl border border-sage/30 object-contain"
              />
            ) : null}
          </div>

          <div className="flex items-center gap-3 border-t border-sage/20 pt-5">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save SEO settings"}
            </button>
            {saved && (
              <span className="text-sm font-semibold text-success">
                Saved — live on the site now.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
