import type { NextAuthConfig } from "next-auth";

/**
 * Config Auth.js partagée par le runtime Edge (middleware) et Node (route handlers).
 * Ne PAS importer Prisma ici — Prisma ne tourne pas en Edge.
 */
export const authConfig = {
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnEscort = nextUrl.pathname.startsWith("/escort");
      const isOnPost = nextUrl.pathname.startsWith("/poster-une-annonce");
      const isOnAuth =
        nextUrl.pathname.startsWith("/connexion") || nextUrl.pathname.startsWith("/inscription");

      if (isOnAdmin) {
        return isLoggedIn && (role === "ADMIN" || role === "MODERATOR");
      }
      if (isOnEscort) {
        return isLoggedIn && (role === "ESCORT" || role === "ADMIN");
      }
      if (isOnPost) {
        return isLoggedIn;
      }
      if (isOnAuth && isLoggedIn) {
        const dest = role === "ADMIN" ? "/admin" : role === "ESCORT" ? "/escort/dashboard" : "/";
        return Response.redirect(new URL(dest, nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [], // déclarés dans auth.ts (runtime Node)
} satisfies NextAuthConfig;
