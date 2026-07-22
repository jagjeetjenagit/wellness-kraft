import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="section-title mt-3">That page doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-md text-sage">
        The link may be old or mistyped. Everything you need is one click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/experts" className="btn-primary">
          Book a consultation
        </Link>
        <Link href="/shop" className="btn-secondary">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
