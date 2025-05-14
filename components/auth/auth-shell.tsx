import Link from "next/link";
import { Check, ChevronUp } from "lucide-react";
import { Logo } from "@/components/brand/logo";

type Props = {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

const POINTS = [
  "Your own feedback board at a shareable link",
  "Upvotes show what users want most",
  "A public roadmap that updates itself",
];

// Two-panel layout shared by the sign-in and create-account pages
export function AuthShell({ title, subtitle, footer, children }: Props) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="text-muted-foreground mt-8 text-center text-sm">{footer}</p>
        </div>
        <Link href="/" className="text-muted-foreground hover:text-foreground text-center text-xs">
          ← Back to home
        </Link>
      </div>

      <aside className="bg-primary text-primary-foreground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Let your users tell you what to build next.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm opacity-90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="text-foreground mt-12 space-y-2 rounded-2xl bg-white/95 p-4 shadow-2xl">
            {[
              ["Recurring tasks", 20, "Planned", "bg-blue-100 text-blue-700"],
              ["Google Calendar sync", 22, "In progress", "bg-amber-100 text-amber-800"],
              ["Dark mode", 24, "Done", "bg-emerald-100 text-emerald-700"],
            ].map(([title, votes, status, tone]) => (
              <div key={title} className="flex items-center gap-3 rounded-lg border bg-white p-2.5">
                <span className="text-muted-foreground flex w-10 flex-col items-center rounded-md border py-0.5 text-xs">
                  <ChevronUp className="h-3 w-3" />
                  <span className="font-semibold tabular-nums">{votes}</span>
                </span>
                <span className="flex-1 truncate text-sm font-medium">{title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
