import { PrismaClient } from "@prisma/client";
import {
  SAMPLE_EXPERTS,
  SAMPLE_PRODUCTS,
  SAMPLE_RECOMMENDATIONS,
} from "../lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample products...");
  for (const p of SAMPLE_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("Seeding sample experts...");
  for (const e of SAMPLE_EXPERTS) {
    const recommended = SAMPLE_RECOMMENDATIONS[e.slug] || [];
    await prisma.expert.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        ...e,
        products: {
          connect: recommended.map((slug) => ({ slug })),
        },
      },
    });
  }

  console.log("Done! Sample experts and products are in your database.");
  console.log("You can edit or replace them any time from the /admin area.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
