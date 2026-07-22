import Image from "next/image";
import type { CSSProperties } from "react";

/*
 * Wellness Kraft logo — final approved mark. Do not redraw, recolor,
 * stretch, or add effects (see client-feedback/Logo-Usage-Brief.pdf).
 *
 * TODO(client assets): only the square JPEG lockup exists right now
 * (public/brand/wellness-kraft-logo.jpeg, 1254×1254, cream background),
 * so every variant sits on a solid cream #FEFAEF block to blend with the
 * site. When the client sends the formats from the brief, swap in:
 *   - transparent-background PNG → remove the cream backing blocks
 *   - SVG/vector version         → use everywhere for crisp scaling
 *   - icon-only mark             → replace the CSS crop in the "icon"
 *                                  variant and the favicon (app/icon.svg)
 *   - cream reversed version     → for dark backgrounds (footer)
 *
 * Clear space rule: keep padding around the mark roughly equal to the
 * height of the circular "head" element (~8% of the logo's height).
 */

const LOGO_SRC = "/brand/wellness-kraft-logo.jpeg";

type LogoProps = {
  variant?: "horizontal" | "stacked" | "icon";
  className?: string;
};

// Frames just the figure/leaf mark (no wordmark) out of the square lockup.
// The mark spans ≈ x 24–76%, y 19–69% of the file, hence 192% zoom.
const iconCrop: CSSProperties = {
  backgroundImage: `url(${LOGO_SRC})`,
  backgroundSize: "192% auto",
  backgroundPosition: "50% 37.5%",
  backgroundRepeat: "no-repeat",
};

export default function Logo({ variant = "horizontal", className = "" }: LogoProps) {
  if (variant === "stacked") {
    // Full lockup as shipped; p-3 ≈ the clear-space rule at footer size.
    return (
      <span className={`inline-block rounded-xl bg-cream p-3 ${className}`}>
        <Image
          src={LOGO_SRC}
          alt="Wellness Kraft"
          width={1254}
          height={1254}
          className="h-auto w-full"
        />
      </span>
    );
  }

  if (variant === "icon") {
    return (
      <span
        aria-hidden="true"
        className={`block rounded-md bg-cream ${className}`}
        style={iconCrop}
      />
    );
  }

  // horizontal: cropped mark + wordmark as live text (serif, wide tracking,
  // deep olive #334720 — exact logo hex per the brief).
  // TODO(client assets): replace the text with the real horizontal lockup
  // once an SVG / transparent PNG is provided.
  return (
    <span className={`items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className="block h-9 w-9 shrink-0 rounded-md bg-cream"
        style={iconCrop}
      />
      <span className="whitespace-nowrap font-display text-xl font-semibold uppercase tracking-[0.18em] text-olive">
        Wellness Kraft
      </span>
    </span>
  );
}
