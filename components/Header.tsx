"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthButtons from "./AuthButtons";
import Logo from "./Logo";
import { useCart } from "./cart/CartProvider";

const NAV = [
  { href: "/experts", label: "Experts" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-paper/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="Wellness Kraft home">
          {/* Horizontal lockup on desktop, icon-only on mobile (per Logo-Usage-Brief) */}
          <Logo variant="horizontal" className="hidden sm:flex" />
          <Logo variant="icon" className="h-10 w-10 sm:hidden" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition-colors hover:text-pine ${
                pathname === item.href ? "text-pine" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <AuthButtons />
          <Link
            href="/cart"
            className="relative rounded-full p-2.5 text-ink-soft transition-colors hover:bg-pine-light hover:text-pine sm:p-2"
            aria-label={`Cart, ${ready ? count : 0} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 5h2l2.4 11.2a1.5 1.5 0 0 0 1.47 1.18h7.6a1.5 1.5 0 0 0 1.46-1.15L20.7 9H7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10.5" cy="20.5" r="1.2" fill="currentColor" />
              <circle cx="17.5" cy="20.5" r="1.2" fill="currentColor" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link href="/experts" className="btn-primary hidden !px-5 !py-2.5 lg:inline-flex">
            Book a Consultation
          </Link>
          <button
            className="rounded-lg p-2.5 text-ink-soft md:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-sand bg-paper md:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-pine-light hover:text-pine"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-pine-light hover:text-pine"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-pine-light hover:text-pine"
            >
              My bookings &amp; orders
            </Link>
            <Link
              href="/experts"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              Book a Consultation
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
