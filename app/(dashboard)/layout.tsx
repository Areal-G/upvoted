import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { DEMO_EMAIL } from "@/lib/demo/data";
import { ExternalLink, LayoutDashboard, Map, MessageSquare, Settings, LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const board = await db.board.findUnique({ where: { ownerId: session.user.id } });
  if (!board) redirect("/login"); // edge case: user created but board missing

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    // Below md the sidebar becomes a top bar: logo and sign out on one row,
    // then every link in a single row that scrolls sideways. A fixed 240px
    // column left phones a sliver for the page itself.
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-muted/30 border-b p-4 md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-start justify-between gap-3 px-2 md:mb-6 md:block">
          <div className="min-w-0">
            <Logo href="/dashboard" />
            <p className="text-muted-foreground mt-1 truncate pl-9 text-xs">{board.name}</p>
          </div>
          <form action={signOutAction} className="md:hidden">
            <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:mt-0 md:block md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          <nav className="flex shrink-0 gap-1 text-sm md:block md:space-y-1">
            <Link href="/dashboard" className="hover:bg-muted flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>
            <Link href="/posts" className="hover:bg-muted flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2">
              <MessageSquare className="h-4 w-4" /> Posts
            </Link>
            <Link href="/settings" className="hover:bg-muted flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </nav>

          <p className="text-muted-foreground mt-6 mb-1 hidden px-3 text-xs font-medium tracking-wide uppercase md:block">
            Public pages
          </p>
          <nav className="flex shrink-0 gap-1 text-sm md:block md:space-y-1" aria-label="Public pages">
            <Link href={`/b/${board.slug}`} target="_blank" className="hover:bg-muted flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2">
              <MessageSquare className="h-4 w-4" /> Feedback board
              <ExternalLink className="text-muted-foreground ml-auto h-3 w-3" />
            </Link>
            <Link href={`/b/${board.slug}/roadmap`} target="_blank" className="hover:bg-muted flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2">
              <Map className="h-4 w-4" /> Roadmap
              <ExternalLink className="text-muted-foreground ml-auto h-3 w-3" />
            </Link>
          </nav>
        </div>

        <form action={signOutAction} className="mt-6 hidden border-t pt-4 md:block">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        {session.user.email === DEMO_EMAIL && (
          <div className="bg-primary/5 border-primary/15 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm md:px-8">
            <p>
              <span className="font-medium">You&apos;re exploring the demo.</span>{" "}
              <span className="text-muted-foreground">
                Try anything, it resets when you reload. Ready for your own board?
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        )}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
