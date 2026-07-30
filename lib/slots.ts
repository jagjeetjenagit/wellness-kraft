// Native consultation scheduling — no external calendar.
// Generates bookable time slots and the per-booking video link.
//
// Defaults (sensible for an India wellness practice; can be made
// per-expert later): Mon–Sat, 10:00–18:00 IST, 30-minute slots, 14 days out.

export const SLOT_TZ = "Asia/Kolkata";
const OFFSET = "+05:30";
const DAY_START = 10; // first slot 10:00
const DAY_END = 18; // last slot starts 17:30
const SLOT_MIN = 30;
const DAYS_AHEAD = 14;

const pad = (n: number) => String(n).padStart(2, "0");

// YYYY-MM-DD for "today + offsetDays" in IST.
function istDateString(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: SLOT_TZ });
}

// All candidate slot start instants for the booking window (future, Mon–Sat).
export function generateSlotStarts(): Date[] {
  const now = Date.now();
  const out: Date[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = istDateString(i);
    const weekday = new Date(`${day}T12:00:00${OFFSET}`).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: SLOT_TZ,
    });
    if (weekday === "Sunday") continue;
    for (let h = DAY_START; h < DAY_END; h++) {
      for (let m = 0; m < 60; m += SLOT_MIN) {
        const dt = new Date(`${day}T${pad(h)}:${pad(m)}:00${OFFSET}`);
        if (dt.getTime() > now) out.push(dt);
      }
    }
  }
  return out;
}

export function isValidSlot(start: Date): boolean {
  if (isNaN(start.getTime())) return false;
  return generateSlotStarts().some((s) => s.getTime() === start.getTime());
}

export function dayLabel(dt: Date): string {
  return dt.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: SLOT_TZ,
  });
}

export function timeLabel(dt: Date): string {
  return dt.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: SLOT_TZ,
  });
}

export interface SlotGroup {
  date: string; // YYYY-MM-DD (IST)
  label: string; // "Fri, 1 Aug"
  slots: { iso: string; time: string; taken: boolean }[];
}

export function buildSlotGroups(starts: Date[], bookedMs: Set<number>): SlotGroup[] {
  const groups: Record<string, SlotGroup> = {};
  for (const dt of starts) {
    const key = dt.toLocaleDateString("en-CA", { timeZone: SLOT_TZ });
    if (!groups[key]) groups[key] = { date: key, label: dayLabel(dt), slots: [] };
    groups[key].slots.push({
      iso: dt.toISOString(),
      time: timeLabel(dt),
      taken: bookedMs.has(dt.getTime()),
    });
  }
  return Object.values(groups);
}

// Deterministic private video room for a booking (Jitsi — free, no setup).
export function meetUrlFor(bookingId: string): string {
  return `https://meet.jit.si/WellnessKraft-${bookingId}`;
}
