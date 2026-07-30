// Native consultation scheduling — no external calendar.
// Generates bookable time slots and the per-booking video link.
//
// Defaults (sensible for an India wellness practice; can be made
// per-expert later): Mon–Sat, 10:00–18:00 IST, 30-minute slots, 14 days out.

export const SLOT_TZ = "Asia/Kolkata";
const OFFSET = "+05:30";
const DAYS_AHEAD = 14;

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAY_NUM: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// A single expert's bookable window (all times IST).
export interface SlotConfig {
  days: number[]; // weekday numbers, 0=Sun..6=Sat
  startHour: number; // first slot hour
  endHour: number; // last slot starts before this hour
  slotMins: number; // slot length
}

export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  days: [1, 2, 3, 4, 5, 6], // Mon–Sat
  startHour: 10,
  endHour: 18,
  slotMins: 30,
};

export function parseAvailDays(s: string): number[] {
  return (s || "")
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 6);
}

// Build a SlotConfig from an expert record (falls back to defaults).
export function configFromExpert(
  e: { availDays?: string; startHour?: number; endHour?: number; slotMins?: number } | null
): SlotConfig {
  if (!e) return DEFAULT_SLOT_CONFIG;
  const days = parseAvailDays(e.availDays || "");
  const startHour = Number.isFinite(e.startHour) ? (e.startHour as number) : DEFAULT_SLOT_CONFIG.startHour;
  const endHour = Number.isFinite(e.endHour) ? (e.endHour as number) : DEFAULT_SLOT_CONFIG.endHour;
  const slotMins = e.slotMins && e.slotMins > 0 ? e.slotMins : DEFAULT_SLOT_CONFIG.slotMins;
  return {
    days: days.length ? days : DEFAULT_SLOT_CONFIG.days,
    startHour: Math.max(0, Math.min(23, startHour)),
    endHour: Math.max(1, Math.min(24, endHour)),
    slotMins,
  };
}

// YYYY-MM-DD for "today + offsetDays" in IST.
function istDateString(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: SLOT_TZ });
}

// All candidate slot start instants for the booking window (future, within cfg).
export function generateSlotStarts(cfg: SlotConfig = DEFAULT_SLOT_CONFIG): Date[] {
  const now = Date.now();
  const out: Date[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = istDateString(i);
    const weekdayName = new Date(`${day}T12:00:00${OFFSET}`).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: SLOT_TZ,
    });
    if (!cfg.days.includes(WEEKDAY_NUM[weekdayName])) continue;
    for (let h = cfg.startHour; h < cfg.endHour; h++) {
      for (let m = 0; m < 60; m += cfg.slotMins) {
        const dt = new Date(`${day}T${pad(h)}:${pad(m)}:00${OFFSET}`);
        if (dt.getTime() > now) out.push(dt);
      }
    }
  }
  return out;
}

export function isValidSlot(start: Date, cfg: SlotConfig = DEFAULT_SLOT_CONFIG): boolean {
  if (isNaN(start.getTime())) return false;
  return generateSlotStarts(cfg).some((s) => s.getTime() === start.getTime());
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
