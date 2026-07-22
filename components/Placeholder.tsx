import { initials } from "@/lib/utils";

// Branded placeholders shown until the client uploads real photos.
// They look intentional, not broken.

export function ExpertPhoto({
  name,
  photo,
  className = "",
}: {
  name: string;
  photo: string;
  className?: string;
}) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={`Photo of ${name}`}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-olive to-olive ${className}`}
      role="img"
      aria-label={`Placeholder portrait for ${name}`}
    >
      <span className="font-display text-4xl font-semibold text-white/90">
        {initials(name)}
      </span>
    </div>
  );
}

export function ProductImage({
  name,
  image,
  className = "",
  large = false,
}: {
  name: string;
  image?: string;
  className?: string;
  large?: boolean;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-soft-cream to-sage/30 ${className}`}
      role="img"
      aria-label={`Product image placeholder for ${name}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`text-olive/40 ${large ? "h-20 w-20" : "h-10 w-10"}`}
        aria-hidden="true"
      >
        <path
          d="M12 21C7 17 4.5 13 6 8c4 .5 7 2 8.5 5M12 21c1-5 4-9 8-11-1 6-3.5 9.5-8 11Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
