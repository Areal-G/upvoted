import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronUp, MessageSquare, Map, ArrowRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Upvoted
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/b/demo" className="text-muted-foreground hover:text-foreground">
              Demo
            </Link>
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-primary text-sm font-medium">Open source · Built with Next.js 16</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Ship what your users actually want.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
            Upvoted is a minimalist feedback board. Collect ideas, let users vote, share a
            public roadmap.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/b/demo">View live demo</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted/30 border-t">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 py-20 md:grid-cols-3">
            <Feature
              icon={<MessageSquare className="h-5 w-5" />}
              title="Public board"
              description="Anyone with the link can submit ideas. Authenticated users post, comment, vote."
            />
            <Feature
              icon={<ChevronUp className="h-5 w-5" />}
              title="Upvote what matters"
              description="One vote per user. Optimistic UI. Sort by votes to surface what your users want most."
            />
            <Feature
              icon={<Map className="h-5 w-5" />}
              title="Public roadmap"
              description="Planned, in progress, done. Three columns auto-generated from your post statuses."
            />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm">
          <span>Upvoted · MIT</span>
          <a
            href="https://github.com/areal/Upvoted"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground flex items-center gap-1.5"
          >
            <FaGithub className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
