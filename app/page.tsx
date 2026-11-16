import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronUp,
  Inbox,
  Link2,
  ListChecks,
  Lock,
  Map,
  MessageSquare,
  Rocket,
  Workflow,
} from "lucide-react";

const LIVE_DEMO_URL = "https://upvoted.arealjagema.com";

const PREVIEW_POSTS = [
  { title: "Google Calendar sync for due dates", votes: 22, status: "In progress", tone: "amber", tag: "Integration", comments: 3 },
  { title: "Recurring tasks", votes: 20, status: "Planned", tone: "blue", tag: "Feature", comments: 2 },
  { title: "Task dependencies", votes: 18, status: "Planned", tone: "blue", tag: "Feature", comments: 1 },
  { title: "Offline mode in the mobile app", votes: 15, status: "Open", tone: "slate", tag: "Feature", comments: 1 },
] as const;

const TONES = {
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-100 text-emerald-700",
} as const;

const FEATURES = [
  {
    icon: ChevronUp,
    title: "One-click upvotes",
    description: "One vote per person, so the ranking reflects real demand instead of the loudest customer.",
  },
  {
    icon: MessageSquare,
    title: "Threaded discussion",
    description: "Ask follow-up questions on any request and reply as the team, right where the idea lives.",
  },
  {
    icon: Workflow,
    title: "Status workflow",
    description: "Move ideas from Open to Planned, In progress and Done. Everyone sees the change instantly.",
  },
  {
    icon: Map,
    title: "Public roadmap",
    description: "A roadmap that builds itself from your statuses. No separate doc to keep up to date.",
  },
  {
    icon: BarChart3,
    title: "Owner dashboard",
    description: "Totals, status breakdown and your most-wanted requests on a single screen.",
  },
  {
    icon: Lock,
    title: "Public or private",
    description: "Open your board to the world or keep it private while you collect early feedback.",
  },
] as const;

const STEPS = [
  {
    icon: Link2,
    title: "Create your board",
    description: "Sign up with Google or email and you get a board at your own link in seconds.",
  },
  {
    icon: Inbox,
    title: "Share the link",
    description: "Put it in your app, your docs or your newsletter. Users post ideas and vote on others.",
  },
  {
    icon: Rocket,
    title: "Ship what matters",
    description: "Sort by votes, set a status, and your roadmap tells users their feedback was heard.",
  },
] as const;

