import Link from "next/link";
import { ChevronUp, MessageSquare } from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants";
import type { RoadmapPost } from "@/server/queries/roadmap";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  roadmap: Record<"PLANNED" | "IN_PROGRESS" | "DONE", RoadmapPost[]>;
  // Max cards per column; omit to show everything (full roadmap page)
  limit?: number;
};

const COLUMNS = [
  { status: "PLANNED", dot: "bg-blue-500", bar: "border-t-blue-500" },
  { status: "IN_PROGRESS", dot: "bg-amber-500", bar: "border-t-amber-500" },
  { status: "DONE", dot: "bg-emerald-500", bar: "border-t-emerald-500" },
] as const;

// Planned / In progress / Done side by side. On phones the columns become a
// swipeable row (scroll-snap) instead of stacking into one long list.
export function RoadmapColumns({ slug, roadmap, limit }: Props) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
      {COLUMNS.map(({ status, dot, bar }) => {
        const items = roadmap[status];
        const shown = limit ? items.slice(0, limit) : items;
        const extra = items.length - shown.length;
        return (
          <section
            key={status}
            className={cn(
              "bg-muted/40 w-[82%] shrink-0 snap-start rounded-xl border border-t-4 p-3 md:w-auto",
              bar,
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className={cn("h-2 w-2 rounded-full", dot)} />
                {STATUS_LABELS[status]}
              </h3>
              <span className="text-muted-foreground bg-background rounded-full border px-2 text-xs tabular-nums">
                {items.length}
              </span>
            </div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-muted-foreground bg-background rounded-md border border-dashed p-6 text-center text-xs">
                  Nothing here yet.
                </div>
              ) : (
                shown.map((p) => (
                  <Link
                    key={p.id}
                    href={`/b/${slug}/posts/${p.id}`}
                    className="bg-card hover:border-foreground/20 block rounded-lg border p-3 shadow-xs transition"
                  >
                    <p className="leading-snug font-medium">{p.title}</p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{p.content}</p>
                    <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <ChevronUp className="h-3 w-3" /> {p._count.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {p._count.comments}
                      </span>
                    </div>
                  </Link>
                ))
              )}
              {extra > 0 && (
                <Link
                  href={`/b/${slug}/roadmap`}
                  className="text-muted-foreground hover:text-foreground block px-1 pt-1 text-xs"
                >
                  +{extra} more
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
