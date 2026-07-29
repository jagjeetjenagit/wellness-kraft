import type { Metadata } from "next";
import Link from "next/link";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { hasAuth } from "@/lib/config";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function SignUpPage() {
  if (!hasAuth()) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Almost there</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            Sign-up isn&apos;t switched on yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
            To let customers create accounts, add your Google OAuth keys to the{" "}
            <code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">.env</code> file —
            it takes about 5 minutes. Full walkthrough in the README,{" "}
            <strong>step&nbsp;&ldquo;2) Set up login (Google)&rdquo;</strong>.
          </p>
          <p className="mt-3 text-sm text-charcoal/75">
            Everything else on the site works without it — browsing, cart and
            booking are all live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 text-center">
        <p className="eyebrow">Get started</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
          One click with Google — no passwords or OTPs to remember.
        </p>
        <div className="mt-6">
          <GoogleAuthButton label="Sign up with Google" />
        </div>
        <p className="mt-6 text-xs text-charcoal/60">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-olive hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
