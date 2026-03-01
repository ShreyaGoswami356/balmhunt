import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "BRAND";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "BRAND";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "USER" | "BRAND";
  }
}
