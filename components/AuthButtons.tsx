"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Login / account controls in the header.
// If Clerk isn't configured yet, we show a plain link (the sign-in
// page explains what to set up) instead of crashing.
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function AuthButtons() {
  if (!clerkEnabled) {
    return (
      // On phones "Sign in" lives in the hamburger menu instead,
      // so the 320px header never overflows.
      <Link
        href="/sign-in"
        className="hidden text-sm font-semibold text-ink-soft hover:text-pine sm:block"
      >
        Sign in
      </Link>
    );
  }
  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="hidden text-sm font-semibold text-ink-soft hover:text-pine sm:block"
        >
          My account
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="hidden text-sm font-semibold text-ink-soft hover:text-pine sm:block"
        >
          Sign in
        </Link>
      </SignedOut>
    </>
  );
}
