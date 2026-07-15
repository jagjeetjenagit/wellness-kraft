import { currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { hasClerk, hasDatabase } from "./config";
import { getPrisma } from "./prisma";

// Safe wrapper around Clerk: returns null instead of crashing when
// Clerk isn't configured yet.
export async function getSafeUser(): Promise<ClerkUser | null> {
  if (!hasClerk()) return null;
  try {
    return await currentUser();
  } catch {
    return null;
  }
}

function userEmail(u: ClerkUser): string {
  return u.primaryEmailAddress?.emailAddress || u.emailAddresses[0]?.emailAddress || "";
}

function userPhone(u: ClerkUser): string {
  return u.primaryPhoneNumber?.phoneNumber || u.phoneNumbers[0]?.phoneNumber || "";
}

// Is the signed-in person an admin?
// Admin = listed in ADMIN_EMAILS / ADMIN_PHONES in .env, or given
// the role "admin" in the Clerk dashboard (publicMetadata).
export async function isAdmin(): Promise<boolean> {
  // Local preview before Clerk is set up: admin stays open in
  // development only, so the client can see it. Locked in production.
  if (!hasClerk()) return process.env.NODE_ENV === "development";

  const user = await getSafeUser();
  if (!user) return false;

  if ((user.publicMetadata as Record<string, unknown>)?.role === "admin") return true;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const adminPhones = (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((s) => s.replace(/[\s-]/g, ""))
    .filter(Boolean);

  const email = userEmail(user).toLowerCase();
  const phone = userPhone(user).replace(/[\s-]/g, "");

  if (email && adminEmails.includes(email)) return true;
  if (phone && adminPhones.includes(phone)) return true;
  return false;
}

// Keep a copy of the Clerk user in our own database (created on
// first visit to the dashboard). Returns the database user id.
export async function ensureDbUser(clerkUser: ClerkUser): Promise<string | null> {
  if (!hasDatabase()) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const dbUser = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        name: clerkUser.fullName || undefined,
        email: userEmail(clerkUser) || undefined,
        phone: userPhone(clerkUser) || undefined,
      },
      create: {
        clerkId: clerkUser.id,
        name: clerkUser.fullName || "",
        email: userEmail(clerkUser),
        phone: userPhone(clerkUser),
      },
    });
    return dbUser.id;
  } catch {
    return null;
  }
}

export { userEmail, userPhone };
