"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/experts", label: "Experts" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors sm:py-1.5 ${
            pathname === l.href
              ? "border-pine bg-pine text-white"
              : "border-sand bg-white text-ink-soft hover:border-pine hover:text-pine"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
