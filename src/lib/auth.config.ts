import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.objectId = user.objectId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "ADMIN" | "STAFF";
        session.user.objectId = (token.objectId as string | null) ?? null;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      if (path.startsWith("/admin")) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }
      if (path.startsWith("/report")) {
        return isLoggedIn && auth.user.role === "STAFF";
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
