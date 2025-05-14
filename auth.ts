import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { slugify } from "@/lib/slug";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token["id"] = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token["id"] && session.user) {
        session.user.id = token["id"] as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;

      const base = slugify(user.name ?? user.email.split("@")[0] ?? "board");
      let slug = base || "board";
      let suffix = 0;

      while (await db.board.findUnique({ where: { slug } })) {
        suffix += 1;
        slug = `${base}-${suffix}`;
      }

      await db.board.create({
        data: {
          slug,
          name: user.name ? `${user.name}'s board` : "My board",
          ownerId: user.id,
        },
      });
    },
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Resend({ from: process.env["EMAIL_FROM"] }), // Resend needs PrismaAdapter — kept here only, not in auth.config
    Credentials({
      id: "demo",
      credentials: {},
      async authorize() {
        if (process.env["DEMO_MODE"] !== "true") return null;
        const demoEmail = "demo@upvoted.app";
        let user = await db.user.findUnique({ where: { email: demoEmail } });
        if (!user) {
          user = await db.user.create({
            data: { email: demoEmail, name: "Demo User", emailVerified: new Date() },
          });
          await db.board.create({
            data: { slug: "demo", name: "Demo board", description: "Try Upvoted with a pre-seeded board.", ownerId: user.id },
          });
        }
        return user;
      },
    }),
  ],
});
