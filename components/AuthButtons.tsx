"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

// Login / account controls in the header.
// When nobody is signed in (or Google login isn't configured yet) we
// show a plain "Sign in" link — the sign-in page explains any setup that
// is still needed instead of crashing.
export default function AuthButtons() {
  const { data: session, status } = useSession();

  // Avoid a flash of the wrong control while the session resolves.
  if (status === "loading") {
    return <div className="hidden h-5 w-16 sm:block" aria-hidden="true" />;
  }

  if (session?.user) {
    const name = session.user.name || session.user.email || "Account";
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="hidden max-w-[10rem] truncate text-sm font-semibold text-sage hover:text-olive sm:block"
          title={name}
        >
          My account
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden text-sm font-semibold text-sage/80 hover:text-olive sm:block"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="hidden text-sm font-semibold text-sage hover:text-olive sm:block"
    >
      Sign in
    </Link>
  );
}
