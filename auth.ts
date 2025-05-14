import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { createDefaultBoard } from "@/lib/boards";
import { verifyPassword } from "@/lib/password";
import { signInSchema } from "@/lib/validators/auth";
import { DEMO_EMAIL } from "@/lib/demo/data";
import { resetDemoWorkspace } from "@/lib/demo/reset";

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
    // Google sign-ups get their board here; password sign-ups create it in signUp()
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      await createDefaultBoard(db, { id: user.id, name: user.name, email: user.email });
    },
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "password",
      credentials: { identifier: {}, password: {} },
      async authorize(raw) {
        const parsed = signInSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { identifier, password } = parsed.data;

        const user = await db.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }] },
        });
        if (!user?.passwordHash) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;

        return { id: user.id, email: user.email, name: user.name ?? user.username };
      },
    }),
    Credentials({
      id: "demo",
      credentials: {},
      async authorize() {
        if (process.env["DEMO_MODE"] !== "true") return null;
        let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
        if (!user) {
          await resetDemoWorkspace(db);
          user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
        }
        return user;
      },
    }),
  ],
});
