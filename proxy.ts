import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const user = (req.auth as { user?: { email?: string | null } } | null)?.user;
  const isAuthed = !!user;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/settings");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isProtected && !isAuthed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Board visibility check: must run before streaming begins so the 404 status
  // can be set before the response headers are sent (Next.js 16 streams 200 otherwise).
  if (pathname.startsWith("/b/")) {
    const slug = pathname.split("/")[2]; // /b/<slug>/...
    if (slug && slug !== "-") {
      try {
        const url = new URL(`/api/board-visibility?slug=${encodeURIComponent(slug)}`, req.url);
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (res.ok) {
          const { isPublic } = (await res.json()) as { isPublic: boolean };
          if (!isPublic) {
            return new NextResponse(null, { status: 404 });
          }
        }
      } catch {
        // On network error, fall through and let the page handle it
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
