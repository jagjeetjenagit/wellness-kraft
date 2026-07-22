"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("sent");
      } else {
        setErrorMsg(data.error || "Could not send your message right now.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Could not send your message. Please check your connection.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <span className="text-3xl" aria-hidden="true">✅</span>
        <h2 className="mt-3 font-display text-xl font-semibold">Message sent!</h2>
        <p className="mt-2 text-sm text-charcoal/75">
          Thanks, {form.name.split(" ")[0]}. We usually reply within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-4 p-6">
      <div>
        <label htmlFor="c-name" className="label">Your name</label>
        <input
          id="c-name"
          required
          autoComplete="name"
          className="input"
          placeholder="e.g. Anita Desai"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input
            id="c-email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="c-phone" className="label">Phone (optional)</label>
          <input
            id="c-phone"
            type="tel"
            autoComplete="tel"
            className="input"
            placeholder="+91 98123 45678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">How can we help?</label>
        <textarea
          id="c-message"
          required
          rows={5}
          className="input resize-y"
          placeholder="Tell us a little about what you're looking for…"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {status === "error" && (
        <p className="rounded-xl border border-alert/30 bg-alert/10 p-3 text-sm font-semibold text-alert">
          {errorMsg}
        </p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
