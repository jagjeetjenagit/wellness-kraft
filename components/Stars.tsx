export default function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      {/* Olive stars — turmeric gold is reserved for bestseller tags only */}
      <span className="flex text-olive" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} viewBox="0 0 20 20" className="h-4 w-4" fill={n <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
            <path d="M10 1.8l2.47 5 5.53.8-4 3.9.94 5.5L10 14.4 5.06 17l.94-5.5-4-3.9 5.53-.8z" />
          </svg>
        ))}
      </span>
      <span className="font-semibold text-charcoal">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-sage/70">({count} reviews)</span>
      )}
    </span>
  );
}
