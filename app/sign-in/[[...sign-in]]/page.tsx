import type { Metadata } from "next";
import Link from "next/link";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { hasAuth } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

// Auth.js sends failed sign-ins back here as ?error=<code>.
// https://authjs.dev/reference/core/errors
const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Google login is misconfigured on the server. Check AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET, and that this site's /api/auth/callback/google URL is listed under Authorized redirect URIs in Google Cloud Console.",
  AccessDenied: "Access was denied. Please try again with a different Google account.",
  Verification: "This sign-in link has expired. Please try again.",
  OAuthSignin: "Couldn't start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in didn't complete. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  Callback: "Google sign-in didn't complete. Please try again.",
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string | string[]; callbackUrl?: string | string[] };
}) {
  const errorCode = [searchParams?.error].flat()[0];
  const errorMessage = errorCode
    ? ERROR_MESSAGES[errorCode] || "Sign-in failed. Please try again."
    : "";
  const rawCallback = [searchParams?.callbackUrl].flat()[0] || "";
  // Only follow same-site paths after login.
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";

  if (!hasAuth()) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Almost there</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            Login isn&apos;t switched on yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
            To enable Google login, add your Google OAuth keys to the{" "}
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
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          Sign in to Wellness Kraft
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
          Use your Google account to access your bookings, orders and
          consultations.
        </p>
        {errorMessage && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-800"
          >
            {errorMessage}
          </p>
        )}
        <div className="mt-6">
          <GoogleAuthButton label="Continue with Google" callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-xs text-charcoal/60">
          New here? Signing in with Google creates your account automatically.{" "}
          <Link href="/sign-up" className="font-semibold text-olive hover:underline">
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
