import { isDemoMode } from "@/lib/data";

// Small notice shown while no database is connected yet.
// Hidden by default; set NEXT_PUBLIC_SHOW_DEMO_BANNER="true" to bring it back.
export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_BANNER !== "true") return null;
  if (!isDemoMode()) return null;
  return (
    <div className="border-b border-gold/30 bg-gold/10">
      <div className="container-x py-2 text-center text-xs font-semibold text-ink-soft">
        Preview mode: showing sample data. Connect your database (README step 3)
        to manage real experts, products and orders.
      </div>
    </div>
  );
}