const FAQ = [
  {
    q: "Who can post and vote?",
    a: "Anyone with a free account. Signing up takes a few seconds with Google or email, and it keeps votes honest: one person, one vote.",
  },
  {
    q: "Do my users need to install anything?",
    a: "No. Your board is a regular web page at its own link. Share it anywhere you talk to customers.",
  },
  {
    q: "Can I keep my board private?",
    a: "Yes. Switch the board to private in Settings and it disappears from the public web until you turn it back on.",
  },
  {
    q: "How do users find out an idea shipped?",
    a: "Every status change shows on the board and on your public roadmap, so voters can follow along without asking.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a href="#features" className="text-muted-foreground hover:text-foreground hidden px-3 py-2 md:inline">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground hidden px-3 py-2 md:inline">
              How it works
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground hidden px-3 py-2 md:inline">
              FAQ
            </a>
            <Link href="/login" className="text-muted-foreground hover:text-foreground px-3 py-2">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,var(--color-indigo-100),transparent_65%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Know exactly what to build next.
              </h1>
              <p className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty">
                Upvoted gives your users one place to share ideas and vote on what matters.
                You get a ranked list of requests and a public roadmap that shows customers you
                listened.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get started free <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {["Set up in under a minute", "No widget to install", "Sign up with Google or email"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <Check className="text-primary h-4 w-4" /> {t}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <BoardPreview />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y bg-slate-50/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Feedback is everywhere. Decisions shouldn&apos;t be guesswork.
              </h2>
              <p className="text-muted-foreground mt-4">
                Requests arrive through support tickets, sales calls, Slack threads and tweets. The
                same idea shows up five times in five places, and the quiet majority never gets
                counted. Upvoted collects it in one board and lets your users rank it for you.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                ["Scattered", "Ideas buried in inboxes and chat"],
                ["Duplicated", "The same request logged again and again"],
                ["Unranked", "No way to tell what most people want"],
                ["Silent", "Customers never hear what happened"],
              ].map(([title, text]) => (
                <li key={title} className="bg-background rounded-xl border p-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="From scattered requests to a clear roadmap"
            description="Three steps, no setup calls and nothing to install."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border p-6">
                <span className="text-muted-foreground/60 absolute top-5 right-6 text-sm font-semibold tabular-nums">
                  0{i + 1}
                </span>
                <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t bg-slate-50/70">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <SectionHeading
              eyebrow="Features"
              title="Everything you need to listen at scale"
              description="Focused on the essentials, so your team spends time building instead of configuring."
            />
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-slate-200/70 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-background p-6">
                  <f.icon className="text-primary h-5 w-5" />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap showcase */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-primary text-sm font-semibold">Close the loop</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              A roadmap your customers can actually follow
            </h2>
            <p className="text-muted-foreground mt-4">
              When you mark a request as Planned, In progress or Done, it moves on your public
              roadmap automatically. Voters see progress on the ideas they care about, and your team
              stops answering &ldquo;any update on this?&rdquo;
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href={`${LIVE_DEMO_URL}/b/planhive/roadmap`}>
                View an example roadmap <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <RoadmapPreview />
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
            <div className="mt-10 divide-y rounded-2xl border">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-6 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0 rotate-180 transition group-open:rotate-0" />
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="bg-primary text-primary-foreground mx-auto max-w-6xl rounded-3xl px-6 py-14 text-center sm:px-12">
            <ListChecks className="mx-auto h-8 w-8 opacity-80" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
              Start collecting feedback today
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-80">
              Create your board in under a minute and share the link with your users.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                  Get started free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <Logo className="text-foreground" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <Link href={LIVE_DEMO_URL} className="hover:text-foreground">Live demo</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground">Get started</Link>
          </nav>
          <p>© {new Date().getFullYear()} Upvoted</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-primary text-sm font-semibold">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {description && <p className="text-muted-foreground mt-3">{description}</p>}
    </div>
  );
}

// Static illustration of a board, styled like the real /b/[slug] page
function BoardPreview() {
  return (
    <div className="relative">
      <div className="bg-background overflow-hidden rounded-2xl border shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center gap-1.5 border-b bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="text-muted-foreground bg-background ml-3 truncate rounded-md border px-3 py-0.5 text-xs">
            upvoted.app/b/your-product
          </span>
        </div>
        <div className="p-4 sm:p-5 sm:pb-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">Your product — Feedback</p>
              <p className="text-muted-foreground text-xs">Sorted by most voted</p>
            </div>
            <span className="bg-primary text-primary-foreground shrink-0 rounded-md px-2.5 py-1 text-xs font-medium">
              + Suggest an idea
            </span>
          </div>
          <ul className="space-y-2.5">
            {PREVIEW_POSTS.map((p, i) => (
              <li key={p.title} className="flex items-center gap-3 rounded-lg border p-3">
                <span
                  className={
                    i === 0
                      ? "border-primary bg-primary/10 text-primary flex w-11 shrink-0 flex-col items-center rounded-md border py-1 text-xs"
                      : "text-muted-foreground flex w-11 shrink-0 flex-col items-center rounded-md border py-1 text-xs"
                  }
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span className="font-semibold tabular-nums">{p.votes}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                    <span className="text-primary">{p.tag}</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="h-3 w-3" /> {p.comments}
                    </span>
                  </p>
                </div>
                <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${TONES[p.tone]}`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-background absolute -bottom-6 -left-4 hidden rounded-xl border p-3 shadow-lg sm:block">
        <p className="text-muted-foreground text-[11px] font-medium uppercase">This month</p>
        <p className="mt-0.5 text-sm">
          <span className="font-semibold tabular-nums">199</span> votes ·{" "}
          <span className="font-semibold tabular-nums">20</span> ideas
        </p>
      </div>
    </div>
  );
}

function RoadmapPreview() {
  const columns = [
    { name: "Planned", tone: "blue", items: ["Recurring tasks", "Task dependencies", "Trello import"] },
    { name: "In progress", tone: "amber", items: ["Google Calendar sync", "Slack notifications"] },
    { name: "Done", tone: "emerald", items: ["Dark mode", "Subtasks"] },
  ] as const;

  return (
    <div className="grid gap-3 rounded-2xl border bg-slate-50/70 p-4 sm:grid-cols-3">
      {columns.map((c) => (
        <div key={c.name}>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${TONES[c.tone]}`}>
            {c.name}
          </span>
          <ul className="mt-3 space-y-2">
            {c.items.map((item) => (
              <li key={item} className="bg-background rounded-lg border px-3 py-2.5 text-sm shadow-xs">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
