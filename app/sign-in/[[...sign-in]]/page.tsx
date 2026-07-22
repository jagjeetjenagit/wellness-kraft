import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function SignInPage() {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkEnabled) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Almost there</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Login isn&apos;t switched on yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
            To enable phone-OTP login, add your two Clerk keys to the{" "}
            <code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">.env</code> file —
            it takes about 5 minutes. Full walkthrough in the README,{" "}
            <strong>step&nbsp;&ldquo;2) Set up login (Clerk)&rdquo;</strong>.
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
      <SignIn />
    </div>
  );
}
