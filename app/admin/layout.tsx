import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { hasClerk, hasDatabase } from "@/lib/config";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Admin area</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            This area is for the site owner
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-sage">
            Sign in with an admin account to manage experts, products, orders
            and bookings. Admins are set in the <code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">.env</code>{" "}
            file (<code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code> /{" "}
            <code className="rounded bg-soft-cream px-1.5 py-0.5 text-xs">ADMIN_PHONES</code>) — README step 2.
          </p>
          <Link href="/sign-in" className="btn-primary mt-6">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      {!hasClerk() && (
        <div className="mb-6 rounded-2xl border border-sage/40 bg-soft-cream p-4 text-sm font-semibold text-sage">
          ⚠️ Preview: the admin area is open because login (Clerk) isn&apos;t configured
          yet. In production it locks automatically. See README step 2.
        </div>
      )}
      {!hasDatabase() && (
        <div className="mb-6 rounded-2xl border border-alert/40 bg-alert/10 p-4 text-sm font-semibold text-alert">
          No database connected yet — changes can&apos;t be saved. Connect Neon
          (README step 3) to manage real data.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Store management</h1>
        </div>
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
