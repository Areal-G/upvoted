import { notFound } from "next/navigation";
import Link from "next/link";
import { getBoardBySlug } from "@/server/queries/boards";
import { getBoardRoadmap } from "@/server/queries/roadmap";
import { RoadmapColumns } from "@/components/board/roadmap-columns";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) return { title: "Not found" };
  return { title: `Roadmap · ${board.name}` };
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board || !board.isPublic) notFound();

  const roadmap = await getBoardRoadmap(board.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 border-b pb-6">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Link href={`/b/${slug}`} className="hover:text-foreground">
            {board.name}
          </Link>
          <span>/</span>
          <span>Roadmap</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          Ideas move here as the team plans, builds and ships them.
        </p>
      </header>

      <RoadmapColumns slug={slug} roadmap={roadmap} />
    </main>
  );
}
