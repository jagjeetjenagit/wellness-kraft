"use client";

import { useEffect, useState } from "react";

const OPEN_BEFORE_MS = 10 * 60 * 1000; // link opens 10 min before start
const OPEN_AFTER_MS = 60 * 60 * 1000; // stays joinable up to 60 min after start

// Live join control: shows a countdown until the call opens, then an active
// "Join video call" link from 10 minutes before the start until an hour after.
export default function JoinCall({
  startTime,
  meetUrl,
}: {
  startTime: string;
  meetUrl: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startTime).getTime();
  const openAt = start - OPEN_BEFORE_MS;
  const closeAt = start + OPEN_AFTER_MS;

  if (now > closeAt) {
    return <span className="mt-1 inline-block text-xs font-semibold text-sage/60">This consultation has ended</span>;
  }

  if (now >= openAt) {
    return (
      <a
        href={meetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-2 inline-flex !py-2 text-sm"
      >
        🎥 Join video call now
      </a>
    );
  }

  return (
    <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-soft-cream px-3 py-1.5 text-xs font-semibold text-sage">
      <span aria-hidden="true">⏳</span>
      Join link opens in {formatCountdown(openAt - now)}
    </span>
  );
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
