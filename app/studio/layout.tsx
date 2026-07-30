import type { Metadata } from "next";
import Link from "next/link";
import { getExpertForUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Expert Studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const expert = await getExpertForUser();

  if (!expert) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
        <div className="card max-w-lg p-8 text-center">
          <p className="eyebrow">Expert Studio</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">This area is for our experts</h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
            Sign in with the Google email registered on your expert profile to manage your
            consultations. If you&apos;re an expert and can&apos;t get in, ask the admin to add
            your login email to your profile.
          </p>
          <Link href="/" className="btn-primary mt-6">Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <p className="eyebrow">Expert Studio</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Hello, {expert.name}</h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}
