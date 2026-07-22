"use client";

import Cal from "@calcom/embed-react";
import Link from "next/link";

// Inline Cal.com scheduler on each expert profile.
// If the expert's Cal link hasn't been added yet (in /admin),
// visitors see a friendly contact fallback instead of an error.
export default function BookingWidget({
  calLink,
  expertName,
}: {
  calLink: string;
  expertName: string;
}) {
  if (!calLink) {
    return (
      <div className="card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">
          Online booking coming soon for {expertName}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/75">
          This expert&apos;s calendar isn&apos;t connected yet. Send us a message and
          we&apos;ll arrange your consultation personally.
        </p>
        <Link href="/contact" className="btn-primary mt-6">
          Request a booking
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-2 sm:p-4">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%", minHeight: "620px", overflow: "auto" }}
        config={{ theme: "light", layout: "month_view" }}
      />
    </div>
  );
}
