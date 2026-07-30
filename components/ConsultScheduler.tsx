"use client";

import { useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";
import { useRouter } from "next/navigation";

// Mounted once on the dashboard when the customer has paid consultations that
// still need a time slot. It initialises the Cal popup (so any button with a
// data-cal-link opens the calendar) and listens once for a successful booking,
// recording it via /api/consult/booked — which links the existing payment, so
// the customer never pays twice.
export default function ConsultScheduler({
  userName,
  userEmail,
  phone,
}: {
  userName: string;
  userEmail: string;
  phone: string;
}) {
  const router = useRouter();
  const ctx = useRef({ userName, userEmail, phone });
  ctx.current = { userName, userEmail, phone };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi();
        if (cancelled) return;
        cal("ui", { theme: "light", styles: { branding: { brandColor: "#334720" } } });
        cal("on", {
          action: "bookingSuccessful",
          callback: (e: { detail?: { data?: Record<string, unknown> } }) => {
            const data = (e?.detail?.data ?? {}) as Record<string, unknown>;
            const bk = ((data.booking as Record<string, unknown>) ?? data) as Record<string, unknown>;
            const startTime = (bk.startTime ?? data.date ?? data.startTime ?? null) as string | null;
            const uid = (bk.uid ?? data.uid ?? "") as string;
            const c = ctx.current;
            fetch("/api/consult/booked", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid,
                startTime,
                name: c.userName,
                email: c.userEmail,
                phone: c.phone,
              }),
            })
              .catch(() => {})
              // Give the record a moment to save, then refresh so the booking
              // appears and the "awaiting" card disappears.
              .finally(() => setTimeout(() => router.refresh(), 1500));
          },
        });
      } catch {
        // Embed not ready — nothing to do.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
