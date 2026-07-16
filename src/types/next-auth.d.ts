import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "STAFF" | "CASHIER";
    objectId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "CASHIER";
      objectId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "STAFF" | "CASHIER";
    objectId?: string | null;
  }
}
