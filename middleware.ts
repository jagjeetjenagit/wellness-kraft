import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Signed-in-only areas. Everything else is public.
function isProtected(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio")
  );
}

const authConfigured = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

// If Google login isn't set up yet, the site still works (pages show
// friendly "connect Google" notices instead of crashing).
export default authConfigured
  ? auth((req) => {
      if (isProtected(req.nextUrl.pathname) && !req.auth) {
        const url = new URL("/sign-in", req.nextUrl.origin);
        url.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
