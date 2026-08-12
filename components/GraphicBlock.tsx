import fs from "fs";
import path from "path";

// A drop-in image slot for the marketing pages.
//
// Graceful degradation (the site's core rule): if the image file hasn't
// been added yet, this renders a branded, labelled placeholder that tells
// the client exactly which file to drop in — so the layout never looks
// broken and the client can fill slots one at a time.
//
// To fill a slot: save the generated image to the path shown in the
// placeholder (e.g. public/graphics/hero.jpg). See IMAGE-PROMPTS.md at the
// project root for the ready-made prompt + size for every slot.
export default function GraphicBlock({
  src,
  alt,
  label,
  className = "",
  rounded = "rounded-3xl",
}: {
  src: string; // web path under /public, e.g. "/graphics/hero.jpg"
  alt: string;
  label?: string; // friendly name shown in the empty-slot placeholder
  className?: string; // sizing/aspect classes, e.g. "aspect-[4/5]"
  rounded?: string;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (exists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`w-full object-cover ${rounded} shadow-card ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 border border-dashed border-sage/40 bg-gradient-to-br from-soft-cream to-sage/15 p-6 text-center ${rounded} ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-9 w-9 text-olive/40"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 18 5-5 3.5 3.5L16 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-semibold text-olive">{label ?? "Image"}</p>
      <p className="text-xs text-charcoal/50">
        Add <code className="rounded bg-white/70 px-1 py-0.5 text-[11px]">public{src}</code>
      </p>
    </div>
  );
}
