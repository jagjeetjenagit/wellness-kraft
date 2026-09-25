import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js (NextAuth v5) — free, self-hosted Google sign-in.
//
// No database adapter here on purpose: we use stateless JWT sessions and
// keep our own copy of the user in Postgres via lib/auth.ts's ensureDbUser.
// That keeps this file edge-safe so it can run inside middleware.
//
// Reads these env vars automatically:
//   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET  — from Google Cloud Console
//   AUTH_SECRET                         — any long random string
//
// trustHost is set in code so production doesn't fail with
// "UntrustedHost" when AUTH_TRUST_HOST is missing (Vercel previews,
// custom domains, any host behind a proxy). Set AUTH_URL to pin the
// canonical address.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    // Persist the stable Google account id (sub) onto the token so it
    // survives across requests and can key our own User table.
    jwt({ token, profile }) {
      if (profile?.sub) token.sub = profile.sub;
      return token;
    },
    // Expose that id on the session as user.id.
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
});
