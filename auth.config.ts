import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Google verifies email ownership, so a Google sign-in may attach to an existing
// password account with the same email instead of failing.
const providers: NextAuthConfig["providers"] = [
  Google({ allowDangerousEmailAccountLinking: true }),
];

export default {
  providers,
  pages: {
    signIn: "/login",
  },
  // The demo deploys with AUTH_SECRET only: trust the host header set by the platform's
  // proxy instead of requiring AUTH_URL or AUTH_TRUST_HOST.
  trustHost: true,
} satisfies NextAuthConfig;
