import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const providers: NextAuthConfig["providers"] = [GitHub];

if (process.env["E2E_TEST_MODE"] === "true") {
  providers.push(
    Credentials({
      id: "e2e",
      name: "E2E Test Login",
      credentials: { email: { type: "text" } },
      async authorize(credentials) {
        if (process.env["E2E_TEST_MODE"] !== "true") return null;
        const email = credentials?.email;
        if (typeof email !== "string" || !email.includes("@")) return null;

        // Lazy import to keep auth.config edge-safe in non-test envs
        const { db } = await import("@/lib/db");
        const { slugify } = await import("@/lib/slug");

        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({
            data: { email, name: email.split("@")[0], emailVerified: new Date() },
          });
          const base = slugify(user.name ?? "board");
          let slug = base || "board";
          let suffix = 0;
          while (await db.board.findUnique({ where: { slug } })) {
            suffix += 1;
            slug = `${base}-${suffix}`;
          }
          await db.board.create({
            data: { slug, name: `${user.name}'s board`, ownerId: user.id },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  );
}

export default {
  providers,
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
} satisfies NextAuthConfig;
