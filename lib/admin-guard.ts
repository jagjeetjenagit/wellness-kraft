import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { getPrisma } from "./prisma";
import type { PrismaClient } from "@prisma/client";

// Shared check for all admin API routes: must be an admin AND
// have a database connected. Returns an error response, or the
// Prisma client when everything is fine.

export async function adminGuard(): Promise<
  { error: NextResponse; prisma?: undefined } | { error?: undefined; prisma: PrismaClient }
> {
  if (!(await isAdmin())) {
    return {
      error: NextResponse.json(
        { error: "You need admin access for this." },
        { status: 403 }
      ),
    };
  }
  const prisma = getPrisma();
  if (!prisma) {
    return {
      error: NextResponse.json(
        { error: "No database connected yet — see README step 3." },
        { status: 503 }
      ),
    };
  }
  return { prisma };
}
