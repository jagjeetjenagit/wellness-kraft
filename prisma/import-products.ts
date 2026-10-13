import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS } from "../lib/sample-data";

// Adds (or updates) the real Wellness Kraft products in the database.
// Safe to run more than once: matches by slug and refreshes the details.
// Does NOT touch experts, orders or any other product.
//
//   npm run products:import
//
// Run it with the production DATABASE_URL in .env to update the live site.
const prisma = new PrismaClient();

async function main() {
  for (const p of SAMPLE_PRODUCTS) {
    const { stock, ...details } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      // Keep whatever stock the admin has set on existing products.
      update: { ...details, active: true },
      create: { ...p, active: true },
    });
    console.log(`✓ ${p.name}`);
  }
  console.log("Done. Edit prices, stock and photos any time in /admin.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
