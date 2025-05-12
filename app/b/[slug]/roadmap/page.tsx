import { notFound } from "next/navigation";
import Link from "next/link";
import { getBoardBySlug } from "@/server/queries/boards";
import { getBoardRoadmap, type RoadmapPost } from "@/server/queries/roadmap";
import { STATUS_LABELS } from "@/lib/constants";
import { ChevronUp, MessageSquare } from "lucide-react";
import type { PostStatusValue } from "@/lib/validators/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) return { title: "Not found" };
  return { title: `Roadmap · ${board.name}` };
}

const COLUMNS: PostStatusValue[] = ["PLANNED", "IN_PROGRESS", "DONE"];

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board || !board.isPublic) notFound();

  const roadmap = await getBoardRoadmap(board.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 border-b pb-6">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Link href={`/b/${slug}`} className="hover:text-foreground">
            {board.name}
          </Link>
          <span>/</span>
          <span>Roadmap</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Roadmap</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map((status) => {
          const items = roadmap[status as keyof typeof roadmap];
          return (
            <div key={status}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-xs">
                    Nothing here yet.
                  </div>
                ) : (
                  items.map((p: RoadmapPost) => (
                    <Link
                      key={p.id}
                      href={`/b/${slug}/posts/${p.id}`}
                      className="bg-card hover:border-foreground/20 block rounded-md border p-3 transition"
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
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
