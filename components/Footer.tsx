import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-14 bg-olive text-white sm:mt-20">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4">
        <div>
          {/* Full stacked lockup on a cream block (JPEG has no transparency;
              the dark footer needs the reversed cream logo once provided). */}
          <Logo variant="stacked" className="w-36" />
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Verified experts. Medically-tested wellness products. Honest
            guidance for everyday health.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white/50">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/experts" className="text-white/80 hover:text-white">Find an Expert</Link></li>
            <li><Link href="/shop" className="text-white/80 hover:text-white">Shop Products</Link></li>
            <li><Link href="/about" className="text-white/80 hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white/50">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/sign-in" className="text-white/80 hover:text-white">Sign in</Link></li>
            <li><Link href="/dashboard" className="text-white/80 hover:text-white">My bookings & orders</Link></li>
            <li><Link href="/cart" className="text-white/80 hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white/50">Trust</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>✓ Verified expert credentials</li>
            <li>✓ Batch-tested products</li>
            <li>✓ Secure payments via Razorpay</li>
            <li>✓ Data kept private</li>
          </ul>
        </div>
      </div>

      {/* Compliance disclaimer — final wording to be provided by the
          business owner, who is responsible for medical claims and licensing. */}
      <div className="border-t border-white/10">
        {/* Extra bottom padding only exists on phones with a gesture bar (env() is 0 elsewhere) */}
        <div className="container-x pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <p className="text-xs leading-relaxed text-white/50">
            <strong className="text-white/70">Health disclaimer:</strong> Products sold on this
            website support general wellness and are not intended to diagnose, treat, cure or
            prevent any disease. Consultations do not replace emergency medical care — for
            emergencies contact your nearest hospital. Information on this site is general in
            nature; always follow the personalised advice of a qualified professional.
          </p>
          <p className="mt-4 text-xs text-white/40">
            © {new Date().getFullYear()} Wellness Kraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
