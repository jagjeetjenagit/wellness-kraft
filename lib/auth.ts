import { auth as getSession } from "@/auth";
import { hasAuth, hasDatabase } from "./config";
import { getPrisma } from "./prisma";

// Normalized signed-in user. Previously this was Clerk's User type;
// now it's derived from the Google (Auth.js) session, but the shape the
// rest of the app relies on (email, name, firstName) is preserved.
export type AppUser = {
  id: string; // stable Google account id (sub)
  email: string;
  name: string;
  firstName: string;
  image?: string;
};

// Safe wrapper: returns null instead of crashing when Google login
// isn't configured or nobody is signed in.
export async function getSafeUser(): Promise<AppUser | null> {
  if (!hasAuth()) return null;
  try {
    const session = await getSession();
    const u = session?.user;
    if (!u) return null;
    const id = (u as { id?: string }).id || u.email || "";
    if (!id) return null;
    const name = u.name || "";
    return {
      id,
      email: u.email || "",
      name,
      firstName: name.split(" ")[0] || "",
      image: u.image || undefined,
    };
  } catch {
    return null;
  }
}

function userEmail(u: AppUser): string {
  return u.email || "";
}

function userPhone(_u: AppUser): string {
  // Google sign-in never supplies a phone number.
  return "";
}

// Is the signed-in person an admin?
// Admin = their Google email is listed in ADMIN_EMAILS in .env.
export async function isAdmin(): Promise<boolean> {
  // Local preview before login is set up: admin stays open in
  // development only, so the client can see it. Locked in production.
  if (!hasAuth()) return process.env.NODE_ENV === "development";

  const user = await getSafeUser();
  if (!user) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const email = userEmail(user).toLowerCase();
  return !!email && adminEmails.includes(email);
}

// Everything the booking widget needs to know about the visitor, resolved
// on the server: whether login is even configured, whether they're signed
// in, and their name/email (from Google) plus any phone we've saved before.
// Google never gives us a phone, so we collect it once and reuse it.
export async function getBookingIdentity(): Promise<{
  authEnabled: boolean;
  signedIn: boolean;
  name: string;
  email: string;
  phone: string;
}> {
  const authEnabled = hasAuth();
  const blank = { authEnabled, signedIn: false, name: "", email: "", phone: "" };
  if (!authEnabled) return blank;

  const user = await getSafeUser();
  if (!user) return blank;

  await ensureDbUser(user);

  let phone = "";
  if (hasDatabase()) {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const row = await prisma.user.findUnique({
          where: { clerkId: user.id },
          select: { phone: true },
        });
        phone = row?.phone || "";
      } catch {
        // ignore — phone just stays empty and we'll ask for it
      }
    }
  }

  return { authEnabled: true, signedIn: true, name: user.name, email: user.email, phone };
}

// The Expert record whose login email matches the signed-in user, if any.
// This is what powers the expert self-service portal (/studio).
export async function getExpertForUser() {
  if (!hasDatabase()) return null;
  const user = await getSafeUser();
  if (!user?.email) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    return await prisma.expert.findFirst({
      where: { email: { equals: user.email, mode: "insensitive" }, active: true },
    });
  } catch {
    return null;
  }
}

// Has this person already paid for a consultation with this expert that
// hasn't been scheduled yet? Used to skip the payment step so they never
// pay twice — they go straight to picking a time.
export async function hasUnlinkedPaidConsult(
  email: string,
  expertId: string | null
): Promise<boolean> {
  if (!email || !hasDatabase()) return false;
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    const existing = await prisma.consultPayment.findFirst({
      where: {
        status: "PAID",
        bookingId: null,
        customerEmail: { equals: email, mode: "insensitive" },
        expertId: expertId ?? null,
      },
    });
    return !!existing;
  } catch {
    return false;
  }
}

// Keep a copy of the signed-in user in our own database (created on
// first visit to the dashboard). Returns the database user id.
// The `clerkId` column is reused to store the Google account id, so no
// database migration is needed.
export async function ensureDbUser(user: AppUser): Promise<string | null> {
  if (!hasDatabase()) return null;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        name: user.name || undefined,
        email: user.email || undefined,
      },
      create: {
        clerkId: user.id,
        name: user.name || "",
        email: user.email || "",
        phone: "",
      },
    });
    return dbUser.id;
  } catch {
    return null;
  }
}

export { userEmail, userPhone };
