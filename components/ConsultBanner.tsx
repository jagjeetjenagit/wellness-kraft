// Code-drawn banner for a consultation card (no image file needed).
//
// Shown in place of a photo whenever a consultation has none uploaded.
// Picks the Fitness look when the name/specialty mentions fitness,
// otherwise the Health look. Uploading a photo in /admin/experts still
// overrides it.

type Kind = "health" | "fitness";

const CONTENT: Record<Kind, { title: string; tags: string[] }> = {
  health: {
    title: "Health",
    tags: ["Diet & lifestyle", "Natural remedies", "Follow-up"],
  },
  fitness: {
    title: "Fitness",
    tags: ["Workout plan", "Nutrition", "Follow-up"],
  },
};

export function consultKind(text: string): Kind {
  return /fit|workout|gym|strength|train/i.test(text) ? "fitness" : "health";
}

function HealthArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full" aria-hidden="true">
      {/* heart */}
      <path
        d="M60 98S20 74 20 46c0-12 9-22 21-22 8 0 15 4 19 11 4-7 11-11 19-11 12 0 21 10 21 22 0 28-40 52-40 52Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* leaf inside */}
      <path
        d="M60 82c-12-8-15-22-6-34 12 2 18 12 14 26M60 82c2-10 4-18 8-26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FitnessArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full" aria-hidden="true">
      {/* dumbbell */}
      <rect x="16" y="42" width="12" height="36" rx="4" stroke="currentColor" strokeWidth="3" />
      <rect x="92" y="42" width="12" height="36" rx="4" stroke="currentColor" strokeWidth="3" />
      <rect x="28" y="50" width="10" height="20" rx="3" stroke="currentColor" strokeWidth="3" />
      <rect x="82" y="50" width="10" height="20" rx="3" stroke="currentColor" strokeWidth="3" />
      <path d="M38 60h44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* pulse line */}
      <path
        d="M20 96h24l6-10 8 18 8-26 6 18h28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConsultBanner({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const kind = consultKind(name);
  const { title, tags } = CONTENT[kind];

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden p-6 text-cream sm:p-8 ${
        kind === "fitness"
          ? "bg-gradient-to-br from-olive via-[#3f5728] to-[#5a6f3f]"
          : "bg-gradient-to-br from-olive via-[#3a5226] to-success"
      } ${className}`}
      role="img"
      aria-label={`${name} banner`}
    >
      {/* soft decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cream/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fresh-sage/20" aria-hidden="true" />

      <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-cream/70">
        1-on-1 Consultation
      </p>

      <div className="relative mx-auto h-24 w-24 text-cream/90 sm:h-28 sm:w-28">
        {kind === "fitness" ? <FitnessArt /> : <HealthArt />}
      </div>

      <div className="relative">
        <p className="font-display text-3xl font-semibold leading-none sm:text-4xl">{title}</p>
        <p className="mt-1 text-sm text-cream/75">Consultation</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-cream/25 bg-cream/10 px-3 py-1 text-xs font-semibold text-cream/90"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
