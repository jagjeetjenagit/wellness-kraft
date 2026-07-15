import { PrismaClient } from "@prisma/client";

// Single shared Prisma client. Returns null when no database is
// configured yet, so callers can fall back to demo data instead
// of crashing.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
