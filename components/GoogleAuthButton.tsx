"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// One-click "Continue with Google" button (Auth.js / NextAuth).
//
// Redirects to Google, then back to /api/auth/callback/google, then to
// the dashboard. Works for both new and returning users — the account is
// created from the verified Google email on first sign-in.
//
// Requires AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET in .env (from Google Cloud
// Console). No phone number or SMS involved.
export default function GoogleAuthButton({
  label = "Continue with Google",
  callbackUrl = "/dashboard",
}: {
  label?: string;
  callbackUrl?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl });
      }}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-sage/40 bg-white px-5 py-3.5 text-sm font-semibold text-charcoal shadow-sm transition-colors hover:bg-soft-cream disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84c.86-2.6 3.29-4.51 6.15-4.51Z"
        />
      </svg>
      {loading ? "Connecting…" : label}
    </button>
  );
}
