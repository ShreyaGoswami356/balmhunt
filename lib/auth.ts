import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const DEMO_USERS = [
  { id: "demo-ava", email: "ava@balmhunt.dev", name: "Ava Lane", role: "USER" as const, password: "password123" },
  { id: "demo-mia", email: "mia@balmhunt.dev", name: "Mia Ross", role: "USER" as const, password: "password123" },
  { id: "demo-nora", email: "nora@balmhunt.dev", name: "Nora Kim", role: "USER" as const, password: "password123" },
  { id: "demo-brand", email: "brand@balmhunt.dev", name: "Brand Demo", role: "BRAND" as const, password: "password123" },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "balmhunt-preview-secret",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.toLowerCase();

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch {
          const demoUser = DEMO_USERS.find((user) => user.email === email && user.password === credentials.password);
          if (!demoUser) return null;

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "USER" | "BRAND";
      }
      return session;
    },
  },
};
