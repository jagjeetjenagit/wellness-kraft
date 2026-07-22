"use client";

// Friendly catch-all error screen — visitors never see a blank page.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="section-title mt-3">We hit a small snag.</h1>
      <p className="mt-4 max-w-md text-sage">
        This is usually temporary. Try again, or head back to the home page —
        your cart and bookings are safe.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/" className="btn-secondary">
          Go home
        </a>
      </div>
    </div>
  );
}
