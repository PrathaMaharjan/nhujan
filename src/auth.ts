import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, creds.email as string),
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          creds.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // Auto log out after 2 hours (in seconds)
  },
  jwt: {
    maxAge: 2 * 60 * 60, // JWT token lifespan: 2 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});