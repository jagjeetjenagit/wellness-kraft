import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Signed-in-only areas. Everything else is public.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

const clerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// If Clerk isn't set up yet, the site still works (pages show
// friendly "connect Clerk" notices instead of crashing).
export default clerkConfigured
  ? clerkMiddleware((auth, req) => {
      if (isProtectedRoute(req)) auth().protect();
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
