import { isDemoMode } from "@/lib/data";

// Small notice shown while no database is connected yet.
// Hidden by default; set NEXT_PUBLIC_SHOW_DEMO_BANNER="true" to bring it back.
export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_BANNER !== "true") return null;
  if (!isDemoMode()) return null;
  return (
    <div className="border-b border-sage/30 bg-soft-cream">
      <div className="container-x py-2 text-center text-xs font-semibold text-sage">
        Preview mode: showing sample data. Connect your database (README step 3)
        to manage real experts, products and orders.
      </div>
    </div>
  );
}
